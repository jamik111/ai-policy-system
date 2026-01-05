"use strict";
/**
 * REST API Endpoints - Task evaluation, policies, analytics, and health checks
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
function createApiRouter(orchestrator, policyEngine, auditLogger) {
    const router = express_1.default.Router();
    /**
     * POST /api/tasks/evaluate - Evaluate and execute a task
     */
    router.post('/tasks/evaluate', async (req, res) => {
        try {
            const { agentId, taskName, payload, userId, simulationMode } = req.body;
            if (!agentId || !taskName || !payload) {
                return res.status(400).json({
                    error: 'Missing required fields: agentId, taskName, payload',
                });
            }
            const task = {
                id: (0, uuid_1.v4)(),
                name: taskName,
                payload,
            };
            const result = await orchestrator.executeTask(agentId, task, userId, simulationMode);
            res.json({
                success: result.success,
                taskId: result.taskId,
                agentId: result.agentId,
                status: 'completed',
                policyAllowed: result.policyAllowed,
                duration: result.duration,
                result: result.result,
                error: result.error,
            });
        }
        catch (error) {
            console.error('[API] Task evaluation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/tasks/:taskId - Get task details
     */
    router.get('/tasks/:taskId', (req, res) => {
        try {
            const { taskId } = req.params;
            const log = auditLogger.getLog(taskId);
            if (!log) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(log);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/logs - Get audit logs with filtering
     */
    router.get('/logs', (req, res) => {
        try {
            const { agentId, taskId, action, limit, offset } = req.query;
            const logs = auditLogger.getLogs({
                agentId: agentId,
                taskId: taskId,
                action: action,
                limit: limit ? parseInt(limit) : 100,
                offset: offset ? parseInt(offset) : 0,
            });
            res.json({
                logs,
                total: logs.length,
                limit: limit || 100,
                offset: offset || 0,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/statistics - Get system statistics
     */
    router.get('/statistics', (req, res) => {
        try {
            const auditStats = auditLogger.getStatistics();
            const policyStats = policyEngine.getStatistics();
            const health = orchestrator.getSystemHealth();
            res.json({
                audit: auditStats,
                policies: policyStats,
                health,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/health - Get system health status
     */
    router.get('/health', (req, res) => {
        try {
            const health = orchestrator.getSystemHealth();
            const agentHealth = orchestrator.getAgentHealth();
            res.json({
                status: 'healthy',
                timestamp: Date.now(),
                system: health,
                agents: agentHealth,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/policies - List all policies
     */
    router.get('/policies', (req, res) => {
        try {
            const policies = policyEngine.getPolicies();
            res.json({
                policies: policies.map((p) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    version: p.version,
                    enabled: p.enabled,
                    ruleCount: p.rules.length,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                })),
                total: policies.length,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/policies/:policyId - Get policy details
     */
    router.get('/policies/:policyId', (req, res) => {
        try {
            const policy = policyEngine.getPolicy(req.params.policyId);
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.json(policy);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * POST /api/policies/:policyId/enable - Enable/disable policy
     */
    router.post('/policies/:policyId/enable', (req, res) => {
        try {
            const { enabled } = req.body;
            const policy = policyEngine.setPolicy(req.params.policyId, enabled);
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.json({
                message: `Policy ${enabled ? 'enabled' : 'disabled'}`,
                policy,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/conflicts - Get policy conflicts
     */
    router.get('/conflicts', (req, res) => {
        try {
            const conflicts = policyEngine.getConflicts();
            res.json({
                conflicts,
                total: conflicts.length,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * GET /api/agents/:agentId/history - Get agent task history
     */
    router.get('/agents/:agentId/history', (req, res) => {
        try {
            const agent = orchestrator.getAgent(req.params.agentId);
            const history = agent.getTaskHistory(parseInt(req.query.limit) || 100);
            res.json({
                agentId: req.params.agentId,
                tasks: history,
                total: history.length,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * POST /api/test-condition - Test a policy condition
     */
    router.post('/test-condition', (req, res) => {
        try {
            const { condition, context } = req.body;
            if (!condition || !context) {
                return res.status(400).json({
                    error: 'Missing required fields: condition, context',
                });
            }
            const result = policyEngine.evaluate(context);
            res.json({
                condition,
                context,
                result,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
