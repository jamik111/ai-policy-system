import { EvaluationResult } from './ruleEvaluator';
import { Logger } from '../audit/logger';

export class Enforcement {
    static enforce(result: EvaluationResult, onKill?: () => void): void {
        if (!result.allowed) {
            Logger.warn(`ENFORCEMENT ACTION: Policy violation. Reason: ${result.reason}`);
            if (onKill) {
                onKill();
            }
            throw new Error(`Execution blocked: ${result.reason}`);
        }

        // Perform specific actions if needed
        result.actions.forEach(action => {
            if (action.notify) {
                Logger.info(`NOTIFICATION: ${action.notify}`);
            }
            if (action.block) {
                Logger.warn(`BLOCK ACTION: ${action.block}`);
                throw new Error(`Action blocked: ${action.block}`);
            }
        });
    }

    // Runtime monitor for long-running tasks
    static monitor(context: any, checkIntervalMs: number = 1000): NodeJS.Timeout {
        return setInterval(() => {
            Logger.log(`Runtime monitoring for ${context.taskId || 'unknown task'}...`);
            // In a real system, you'd re-evaluate state-dependent policies here
        }, checkIntervalMs);
    }
}
