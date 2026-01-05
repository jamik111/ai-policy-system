import { evaluate } from '../api/evaluatePolicy';
import { Enforcement } from '../engine/enforcement';
import { Logger } from '../audit/logger';

export class AgentRunner {
    constructor(private agentId: string, private agentType: string) { }

    async runTask(taskId: string, input: string, data: any) {
        Logger.log(`Agent ${this.agentId} initializing task ${taskId}`);

        const context = {
            agentId: this.agentId,
            agentType: this.agentType,
            taskId: taskId,
            input: input,
            data: data,
            usageToday: 500 // Mocked usage
        };

        try {
            // 1. PRE-CHECK
            Logger.log("Phase 1: Pre-execution Policy Check");
            const result = evaluate(context);

            // 2. ENFORCEMENT
            Enforcement.enforce(result);

            // 3. RUNTIME MONITORING
            Logger.log("Phase 2: Execution with Runtime Monitoring");
            const monitor = Enforcement.monitor(context);

            // Simulate task execution
            await new Promise(resolve => setTimeout(resolve, 2000));

            clearInterval(monitor);
            Logger.info(`Task ${taskId} completed successfully.`);

        } catch (error: any) {
            Logger.warn(`Task ${taskId} failed: ${error.message}`);
        }
    }
}
