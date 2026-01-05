// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/stream';

// Type definitions
export interface TaskRequest {
    agentId: string;
    taskType: string;
    input: string;
    metadata?: Record<string, any>;
}

export interface TaskResponse {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
    result: {
        decision: 'allow' | 'deny';
        confidence: number;
        rulesTriggered: string[];
        duration: number;
    };
    timestamp: string;
    agentId: string;
}

export interface AgentHealth {
    id: string;
    name: string;
    status: 'healthy' | 'degraded' | 'offline';
    metrics: {
        cpu: number;
        memory: number;
        requestsPerMinute?: number;
    };
    tasksProcessed: number;
    successRate: number;
    lastHeartbeat: string;
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'offline';
    agents: AgentHealth[];
    timestamp: string;
}

export interface Statistics {
    totalTasks: number;
    totalViolations: number;
    successRate: number;
    averageResponseTime: number;
    timestamp: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    decision: 'allow' | 'deny';
    agentId: string;
    details?: Record<string, any>;
}

export interface WebSocketMessage {
    type: 'log' | 'health' | 'stats' | 'agent-update' | 'error' | 'init' | 'update';
    payload?: any;
    data?: any;
    timestamp?: string;
}

// Policy API Service Class
export class PolicyAPIService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private messageHandlers: Map<string, (payload: any) => void> = new Map();
    private isConnecting = false;

    /**
     * Initialize WebSocket connection
     */
    connectWebSocket(
        onMessage: (message: WebSocketMessage) => void,
        onError?: (error: Event) => void,
        onClose?: (event: CloseEvent) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
                resolve();
                return;
            }

            this.isConnecting = true;

            try {
                this.ws = new WebSocket(WS_BASE_URL);

                this.ws.onopen = () => {
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;
                    console.log('[PolicyAPI] WebSocket connected');
                    resolve();
                };

                this.ws.onmessage = (event: MessageEvent) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        onMessage(message);
                        this.messageHandlers.forEach((handler) => handler(message.payload));
                    } catch (error) {
                        console.error('[PolicyAPI] Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error: Event) => {
                    this.isConnecting = false;
                    console.error('[PolicyAPI] WebSocket error:', error);
                    onError?.(error);
                    reject(error);
                };

                this.ws.onclose = (event: CloseEvent) => {
                    this.isConnecting = false;
                    console.log('[PolicyAPI] WebSocket closed:', event.code, event.reason);
                    onClose?.(event);

                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        setTimeout(() => {
                            console.log(
                                `[PolicyAPI] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
                            );
                            this.connectWebSocket(onMessage, onError, onClose).catch(console.error);
                        }, this.reconnectDelay * this.reconnectAttempts);
                    }
                };
            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }

    /**
     * Register handler for specific message types
     */
    onMessageType(type: string, handler: (payload: any) => void): () => void {
        this.messageHandlers.set(type, handler);
        return () => this.messageHandlers.delete(type);
    }

    /**
     * Execute a task with policy evaluation
     */
    async executeTask(request: TaskRequest): Promise<TaskResponse> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/tasks/evaluate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: request.agentId,
                    taskName: request.taskType,
                    payload: { input: request.input },
                    userId: 'dashboard-user',
                    simulationMode: false
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to execute task: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get audit logs with optional filtering
     */
    async getLogs(
        agentId?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<AuditLog[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });

        if (agentId) {
            params.append('agentId', agentId);
        }

        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/logs?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get system statistics
     */
    async getStatistics(): Promise<Statistics> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/statistics`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch statistics: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get system health status
     */
    async getHealth(): Promise<HealthStatus> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/health`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch health status: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get all active policies
     */
    async getPolicies(): Promise<Record<string, any>[]> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/policies`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch policies: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get specific agent health status
     */
    async getAgentHealth(agentId: string): Promise<AgentHealth> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/agents/${agentId}/health`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch agent health: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Stream task execution updates
     */
    async *streamTaskUpdates(taskId: string): AsyncGenerator<TaskResponse> {
        const response = await this.fetchWithErrorHandling(
            `${API_BASE_URL}/tasks/${taskId}/stream`,
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(`Failed to stream updates: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        try {
                            const update = JSON.parse(line);
                            yield update as TaskResponse;
                        } catch (error) {
                            console.error('[PolicyAPI] Failed to parse stream update:', error);
                        }
                    }
                }

                buffer = lines[lines.length - 1];
            }

            if (buffer.trim()) {
                try {
                    const update = JSON.parse(buffer);
                    yield update as TaskResponse;
                } catch (error) {
                    console.error('[PolicyAPI] Failed to parse final stream update:', error);
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Internal method for fetch with error handling
     */
    private async fetchWithErrorHandling(
        url: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            return response;
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw new Error(`Network error: ${error.message}`);
            }
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }
}

// Singleton instance
export const policyAPI = new PolicyAPIService();
