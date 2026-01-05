const axios = require('axios');

// --- Configuration ---
const API_URL = 'http://localhost:8080/api/policies/evaluate';
const AGENT_COUNT = 12;

// --- Data Generators ---
const DATA = {
    users: ['alice_user', 'bob_manager', 'charlie_dev', 'david_admin'],
    sensitive_keywords: ['SSN', 'password', 'private_key', 'credit_card', 'confidential'],
    malicious_payloads: [
        "DROP TABLE users;",
        "SELECT * FROM passwords WHERE 1=1",
        "<script>alert('xss')</script>",
        "sudo rm -rf /",
        "cat /etc/shadow"
    ],
    safe_prompts: [
        "Summarize the quarterly report",
        "Calculate the average revenue",
        "Draft a response to the client",
        "Debug this React component",
        "Optimize the SQL query for performance"
    ],
    toxic_words: ['hate', 'violence', 'illegal', 'attack', 'kill']
};

class TaskGenerator {
    static generate(profile) {
        const isRisky = Math.random() < profile.riskFactor;
        let type, intent, input, data = {};

        if (isRisky) {
            // Generate a blocked/risky request
            const riskType = Math.floor(Math.random() * 3);
            if (riskType === 0) { // SQL/Command Injection
                type = 'db_query';
                intent = "Malicious Injection Attempt";
                input = DATA.malicious_payloads[Math.floor(Math.random() * DATA.malicious_payloads.length)];
            } else if (riskType === 1) { // Sensitive Data Leak
                type = 'data_export';
                intent = "Unauthorized PII Export";
                input = `Export data containing ${DATA.sensitive_keywords[Math.floor(Math.random() * DATA.sensitive_keywords.length)]}`;
                data = { row_count: 50000 }; // Policy limit violation
            } else { // Content Policy Violation
                type = 'content_generation';
                intent = "Toxic Content Generation";
                input = `Write a story about ${DATA.toxic_words[Math.floor(Math.random() * DATA.toxic_words.length)]}`;
            }
        } else {
            // Generate a safe/allowed request
            const safeType = Math.floor(Math.random() * 3);
            if (safeType === 0) {
                type = 'db_query';
                intent = "Standard DB Query";
                input = "SELECT id, name FROM products WHERE stock > 0";
            } else if (safeType === 1) {
                type = 'data_export';
                intent = "Routine Data Export";
                input = "Export monthly usage stats";
                data = { row_count: 50 };
            } else {
                type = 'content_generation';
                intent = "Helpful Assistant Task";
                input = DATA.safe_prompts[Math.floor(Math.random() * DATA.safe_prompts.length)];
            }
        }

        // Apply Profile Restrictions override (some profiles are always risky or restricted)
        if (profile.role === 'RedTeam' && Math.random() > 0.3) {
            input += " " + DATA.malicious_payloads[0];
            intent += " (Red Team Simulation)";
        }

        return {
            agentId: profile.id,
            agentType: profile.role,
            requestId: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: type, // 'taskType' in context
            taskType: type, // Duplicate for safety
            input: input,
            user: { id: DATA.users[Math.floor(Math.random() * DATA.users.length)] },
            metadata: { intent, action: type, ...data }
        };
    }
}

// --- Agent Profiles ---
const PROFILES = [
    { id: 'security_auditor_01', role: 'SecurityAuditBot', riskFactor: 0.8, minInterval: 2000, maxInterval: 5000 },
    { id: 'customer_support_01', role: 'CustomerSupportAI', riskFactor: 0.05, minInterval: 3000, maxInterval: 8000 },
    { id: 'data_analyst_01', role: 'DataAnalystPro', riskFactor: 0.1, minInterval: 5000, maxInterval: 12000 },
    { id: 'content_mod_01', role: 'ContentModerator', riskFactor: 0.2, minInterval: 2000, maxInterval: 4000 },
    { id: 'devops_auto_01', role: 'DevOpsAutomator', riskFactor: 0.15, minInterval: 8000, maxInterval: 15000 },
    { id: 'hr_assistant_01', role: 'HRAssistant', riskFactor: 0.1, minInterval: 6000, maxInterval: 10000 },
    { id: 'sales_outreach_01', role: 'SalesOutreachBot', riskFactor: 0.05, minInterval: 2000, maxInterval: 4000 },
    { id: 'compliance_scan_01', role: 'ComplianceScanner', riskFactor: 0.3, minInterval: 4000, maxInterval: 7000 },
    { id: 'legacy_sys_01', role: 'LegacySystemBot', riskFactor: 0.6, minInterval: 10000, maxInterval: 20000 },
    { id: 'red_team_01', role: 'RedTeamSimulator', riskFactor: 0.9, minInterval: 1000, maxInterval: 3000 },
    { id: 'finance_bot_01', role: 'FinanceBot', riskFactor: 0.1, minInterval: 5000, maxInterval: 9000 },
    { id: 'legal_review_01', role: 'LegalReviewer', riskFactor: 0.05, minInterval: 6000, maxInterval: 12000 }
];

// --- Simulation Logic ---
class Agent {
    constructor(profile) {
        this.profile = profile;
        this.running = true;
    }

    async start() {
        console.log(`Agent ${this.profile.id} (${this.profile.role}) initialized.`);
        this.loop();
    }

    async loop() {
        while (this.running) {
            try {
                const task = TaskGenerator.generate(this.profile);
                await this.execute(task);
            } catch (e) {
                console.error(`Agent ${this.profile.id} error:`, e.message);
            }

            const delay = Math.floor(Math.random() * (this.profile.maxInterval - this.profile.minInterval) + this.profile.minInterval);
            await new Promise(r => setTimeout(r, delay));
        }
    }

    async execute(payload) {
        try {
            const start = Date.now();
            const res = await axios.post(API_URL, payload);
            const duration = Date.now() - start;

            const status = res.data.allowed ? '✅ ALLOWED' : '❌ BLOCKED';
            console.log(`[${this.profile.id.padEnd(20)}] ${status} | ${payload.metadata.intent} (${duration}ms)`);
            if (!res.data.allowed) {
                // console.log(`   Reason: ${res.data.reason}`);
            }
        } catch (e) {
            console.error(`[${this.profile.id}] Connection Failed: Is backend running?`);
        }
    }
}

// --- Main execution ---
console.log(`Starting Simulation with ${PROFILES.length} agents...`);
PROFILES.forEach(p => new Agent(p).start());
