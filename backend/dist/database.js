"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const logger_1 = require("./audit/logger");
const db = new sqlite3_1.default.Database('policies.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    }
    else {
        logger_1.Logger.log('Connected to SQLite database.');
        initDb();
    }
});
function initDb() {
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
        // Policy Versions Table
        db.run(`CREATE TABLE IF NOT EXISTS policy_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            policy_id TEXT,
            json_snapshot TEXT,
            version INTEGER,
            created_at TEXT
        )`);
    });
}
exports.Database = {
    insertAuditLog: (entry) => {
        const stmt = db.prepare(`INSERT INTO audit_logs (
            timestamp, request_id, agent_id, action_type, allowed, status, policy_id, reason, latency_ms, confidence, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(entry.timestamp, entry.requestId, entry.agentId, entry.metadata?.action || 'unknown', entry.allowed ? 1 : 0, entry.status || (entry.allowed ? 'allow' : 'deny'), entry.policyId, entry.reason, entry.latencyMs || 0, entry.confidence || 0, JSON.stringify(entry.metadata || {}));
        stmt.finalize();
    },
    getRecentLogs: (limit = 50) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    insertAlert: (severity, message) => {
        const stmt = db.prepare(`INSERT INTO alerts (timestamp, severity, message) VALUES (?, ?, ?)`);
        stmt.run(new Date().toISOString(), severity, message);
        stmt.finalize();
    },
    // --- Policy CRUD ---
    getAllPolicies: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM policies", (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((r) => JSON.parse(r.json)));
            });
        });
    },
    upsertPolicy: (policy) => {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(policy);
            const now = new Date().toISOString();
            // 1. Get current max version
            db.get("SELECT MAX(version) as v FROM policy_versions WHERE policy_id = ?", [policy.id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                const nextVersion = (row?.v || 0) + 1;
                // 2. Insert into History
                db.run("INSERT INTO policy_versions (policy_id, json_snapshot, version, created_at) VALUES (?, ?, ?, ?)", [policy.id, json, nextVersion, now], (err2) => {
                    if (err2)
                        console.error("Failed to archive policy version", err2);
                });
                // 3. Update Main Table
                const stmt = db.prepare(`
                    INSERT INTO policies (id, json, is_active, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET 
                    json=excluded.json, updated_at=excluded.updated_at
                `);
                stmt.run(policy.id, json, 1, now, now, (err3) => {
                    if (err3)
                        reject(err3);
                    else
                        resolve();
                });
                stmt.finalize();
            });
        });
    },
    deletePolicy: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM policies WHERE id = ?", [id], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    getPolicyHistory: (id) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM policy_versions WHERE policy_id = ? ORDER BY version DESC", [id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(r => ({ ...r, policy: JSON.parse(r.json_snapshot) })));
            });
        });
    }
};
