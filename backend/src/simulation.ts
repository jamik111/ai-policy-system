import { Database } from './database';
import { Logger } from './audit/logger';
import { RuleEvaluator } from './engine/ruleEvaluator';
// We'll use the PolicyEngine instance from index via a localized runner or direct DB access
// Ideally we call the API or shared logic. For "Make it Real", direct logic is fine if within same process.

// Seed Data
const SEED_AGENTS = [
    { id: 'agent-alpha', name: 'Alpha Research', role: 'researcher', status: 'active', riskLevel: 'low', capabilities: ['web-browse', 'summarize'] },
    { id: 'agent-beta', name: 'Beta Trading', role: 'finance', status: 'active', riskLevel: 'high', capabilities: ['trade', 'analyze'] },
    { id: 'agent-gamma', name: 'Gamma Support', role: 'support', status: 'active', riskLevel: 'medium', capabilities: ['chat', 'email'] },
    { id: 'agent-delta', name: 'Delta Crawler', role: 'scraper', status: 'active', riskLevel: 'high', capabilities: ['crawl', 'scrape'] },
    { id: 'agent-epsilon', name: 'Epsilon Coder', role: 'developer', status: 'active', riskLevel: 'low', capabilities: ['code', 'deploy'] }
];

const SEED_POLICIES = [
    {
        id: 'pol-pii',
        json: JSON.stringify({
            id: 'pol-pii',
            name: 'PII Protection Standard',
            description: 'Blocks sharing of SSN and Credit Card numbers',
            priority: 100,
            is_active: true,
            rules: [
                { type: 'regex', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', effect: 'deny', reason: 'SSN Detected' },
                { type: 'regex', pattern: '\\b4[0-9]{12}(?:[0-9]{3})?\\b', effect: 'deny', reason: 'Visa Card Detected' }
            ]
        })
    },
    {
        id: 'pol-profanity',
        json: JSON.stringify({
            id: 'pol-profanity',
            name: 'Professional Communication',
            description: 'Ensures professional language in all outputs',
            priority: 50,
            is_active: true,
            rules: [
                { type: 'keyword', pattern: 'damn', effect: 'warn', reason: 'Profanity detected' },
                { type: 'keyword', pattern: 'hell', effect: 'warn', reason: 'Profanity detected' }
            ]
        })
    },
    {
        id: 'pol-finance-restrict',
        json: JSON.stringify({
            id: 'pol-finance-restrict',
            name: 'Financial Restriction',
            description: 'Restricts trading actions to authorized agents',
            priority: 80,
            is_active: true,
            rules: [
                { type: 'keyword', pattern: 'BUY', effect: 'deny', reason: 'Unauthorized trading action' },
                { type: 'keyword', pattern: 'SELL', effect: 'deny', reason: 'Unauthorized trading action' }
            ]
        })
    }
];

const SAMPLE_TASKS = [
    "Summarize the latest financial report for Apple Inc.",
    "Generate a SQL query to delete all users table.",
    "My social security number is 123-45-6789, please update my record.",
    "What the hell is going on with this deployment?",
    "Execute BUY order for 1000 shares of TSLA.",
    "Crawl https://example.com and extract all emails.",
    "Deploy the latest build to production.",
    "Analyze the risk of this portfolio."
];

export class SimulationManager {
    private static running = false;
    private static intervals: NodeJS.Timeout[] = [];
    private static policyEngine: any;

    static async init(engine: any) {
        this.policyEngine = engine;
        await this.seed();
        this.start();
    }

    private static async seed() {
        // Seed Agents
        const agents = await Database.getAgents();
        if (agents.length === 0) {
            Logger.log('Seeding initial agents...');
            for (const agent of SEED_AGENTS) {
                await Database.upsertAgent(agent);
            }
        }

        // Seed Policies
        const policies = await Database.getAllPolicies();
        if (policies.length === 0) {
            Logger.log('Seeding initial policies...');
            for (const policy of SEED_POLICIES) {
                // Upsert logic expects the policy object, but upsertPolicy handles the wrapping
                // wait, the db logic manually stringifies. Let's look at db.upsertPolicy.
                // It expects an object with {id, rules, ...}. 
                // Our SEED_POLICIES stores JSON string. Let's fix.
                const pObj = JSON.parse(policy.json);
                await Database.upsertPolicy(pObj);
            }
        }
    }

    static start() {
        if (this.running) return;
        this.running = true;
        Logger.log('Starting Simulation Loop...');

        // Start a loop for each agent
        SEED_AGENTS.forEach((agent, index) => {
            const delay = 2000 + (Math.random() * 5000); // Random delay between 2-7s
            const interval = setInterval(async () => {
                await this.simulateAgentAction(agent.id);
            }, delay);
            this.intervals.push(interval);
        });
    }

    static stop() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        this.running = false;
        Logger.log('Simulation Loop Stopped.');
    }

    private static async simulateAgentAction(agentId: string) {
        // 1. Pick a random task
        const input = SAMPLE_TASKS[Math.floor(Math.random() * SAMPLE_TASKS.length)];
        const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const context = {
            requestId: taskId,
            timestamp: new Date().toISOString(),
            agentId: agentId,
            input: input,
            metadata: {
                source: 'simulation',
                action: 'execute_task',
                model: 'gpt-4'
            }
        };

        // 2. Evaluate
        try {
            const result = this.policyEngine.evaluate(context);

            // 3. Log Result (Database insert handles async)
            Database.insertAuditLog({
                ...context,
                allowed: result.allowed,
                status: result.status,
                reason: result.reason,
                policyId: result.policyId,
                latencyMs: result.latencyMs,
                confidence: result.confidence
            });

            // Logger.log(`[SIM] Agent ${agentId} -> ${result.status.toUpperCase()} (${result.latencyMs}ms)`);

        } catch (e) {
            console.error('Simulation Step Failed:', e);
        }
    }
}
