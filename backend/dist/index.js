"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path")); // Added path import
const policyEngine_1 = require("./engine/policyEngine");
const database_1 = require("./database");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const PORT = 8080; // Renamed port to PORT
const POLICY_DIR = path_1.default.join(__dirname, '../../policies'); // Added POLICY_DIR constant
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Initialize Engine
const policyEngine = new policyEngine_1.PolicyEngine(POLICY_DIR); // PolicyEngine initialized with POLICY_DIR
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Evaluate Policy
app.post('/api/policies/evaluate', (req, res) => {
    const context = {
        requestId: (0, uuid_1.v4)(),
        timestamp: new Date().toISOString(),
        ...req.body
    };
    const result = policyEngine.evaluate(context);
    // Async Logging
    database_1.Database.insertAuditLog({
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
        database_1.Database.insertAlert(severity, `Action ${result.status.toUpperCase()} for agent ${context.agentId}: ${result.reason}`);
    }
    res.json(result);
});
// Get Recent Logs (for Dashboard)
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await database_1.Database.getRecentLogs(100);
        res.json(logs);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});
// Reload Policies
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
        await database_1.Database.upsertPolicy(policy);
        await policyEngine.reloadPolicies(); // Reload in-memory
        res.json({ message: 'Policy created', policy });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.put('/api/policies/:id', async (req, res) => {
    try {
        const policy = { ...req.body, id: req.params.id };
        await database_1.Database.upsertPolicy(policy);
        await policyEngine.reloadPolicies();
        res.json({ message: 'Policy updated', policy });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/policies/:id', async (req, res) => {
    try {
        await database_1.Database.deletePolicy(req.params.id);
        await policyEngine.reloadPolicies();
        res.json({ message: 'Policy deleted' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/policies/reload', async (req, res) => {
    await policyEngine.reloadPolicies();
    res.json({ message: 'Policies reloaded from DB', count: policyEngine.getPolicies().length });
});
// Start Server
app.listen(PORT, async () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    // Initialize Database & Migration
    try {
        console.log('Initializing Policy Engine...');
        await policyEngine.init();
        console.log('System Ready.');
    }
    catch (e) {
        console.error('Failed to initialize system:', e);
    }
});
// WebSocket for real-time logs (Optional hook)
// ...
