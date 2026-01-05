"use strict";
/**
 * Agent Runner - Executes tasks with policy checks and runtime monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRunner = void 0;
const uuid_1 = require("uuid");
class AgentRunner {
    agentId;
    policyEngine;
    auditLogger;
    activeTasksMap = new Map();
    taskHistory = [];
    maxHistory = 1000;
    constructor(agentId, policyEngine, auditLogger) {
        this.agentId = agentId;
        this.policyEngine = policyEngine;
        this.auditLogger = auditLogger;
    }
    /**
     * Execute a task with policy enforcement
     */
    async executeTask(task, userId, simulationMode) {
        const startTime = Date.now();
        const taskId = task.id || (0, uuid_1.v4)();
        try {
            const context = {
                agentId: this.agentId,
                taskId,
                taskName: task.name,
                payload: task.payload,
                metadata: {
                    userId,
                    priority: task.priority,
                    timeout: task.timeout,
                    retryCount: task.retryCount,
                },
                timestamp: startTime,
                simulationMode,
            };
            const preCheckStart = Date.now();
            const evaluation = this.policyEngine.evaluate(context);
            const preCheckDuration = Date.now() - preCheckStart;
            this.auditLogger.logEvaluation(this.agentId, taskId, task.name, evaluation.allowed, evaluation.triggeredRules.map((r) => r.id), evaluation.appliedActions, preCheckDuration, task.payload, undefined, userId, simulationMode);
            if (!evaluation.allowed) {
                const duration = Date.now() - startTime;
                return {
                    taskId,
                    agentId: this.agentId,
                    success: false,
                    error: `Policy denied: ${evaluation.reason}`,
                    policyAllowed: false,
                    duration,
                    startTime,
                    endTime: Date.now(),
                };
            }
            if (simulationMode) {
                const duration = Date.now() - startTime;
                return {
                    taskId,
                    agentId: this.agentId,
                    success: true,
                    result: { simulationOnly: true, message: 'Would have been allowed' },
                    policyAllowed: true,
                    duration,
                    startTime,
                    endTime: Date.now(),
                };
            }
            const result = await this.executeTaskWithTimeout(task);
            const duration = Date.now() - startTime;
            this.auditLogger.logTaskExecution(this.agentId, taskId, task.name, result, duration, userId);
            const taskResult = {
                taskId,
                agentId: this.agentId,
                success: true,
                result,
                policyAllowed: true,
                duration,
                startTime,
                endTime: Date.now(),
            };
            this.recordTaskResult(taskResult);
            return taskResult;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.auditLogger.logEvaluation(this.agentId, taskId, task.name, false, [], [], duration, task.payload, errorMsg, userId, simulationMode);
            const taskResult = {
                taskId,
                agentId: this.agentId,
                success: false,
                error: errorMsg,
                policyAllowed: true,
                duration,
                startTime,
                endTime: Date.now(),
            };
            this.recordTaskResult(taskResult);
            return taskResult;
        }
    }
    /**
     * Execute task with timeout
     */
    async executeTaskWithTimeout(task) {
        const timeout = task.timeout || 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            this.activeTasksMap.set(task.id, controller);
            return await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        taskId: task.id,
                        status: 'completed',
                        output: 'Task executed successfully',
                        timestamp: Date.now(),
                    });
                }, Math.random() * 1000 + 100);
            });
        }
        finally {
            clearTimeout(timeoutId);
            this.activeTasksMap.delete(task.id);
        }
    }
    /**
     * Record task result in history
     */
    recordTaskResult(result) {
        this.taskHistory.push(result);
        if (this.taskHistory.length > this.maxHistory) {
            this.taskHistory.shift();
        }
    }
    /**
     * Get task history
     */
    getTaskHistory(limit = 100) {
        return this.taskHistory
            .slice()
            .reverse()
            .slice(0, limit);
    }
    /**
     * Get agent statistics
     */
    getStatistics() {
        const successful = this.taskHistory.filter((t) => t.success).length;
        const failed = this.taskHistory.filter((t) => !t.success).length;
        const allowed = this.taskHistory.filter((t) => t.policyAllowed).length;
        const denied = this.taskHistory.length - allowed;
        const avgDuration = this.taskHistory.length > 0 ? this.taskHistory.reduce((sum, t) => sum + t.duration, 0) / this.taskHistory.length : 0;
        return {
            agentId: this.agentId,
            totalTasks: this.taskHistory.length,
            successCount: successful,
            failureCount: failed,
            allowedCount: allowed,
            deniedCount: denied,
            successRate: this.taskHistory.length > 0 ? successful / this.taskHistory.length : 0,
            avgDuration,
        };
    }
    /**
     * Cancel a running task
     */
    cancelTask(taskId) {
        const controller = this.activeTasksMap.get(taskId);
        if (controller) {
            controller.abort();
            this.activeTasksMap.delete(taskId);
            return true;
        }
        return false;
    }
    /**
     * Get active tasks
     */
    getActiveTasks() {
        return Array.from(this.activeTasksMap.keys());
    }
}
exports.AgentRunner = AgentRunner;
