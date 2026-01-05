import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path'; // Added path import
import { PolicyEngine } from './engine/policyEngine';
import { RuleEvaluator } from './engine/ruleEvaluator'; // Added RuleEvaluator import
import { Database } from './database';
import { SimulationManager } from './simulation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-secret-key-123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-456';
const BCRYPT_SALT_ROUNDS = 12;

// Brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
const PORT = 8082;
const POLICY_DIR = path.join(__dirname, '../../policies');
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

// Initialize Engine
const policyEngine = new PolicyEngine(POLICY_DIR); // PolicyEngine initialized with POLICY_DIR

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Evaluate Policy
app.post('/api/policies/evaluate', (req, res) => {
  const context = {
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    ...req.body
  };

  const result = policyEngine.evaluate(context);

  // Async Logging
  Database.insertAuditLog({
    ...context,
    allowed: result.allowed,
    status: result.status,
    reason: result.reason,
    policyId: result.policyId,
    latencyMs: result.latencyMs,
    confidence: result.confidence
  });

  if (result.status === 'deny' || result.status === 'warn') {
    const severity = result.status === 'deny' ? 'error' : 'warning';
    Database.insertAlert(severity, `Action ${result.status.toUpperCase()} for agent ${context.agentId}: ${result.reason}`);
  }

  res.json(result);
});

// Get Recent Logs (for Dashboard)
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Database.getRecentLogs(100);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// System Stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Database.getSystemStats();
    res.json(stats);
  } catch (e: any) {
    console.error('Stats Error:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Rely on policy routes
app.get('/api/policies', (req, res) => {
  res.json(policyEngine.getPolicies());
});

app.post('/api/policies', async (req, res) => {
  try {
    const policy = req.body;
    // Basic validation
    if (!policy.id || !policy.rules) {
      return res.status(400).json({ error: 'Invalid policy format' });
    }
    await Database.upsertPolicy(policy);
    await policyEngine.reloadPolicies(); // Reload in-memory
    res.json({ message: 'Policy created', policy });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/policies/:id', async (req, res) => {
  try {
    const policy = { ...req.body, id: req.params.id };
    await Database.upsertPolicy(policy);
    await policyEngine.reloadPolicies();
    res.json({ message: 'Policy updated', policy });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/policies/:id', async (req, res) => {
  try {
    await Database.deletePolicy(req.params.id);
    await policyEngine.reloadPolicies();
    res.json({ message: 'Policy deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/policies/reload', async (req, res) => {
  await policyEngine.reloadPolicies();
  res.json({ message: 'Policies reloaded from DB', count: policyEngine.getPolicies().length });
});

// --- New Phase 8 Endpoints ---

// Dry-Run Test
app.post('/api/policies/test', (req, res) => {
  try {
    const { policy, context } = req.body;
    if (!policy || !context) {
      return res.status(400).json({ error: 'Missing policy or context' });
    }
    const result = RuleEvaluator.evaluate([policy], context);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get History
app.get('/api/policies/:id/versions', async (req, res) => {
  try {
    const history = await Database.getPolicyHistory(req.params.id);
    res.json(history);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/policies/:id/logs', async (req, res) => {
  try {
    const logs = await Database.getPolicyLogs(req.params.id);
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Violations Management
app.get('/api/violations', async (req, res) => {
  try {
    const filters = {
      status: req.query.status as string,
      agentId: req.query.agentId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    };
    const result = await Database.getViolations(filters);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/violations/:id/resolve', async (req, res) => {
  try {
    const { status, comment } = req.body;
    await Database.updateViolationStatus(req.params.id, status, comment);
    res.json({ message: 'Violation updated' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Agent Lifecycle
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await Database.getAgents();
    res.json(agents);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    await Database.upsertAgent(req.body);
    res.json({ message: 'Agent registered' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    await Database.updateAgentDetails(req.params.id, req.body);
    res.json({ message: 'Agent updated' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const range = (req.query.range as '1h' | '24h' | '7d') || '24h';
    const data = await Database.getAnalytics(range);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Rollback
app.post('/api/policies/:id/rollback', async (req, res) => {
  try {
    const { version } = req.body;
    const history = await Database.getPolicyHistory(req.params.id);
    const target = history.find(h => h.version === version);

    if (!target) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const restoredPolicy = target.policy;
    await Database.upsertPolicy(restoredPolicy);
    await policyEngine.reloadPolicies();

    res.json({ message: `Rolled back to version ${version}`, policy: restoredPolicy });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- User Authentication ---

app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    // Password complexity check
    if (password.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = {
      id: userId,
      email,
      passwordHash,
      profile: profile || {},
      security: {
        lastPasswordChange: new Date().toISOString(),
        mfaEnabled: false
      },
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    await Database.upsertUser(user);

    // Track creation
    await Database.insertUserAuditLog({
      userId,
      action: 'account_created',
      field: 'all',
      newValue: 'initial_creation',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      token,
      user: { id: userId, email, profile: user.profile }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Database.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = uuidv4();
    const token = jwt.sign({ userId: user.id, email, sessionId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id, sessionId }, REFRESH_SECRET, { expiresIn: '7d' });

    // Persist session
    await Database.createSession({
      id: sessionId,
      userId: user.id,
      device: req.get('User-Agent'),
      ip: req.ip,
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token missing' });
  try {
    const payload: any = jwt.verify(refreshToken, REFRESH_SECRET);
    const token = jwt.sign({ userId: payload.userId, sessionId: payload.sessionId }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
  } catch (e) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

app.post('/api/profile/update', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { profile: newProfile } = req.body;
    const currentData = await Database.getUserByEmail(decoded.email);
    if (!currentData) return res.status(404).json({ error: 'User not found' });

    const oldProfile = currentData.profile;
    const changes: any[] = [];
    for (const key in newProfile) {
      if (newProfile[key] !== oldProfile[key]) {
        changes.push({
          userId: currentData.id, action: 'profile_update', field: key,
          oldValue: String(oldProfile[key] || ''), newValue: String(newProfile[key]),
          ip: req.ip, userAgent: req.get('User-Agent')
        });
      }
    }
    if (changes.length > 0) {
      await Database.upsertUser({ ...currentData, profile: { ...oldProfile, ...newProfile } });
      for (const log of changes) await Database.insertUserAuditLog(log);
    }
    res.json({ success: true, profile: { ...oldProfile, ...newProfile } });
  } catch (e: any) { res.status(401).json({ error: 'Invalid or expired token' }); }
});

// Start Server
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Backend running at http://localhost:${PORT}`);

    // Initialize Database & Migration
    try {
      console.log('Initializing Database...');
      await Database.init();
      console.log('Initializing Policy Engine...');
      await policyEngine.init();

      // Start Simulation
      console.log('Initializing Simulation...');
      await SimulationManager.init(policyEngine);

      console.log('System Ready.');
    } catch (e) {
      console.error('Failed to initialize system:', e);
    }
  });
}
