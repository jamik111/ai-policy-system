import sqlite3 from 'sqlite3';
import { Logger } from './audit/logger';

const db = new sqlite3.Database('policies.db', (err) => {
    if (err) console.error('Could not connect to database', err);
});

export const Database = {
    init: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Audit Logs
                db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    request_id TEXT,
                    agent_id TEXT,
                    action_type TEXT,
                    allowed INTEGER,
                    status TEXT DEFAULT 'deny',
                    policy_id TEXT,
                    reason TEXT,
                    latency_ms REAL,
                    confidence REAL,
                    metadata TEXT
                )`);

                // Active Alerts (for dashboard)
                db.run(`CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    severity TEXT,
                    message TEXT,
                    status TEXT DEFAULT 'active'
                )`);

                // Policies Table
                db.run(`CREATE TABLE IF NOT EXISTS policies (
                    id TEXT PRIMARY KEY,
                    json TEXT,
                    is_active INTEGER DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )`);
                // Tasks Table
                db.run(`CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    agent_id TEXT,
                    type TEXT,
                    payload TEXT,
                    status TEXT,
                    timestamp TEXT,
                    FOREIGN KEY(agent_id) REFERENCES agents(id)
                )`);

                // Policy Versions Table
                db.run(`CREATE TABLE IF NOT EXISTS policy_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    policy_id TEXT,
                    json_snapshot TEXT,
                    version INTEGER,
                    created_at TEXT
                )`, (err) => {
                    if (err) reject(err);
                    else {
                        // Migration: Add new columns if they don't exist
                        const migrations = [
                            "ALTER TABLE audit_logs ADD COLUMN resolution_status TEXT DEFAULT 'open'",
                            "ALTER TABLE audit_logs ADD COLUMN resolution_comment TEXT",
                            "ALTER TABLE audit_logs ADD COLUMN resolved_at TEXT",
                            "ALTER TABLE audit_logs ADD COLUMN task_id TEXT", // New
                            // Agents new columns
                            "ALTER TABLE agents ADD COLUMN role TEXT DEFAULT 'general'",
                            "ALTER TABLE agents ADD COLUMN risk_level TEXT DEFAULT 'low'",
                            "ALTER TABLE agents ADD COLUMN task_count INTEGER DEFAULT 0"
                        ];

                        migrations.forEach(query => {
                            db.run(query, (err) => {
                                // Ignore error if column exists
                                if (err && !err.message.includes('duplicate column')) {
                                    console.warn('Migration warning:', err.message);
                                }
                            });
                        });

                        // Agents Migration (ensure table exists if strict mode)
                        db.run(`CREATE TABLE IF NOT EXISTS agents (
                            id TEXT PRIMARY KEY,
                            name TEXT,
                            role TEXT DEFAULT 'general',
                            status TEXT DEFAULT 'created',
                            capabilities TEXT,
                            risk_level TEXT DEFAULT 'low',
                            task_count INTEGER DEFAULT 0,
                            assigned_policies TEXT,
                            last_heartbeat TEXT,
                            created_at TEXT
                        )`);

                        // Users Table
                        db.run(`CREATE TABLE IF NOT EXISTS users (
                            id TEXT PRIMARY KEY,
                            email TEXT UNIQUE,
                            password_hash TEXT,
                            profile_json TEXT,
                            security_json TEXT,
                            preferences_json TEXT,
                            is_active INTEGER DEFAULT 1,
                            last_login TEXT,
                            created_at TEXT,
                            updated_at TEXT
                        )`);

                        // Sessions Table
                        db.run(`CREATE TABLE IF NOT EXISTS sessions (
                            id TEXT PRIMARY KEY,
                            user_id TEXT,
                            device TEXT,
                            location TEXT,
                            ip_address TEXT,
                            login_time TEXT,
                            last_active TEXT,
                            expires_at TEXT,
                            is_revoked INTEGER DEFAULT 0,
                            FOREIGN KEY(user_id) REFERENCES users(id)
                        )`);

                        // User Audit Log (Detailed changes)
                        db.run(`CREATE TABLE IF NOT EXISTS user_audit_logs (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id TEXT,
                            action TEXT,
                            field TEXT,
                            old_value TEXT,
                            new_value TEXT,
                            ip_address TEXT,
                            user_agent TEXT,
                            timestamp TEXT,
                            FOREIGN KEY(user_id) REFERENCES users(id)
                        )`);

                        Logger.log('Database initialized and enterprise tables verified.');
                        resolve();
                    }
                });
            });
        });
    },

    // --- AGENTS CRUD ---
    getAgents: (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM agents ORDER BY created_at DESC", (err: Error | null, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows.map(r => ({
                    ...r,
                    risk_level: r.risk_level || 'low', // Field mapping
                    role: r.role || 'general',
                    capabilities: r.capabilities ? JSON.parse(r.capabilities) : [],
                    assigned_policies: r.assigned_policies ? JSON.parse(r.assigned_policies) : []
                })));
            });
        });
    },

    upsertAgent: (agent: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO agents (id, name, role, status, capabilities, risk_level, assigned_policies, last_heartbeat, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    role=excluded.role,
                    risk_level=excluded.risk_level,
                    last_heartbeat=excluded.last_heartbeat
            `);
            // Only update heartbeat/name on auto-register. Full updates happen via explicit API.
            const now = new Date().toISOString();
            stmt.run(
                agent.id,
                agent.name,
                agent.role || 'general',
                agent.status || 'connected',
                JSON.stringify(agent.capabilities || []),
                agent.riskLevel || 'low',
                JSON.stringify(agent.assigned_policies || []),
                now,
                now,
                (err: Error | null) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
            stmt.finalize();
        });
    },

    updateAgentDetails: (id: string, updates: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            let sql = "UPDATE agents SET ";
            const params: any[] = [];

            if (updates.status) { sql += "status = ?, "; params.push(updates.status); }
            if (updates.name) { sql += "name = ?, "; params.push(updates.name); }
            if (updates.role) { sql += "role = ?, "; params.push(updates.role); }
            if (updates.riskLevel) { sql += "risk_level = ?, "; params.push(updates.riskLevel); }
            if (updates.capabilities) { sql += "capabilities = ?, "; params.push(JSON.stringify(updates.capabilities)); }
            if (updates.assigned_policies) { sql += "assigned_policies = ?, "; params.push(JSON.stringify(updates.assigned_policies)); }

            // Remove trailing comma
            sql = sql.slice(0, -2);
            sql += " WHERE id = ?";
            params.push(id);

            db.run(sql, params, (err: Error | null) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getViolations: (filters: any): Promise<{ items: any[], total: number }> => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM audit_logs WHERE (status = 'deny' OR status = 'warn')";
            let countSql = "SELECT COUNT(*) as count FROM audit_logs WHERE (status = 'deny' OR status = 'warn')";
            const params: any[] = [];
            const page = filters.page || 1;
            const limit = filters.limit || 50;
            const offset = (page - 1) * limit;

            if (filters.status) {
                const clause = " AND resolution_status = ?";
                sql += clause;
                countSql += clause;
                params.push(filters.status);
            }

            if (filters.agentId) {
                const clause = " AND agent_id = ?";
                sql += clause;
                countSql += clause;
                params.push(filters.agentId);
            }

            sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;

            // Get Total Count First
            db.get(countSql, params, (err, row: any) => {
                if (err) return reject(err);
                const total = row.count;

                // Then Get Data
                db.all(sql, [...params, limit, offset], (err: Error | null, rows: any[]) => {
                    if (err) reject(err);
                    else resolve({
                        items: rows.map(r => ({
                            ...r,
                            metadata: r.metadata ? JSON.parse(r.metadata) : {}
                        })),
                        total
                    });
                });
            });
        });
    },

    // --- USER & SESSION MANAGEMENT ---
    upsertUser: (user: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const stmt = db.prepare(`
                INSERT INTO users (id, email, password_hash, profile_json, security_json, preferences_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    email=excluded.email,
                    password_hash=COALESCE(excluded.password_hash, users.password_hash),
                    profile_json=excluded.profile_json,
                    security_json=excluded.security_json,
                    preferences_json=excluded.preferences_json,
                    updated_at=excluded.updated_at
            `);
            stmt.run(
                user.id,
                user.email,
                user.passwordHash,
                JSON.stringify(user.profile || {}),
                JSON.stringify(user.security || {}),
                JSON.stringify(user.preferences || {}),
                user.createdAt || now,
                now,
                (err: Error | null) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
            stmt.finalize();
        });
    },

    getUserByEmail: (email: string): Promise<any | null> => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ? AND is_active = 1", [email], (err, row: any) => {
                if (err) reject(err);
                else resolve(row ? {
                    ...row,
                    profile: JSON.parse(row.profile_json),
                    security: JSON.parse(row.security_json),
                    preferences: JSON.parse(row.preferences_json)
                } : null);
            });
        });
    },

    createSession: (session: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO sessions (id, user_id, device, location, ip_address, login_time, last_active, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                session.id,
                session.userId,
                session.device,
                session.location,
                session.ip,
                session.loginTime,
                session.lastActive,
                session.expiresAt,
                (err: Error | null) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
            stmt.finalize();
        });
    },

    insertUserAuditLog: (log: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO user_audit_logs (user_id, action, field, old_value, new_value, ip_address, user_agent, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                log.userId,
                log.action,
                log.field,
                log.oldValue,
                log.newValue,
                log.ip,
                log.userAgent,
                new Date().toISOString(),
                (err: Error | null) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
            stmt.finalize();
        });
    },

    updateViolationStatus: (id: string, status: string, comment: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE audit_logs 
                SET resolution_status = ?, resolution_comment = ?, resolved_at = ?
                WHERE id = ?
            `);
            stmt.run(status, comment, new Date().toISOString(), id, (err: Error | null) => {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    },

    insertAuditLog: (entry: any) => {
        const stmt = db.prepare(`INSERT INTO audit_logs (
            timestamp, request_id, agent_id, action_type, allowed, status, policy_id, reason, latency_ms, confidence, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        stmt.run(
            entry.timestamp,
            entry.requestId,
            entry.agentId,
            entry.metadata?.action || 'unknown',
            entry.allowed ? 1 : 0,
            entry.status || (entry.allowed ? 'allow' : 'deny'),
            entry.policyId,
            entry.reason,
            entry.latencyMs || 0,
            entry.confidence || 0,
            JSON.stringify(entry.metadata || {})
        );
        stmt.finalize();
    },

    getRecentLogs: (limit = 50): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?`, [limit], (err: Error | null, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    insertAlert: (severity: string, message: string) => {
        const stmt = db.prepare(`INSERT INTO alerts (timestamp, severity, message) VALUES (?, ?, ?)`);
        stmt.run(new Date().toISOString(), severity, message);
        stmt.finalize();
    },

    // --- Policy CRUD ---
    getAllPolicies: (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM policies", (err: Error | null, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows.map((r: any) => JSON.parse(r.json)));
            });
        });
    },

    upsertPolicy: (policy: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(policy);
            const now = new Date().toISOString();

            // 1. Get current max version
            db.get("SELECT MAX(version) as v FROM policy_versions WHERE policy_id = ?", [policy.id], (err: Error | null, row: any) => {
                if (err) { reject(err); return; }
                const nextVersion = (row?.v || 0) + 1;

                // 2. Insert into History
                db.run("INSERT INTO policy_versions (policy_id, json_snapshot, version, created_at) VALUES (?, ?, ?, ?)",
                    [policy.id, json, nextVersion, now], (err2: Error | null) => {
                        if (err2) console.error("Failed to archive policy version", err2);
                    });

                // 3. Update Main Table
                const stmt = db.prepare(`
                    INSERT INTO policies (id, json, is_active, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET 
                    json=excluded.json, updated_at=excluded.updated_at
                `);

                stmt.run(policy.id, json, 1, now, now, (err3: Error | null) => {
                    if (err3) reject(err3);
                    else resolve();
                });
                stmt.finalize();
            });
        });
    },

    deletePolicy: (id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM policies WHERE id = ?", [id], (err: Error | null) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getPolicyHistory: (id: string): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM policy_versions WHERE policy_id = ? ORDER BY version DESC", [id], (err: Error | null, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows.map(r => ({ ...r, policy: JSON.parse(r.json_snapshot) })));
            });
        });
    },

    getPolicyLogs: (id: string): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM audit_logs WHERE policy_id = ? ORDER BY timestamp DESC LIMIT 50", [id], (err: Error | null, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getSystemStats: (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                // We'll run multiple queries in parallel for efficiency
                // but SQLite is single-threaded so it's mostly about code organization

                // 1. General Metrics
                const metricsQuery = `
                    SELECT 
                        (SELECT COUNT(*) FROM policies) as total_policies,
                        (SELECT COUNT(*) FROM agents WHERE status = 'active' OR status = 'running') as active_agents,
                        (SELECT COUNT(*) FROM audit_logs WHERE timestamp > date('now')) as tasks_today,
                        AVG(latency_ms) as avg_latency,
                        SUM(CASE WHEN allowed = 1 THEN 1 ELSE 0 END) as allowed_count,
                        SUM(CASE WHEN allowed = 0 THEN 1 ELSE 0 END) as denied_count,
                        COUNT(*) as total_requests
                    FROM audit_logs 
                    WHERE timestamp > datetime('now', '-1 hour')
                `;

                // 2. Top Violations (Last 24 hours)
                const topPoliciesQuery = `
                    SELECT policy_id, COUNT(*) as count 
                    FROM audit_logs 
                    WHERE (status = 'deny' OR status = 'warn') 
                    AND timestamp > datetime('now', '-24 hours')
                    GROUP BY policy_id 
                    ORDER BY count DESC 
                    LIMIT 10
                `;

                // 3. Agent Health (Last Activity)
                const agentHealthQuery = `
                    SELECT agent_id, MAX(timestamp) as last_seen, COUNT(*) as recent_requests
                    FROM audit_logs
                    WHERE timestamp > datetime('now', '-1 hour')
                    GROUP BY agent_id
                `;

                const runQuery = (query: string): Promise<any> => {
                    return new Promise((res, rej) => {
                        db.all(query, (err, rows) => err ? rej(err) : res(rows));
                    });
                };

                const [metrics, topPolicies, agentHealth] = await Promise.all([
                    runQuery(metricsQuery),
                    runQuery(topPoliciesQuery),
                    runQuery(agentHealthQuery)
                ]);

                const m = metrics[0] || {};

                resolve({
                    totalPolicies: m.total_policies || 0,
                    activeAgents: m.active_agents || 0,
                    tasksToday: m.tasks_today || 0,
                    throughput: m.total_requests || 0, // Requests in last hour
                    avgLatency: Math.round(m.avg_latency || 0),
                    successRate: m.total_requests ? ((m.allowed_count / m.total_requests) * 100).toFixed(1) : '100.0',
                    blockRate: m.total_requests ? ((m.denied_count / m.total_requests) * 100).toFixed(1) : '0.0',
                    topPolicies,
                    agentHealth
                });

            } catch (e) {
                reject(e);
            }
        });
    },

    getAnalytics: (range: '1h' | '24h' | '7d'): Promise<any> => {
        return new Promise((resolve, reject) => {
            const now = new Date();
            let timeParams: string[] = [];
            let groupBy: string;

            // Calculate time window
            if (range === '1h') {
                now.setHours(now.getHours() - 1);
                groupBy = '%Y-%m-%d %H:%M'; // Group by minute
            } else if (range === '24h') {
                now.setHours(now.getHours() - 24);
                groupBy = '%Y-%m-%d %H:00'; // Group by hour
            } else {
                now.setDate(now.getDate() - 7);
                groupBy = '%Y-%m-%d'; // Group by day
            }
            const startTime = now.toISOString();

            // Parallel queries
            db.serialize(() => {
                const result: any = { traffic: [], violations: [], agents: [] };

                // 1. Traffic Trends (Allow vs Deny vs Warn)
                db.all(`
                    SELECT strftime('${groupBy}', timestamp) as time,
                           status,
                           COUNT(*) as count,
                           AVG(latency_ms) as avg_latency
                    FROM audit_logs 
                    WHERE timestamp > ?
                    GROUP BY time, status
                    ORDER BY time ASC
                `, [startTime], (err, rows: any[]) => {
                    if (err) return reject(err);

                    // Transform for Recharts (pivot)
                    const timeMap: any = {};
                    rows.forEach(r => {
                        if (!timeMap[r.time]) timeMap[r.time] = { time: r.time, allow: 0, deny: 0, warn: 0, latency: 0 };
                        timeMap[r.time][r.status] = r.count;
                        timeMap[r.time].latency = r.avg_latency;
                    });
                    result.traffic = Object.values(timeMap);

                    // 2. Top Policy Violations
                    db.all(`
                        SELECT policy_id, COUNT(*) as count
                        FROM audit_logs
                        WHERE timestamp > ? AND (status = 'deny' OR status = 'warn')
                        GROUP BY policy_id
                        ORDER BY count DESC
                        LIMIT 5
                    `, [startTime], (err, rows) => {
                        if (err) return reject(err);
                        result.violations = rows;

                        // 3. Agent Performance
                        db.all(`
                            SELECT agent_id, 
                                   COUNT(*) as total_requests,
                                   SUM(CASE WHEN status='deny' THEN 1 ELSE 0 END) as blocks
                            FROM audit_logs
                            WHERE timestamp > ?
                            GROUP BY agent_id
                        `, [startTime], (err, rows) => {
                            if (err) return reject(err);
                            result.agents = rows;
                            resolve(result);
                        });
                    });
                });
            });
        });
    }
};
