"use strict";
/**
 * Orchestrator - Manages multi-agent task execution, orchestration, and coordination
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const uuid_1 = require("uuid");
const agentRunner_1 = require("./agentRunner");
const policyEngine_1 = require("../engine/policyEngine");
const logger_1 = require("../audit/logger");
class Orchestrator {
    agents = new Map();
    policyEngine;
    auditLogger;
    executionHistory = [];
    maxHistory = 500;
    constructor(policyEngine, auditLogger) {
        this.policyEngine = policyEngine || new policyEngine_1.PolicyEngine();
        this.auditLogger = auditLogger || new logger_1.AuditLogger();
    }
    /**
     * Register an agent
     */
    registerAgent(agentId) {
        if (this.agents.has(agentId)) {
            return this.agents.get(agentId);
        }
        const agent = new agentRunner_1.AgentRunner(agentId, this.policyEngine, this.auditLogger);
        this.agents.set(agentId, agent);
        console.log(`[Orchestrator] Agent registered: ${agentId}`);
        return agent;
    }
    /**
     * Get or create agent
     */
    getAgent(agentId) {
        return this.agents.get(agentId) || this.registerAgent(agentId);
    }
    /**
     * Execute a single task through a specific agent
     */
    async executeTask(agentId, task, userId, simulationMode) {
        const agent = this.getAgent(agentId);
        return agent.executeTask(task, userId, simulationMode);
    }
    /**
     * Execute orchestrated multi-agent tasks
     */
    async executeOrchestration(orchestration, userId, simulationMode) {
        const orchestrationId = (0, uuid_1.v4)();
        const startTime = Date.now();
        const allResults = [];
        try {
            if (orchestration.chainedMode) {
                for (const task of orchestration.tasks) {
                    for (const agentId of orchestration.agentIds) {
                        const result = await this.executeTask(agentId, task, userId, simulationMode);
                        allResults.push(result);
                        if (!result.success && orchestration.fallbackTasks) {
                            for (const fallbackTask of orchestration.fallbackTasks) {
                                const fallbackResult = await this.executeTask(agentId, fallbackTask.tasks[0], userId, simulationMode);
                                allResults.push(fallbackResult);
                            }
                        }
                    }
                }
            }
            else {
                const promises = orchestration.tasks.flatMap((task) => orchestration.agentIds.map((agentId) => this.executeTask(agentId, task, userId, simulationMode).catch((error) => ({
                    taskId: task.id,
                    agentId,
                    success: false,
                    error: error.message,
                    policyAllowed: false,
                    duration: 0,
                    startTime: Date.now(),
                    endTime: Date.now(),
                }))));
                const results = await Promise.all(promises);
                allResults.push(...results);
            }
            const endTime = Date.now();
            const success = allResults.every((r) => r.success);
            const result = {
                orchestrationId,
                tasks: allResults,
                success,
                startTime,
                endTime,
                duration: endTime - startTime,
            };
            this.executionHistory.push(result);
            if (this.executionHistory.length > this.maxHistory) {
                this.executionHistory.shift();
            }
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            const errorMsg = error instanceof Error ? error.message : String(error);
            const result = {
                orchestrationId,
                tasks: allResults,
                success: false,
                startTime,
                endTime,
                duration: endTime - startTime,
                error: errorMsg,
            };
            this.executionHistory.push(result);
            return result;
        }
    }
    /**
     * Get agent health status
     */
    getAgentHealth() {
        const healthList = [];
        this.agents.forEach((agent, agentId) => {
            const stats = agent.getStatistics();
            healthList.push({
                id: agentId,
                name: agentId,
                status: 'healthy',
                activeTasks: agent.getActiveTasks().length,
                tasksProcessed: stats.totalTasks,
                successRate: stats.successRate,
                lastHeartbeat: new Date().toISOString(),
                metrics: stats,
            });
        });
        return healthList;
    }
    /**
     * Get execution history
     */
    getExecutionHistory(limit = 50) {
        return this.executionHistory
            .slice()
            .reverse()
            .slice(0, limit);
    }
    /**
     * Get system health
     */
    getSystemHealth() {
        let totalActiveTasks = 0;
        let totalExecutedTasks = 0;
        let successfulTasks = 0;
        this.agents.forEach((agent) => {
            totalActiveTasks += agent.getActiveTasks().length;
            const stats = agent.getStatistics();
            totalExecutedTasks += stats.totalTasks;
            successfulTasks += stats.successCount;
        });
        return {
            agents: this.agents.size,
            activeTasks: totalActiveTasks,
            totalExecutions: totalExecutedTasks,
            successRate: totalExecutedTasks > 0 ? successfulTasks / totalExecutedTasks : 0,
        };
    }
    /**
     * Shutdown orchestrator
     */
    shutdown() {
        this.agents.forEach((agent) => {
            agent.getActiveTasks().forEach((taskId) => {
                agent.cancelTask(taskId);
            });
        });
        this.policyEngine.shutdown();
        console.log('[Orchestrator] Shutdown complete');
    }
}
exports.Orchestrator = Orchestrator;
