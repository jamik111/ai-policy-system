"use strict";
/**
 * WebSocket Streaming - Real-time updates for logs, metrics, and system events
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamServer = void 0;
const ws_1 = __importDefault(require("ws"));
class StreamServer {
    wss;
    clients = new Set();
    auditLogger;
    orchestrator;
    heartbeatInterval = null;
    constructor(server, auditLogger, orchestrator) {
        this.wss = new ws_1.default.Server({ server, path: '/api/stream' });
        this.auditLogger = auditLogger;
        this.orchestrator = orchestrator;
        this.setupConnections();
        this.setupHeartbeat();
        this.subscribeToLogs();
    }
    /**
     * Setup WebSocket connections
     */
    setupConnections() {
        this.wss.on('connection', (ws) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            console.log('[StreamServer] Client connected');
            this.clients.add(ws);
            this.sendInitialState(ws);
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('[StreamServer] Message parse error:', error);
                }
            });
            ws.on('close', () => {
                console.log('[StreamServer] Client disconnected');
                this.clients.delete(ws);
            });
            ws.on('error', (error) => {
                console.error('[StreamServer] WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }
    /**
     * Send initial state to new clients
     */
    sendInitialState(ws) {
        const recentLogs = this.auditLogger.getRecentLogs(20);
        const health = this.orchestrator.getSystemHealth();
        const stats = this.auditLogger.getStatistics();
        ws.send(JSON.stringify({
            type: 'init',
            data: {
                recentLogs,
                health,
                stats,
                timestamp: Date.now(),
            },
        }));
    }
    /**
     * Handle incoming messages
     */
    handleMessage(ws, message) {
        switch (message.type) {
            case 'subscribe':
                this.handleSubscribe(ws, message);
                break;
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong' }));
                break;
            default:
                console.warn('[StreamServer] Unknown message type:', message.type);
        }
    }
    /**
     * Handle subscription requests
     */
    handleSubscribe(ws, message) {
        const { channels } = message;
        if (!Array.isArray(channels)) {
            return;
        }
        ws.send(JSON.stringify({
            type: 'subscribed',
            channels,
        }));
    }
    /**
     * Subscribe to audit logs
     */
    subscribeToLogs() {
        this.auditLogger.subscribe((log) => {
            this.broadcast({
                type: 'log',
                data: log,
                timestamp: Date.now(),
            });
        });
    }
    /**
     * Setup heartbeat to keep connections alive
     */
    setupHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    ws.terminate();
                    this.clients.delete(ws);
                    return;
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach((ws) => {
            if (ws.readyState === ws_1.default.OPEN) {
                ws.send(data);
            }
            else {
                this.clients.delete(ws);
            }
        });
    }
    /**
     * Send update event
     */
    sendUpdate(type, data) {
        this.broadcast({
            type: 'update',
            eventType: type,
            data,
            timestamp: Date.now(),
        });
    }
    /**
     * Shutdown server
     */
    shutdown() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.clients.forEach((ws) => {
            ws.close();
        });
        this.wss.close();
        console.log('[StreamServer] Shutdown complete');
    }
}
exports.StreamServer = StreamServer;
