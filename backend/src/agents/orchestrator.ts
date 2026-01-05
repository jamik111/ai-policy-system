import { Database } from '../database';
import { RuleEvaluator, Policy } from '../engine/ruleEvaluator';
import { Logger } from '../audit/logger';

// Simulation Configuration
const SIMULATION_CONFIG = {
    agents: 5,
    taskFrequencyMs: 5000,
    violationRate: 0.15 // 15%
};

const SAMPLE_INPUTS = [
    "Calculate the fibonacci sequence",
    "Analyze this user data: email=test@example.com", // PII
    "Delete all files in /system", // Harmful
    "Write a harmless poem",
    "Query the database for user stats",
    "Send a marketing email to 1000 users",
    "How do I build a bomb?", // Toxic
    "Review this code for bugs",
    "Deploy to production"
];

const ROLES = ['developer', 'analyst', 'support', 'manager', 'admin'];

export class Orchestrator {
    private isRunning = false;
    private interval: NodeJS.Timeout | null = null;
    private agents: string[] = [];
    private policies: Policy[] = [];

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        await Database.init();
        this.policies = await Database.getAllPolicies();

        // ensure agents exist
        for (let i = 0; i < SIMULATION_CONFIG.agents; i++) {
            const id = `agent-sim-${i}`;
            await Database.upsertAgent({
                id,
                name: `SimAgent ${i}`,
                role: ROLES[i % ROLES.length],
                status: 'active',
                capabilities: ['calculation', 'analysis', 'coding'],
                riskLevel: 'low',
                taskCount: 0
            });
            this.agents.push(id);
        }

        Logger.log(`Orchestrator started with ${this.agents.length} agents.`);

        this.interval = setInterval(() => this.tick(), SIMULATION_CONFIG.taskFrequencyMs / this.agents.length);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.isRunning = false;
    }

    private async tick() {
        // Pick random agent
        const agentId = this.agents[Math.floor(Math.random() * this.agents.length)];

        // Generate task
        const isViolation = Math.random() < SIMULATION_CONFIG.violationRate;
        let input = SAMPLE_INPUTS[Math.floor(Math.random() * SAMPLE_INPUTS.length)];

        // Force violation if selected
        if (isViolation) {
            // Select one of the "bad" inputs
            const badInputs = [
                "Analyze this user data: email=test@example.com",
                "Delete all files in /system",
                "How do I build a bomb?"
            ];
            input = badInputs[Math.floor(Math.random() * badInputs.length)];
        }

        const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const context = {
            agentId,
            taskId,
            taskType: 'simulation',
            input,
            usageToday: Math.floor(Math.random() * 1000)
        };

        // Evaluate
        const evaluation = RuleEvaluator.evaluate(this.policies, context);

        // Save Task
        /* 
        // We haven't implemented saveTask in DB fully yet, so we'll skip for now or rely on audit log.
        // But user requirements says "Task" model exists.
        await Database.saveTask({
             id: taskId,
             agentId,
             type: 'simulation',
             payload: input,
             status: evaluation.allowed ? 'completed' : 'blocked',
             timestamp: new Date().toISOString()
        });
        */

        // Log Result (DB.insertAuditLog takes a specific format)
        Database.insertAuditLog({
            timestamp: new Date().toISOString(),
            requestId: taskId,
            agentId,
            metadata: { action: 'execute_task', input },
            allowed: evaluation.allowed,
            status: evaluation.status,
            policyId: evaluation.policyId,
            reason: evaluation.reason,
            latencyMs: evaluation.latencyMs,
            confidence: evaluation.confidence
        });

        // Update Stats
        if (!evaluation.allowed) {
            Logger.warn(`[SIM] Task ${taskId} blocked for ${agentId}: ${evaluation.reason}`);
        } else {
            Logger.info(`[SIM] Task ${taskId} allowed for ${agentId}`);
        }
    }
}
