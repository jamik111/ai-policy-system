'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import {
  policyAPI,
  type WebSocketMessage,
  type TaskResponse,
  type AuditLog,
  type HealthStatus,
  type TaskRequest,
  type AgentHealth,
  type Statistics,
} from '../services/policyAPI';

export interface Task extends TaskResponse {
  taskType: string;
  input: string;
}

export interface Agent extends Omit<AgentHealth, 'status'> {
  status: 'healthy' | 'idle' | 'running' | 'evaluating' | 'degraded' | 'offline';
  type: string;
  activeTasks: number;
  totalExecuted: number;
  avgDuration: number;
}

interface DashboardContextType {
  agents: Agent[];
  logs: AuditLog[];
  stats: Statistics | null;
  health: HealthStatus | null;
  isLoading: boolean;
  isWebSocketConnected: boolean;
  error: string | null;
  selectedLog: AuditLog | null;
  runTask: (agentId: string, taskType: string, input: string) => Promise<void>;
  refreshLogs: (agentId?: string) => Promise<void>;
  refreshHealth: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearLogs: () => void;
  clearError: () => void;
  setSelectedLog: (log: AuditLog | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // State Management
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  // Refs
  const logsRef = useRef<AuditLog[]>([]);
  const maxLogsRef = useRef(200);

  // Update logs ref when logs change
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  const isInitialized = useRef(false);

  // Initialize data on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch initial data in parallel
        const [healthData, statsData] = await Promise.all([
          policyAPI.getHealth().catch(() => null),
          policyAPI.getStatistics().catch(() => null),
        ]);

        if (healthData) {
          setHealth(healthData);
          const agentsArray = Array.isArray(healthData.agents)
            ? healthData.agents
            : typeof healthData.agents === 'object' && healthData.agents !== null
              ? Object.values(healthData.agents)
              : [];

          const initialAgents: Agent[] = agentsArray.map(
            (ah: any) => ({
              id: ah.id || ah.agentId,
              name: ah.name || ah.agentId || ah.id,
              type: 'default',
              status: (ah.status === 'healthy' ? 'idle' : ah.status || 'idle') as Agent['status'],
              metrics: ah.metrics || {},
              tasksProcessed: ah.tasksProcessed || ah.totalTasks || 0,
              successRate: ah.successRate || 0,
              lastHeartbeat: ah.lastHeartbeat || new Date().toISOString(),
              activeTasks: ah.activeTasks || 0,
              totalExecuted: ah.tasksProcessed || ah.totalTasks || 0,
              avgDuration: ah.avgDuration || 0,
            })
          );
          setAgents(initialAgents);
        }

        if (statsData) {
          setStats(statsData);
        }

        // Fetch initial logs
        await refreshLogs();

        // Connect to WebSocket
        await connectWebSocket();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize dashboard';
        setError(message);
        console.error('[DashboardProvider] Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // No disconnect on unmount in dev to avoid StrictMode flapping
    // return () => {
    //   policyAPI.disconnectWebSocket();
    // };
  }, []);

  // WebSocket Connection Handler
  const connectWebSocket = useCallback(async () => {
    try {
      await policyAPI.connectWebSocket(
        (message: WebSocketMessage) => {
          handleWebSocketMessage(message);
        },
        (error: Event) => {
          console.error('[WebSocket] Error:', error);
          setIsWebSocketConnected(false);
        },
        (event: CloseEvent) => {
          console.log('[WebSocket] Closed:', event.code, event.reason);
          setIsWebSocketConnected(false);
        }
      );

      setIsWebSocketConnected(true);
      addLog('Connected to real-time updates', 'system');
    } catch (err) {
      console.error('[WebSocket] Connection failed:', err);
      setIsWebSocketConnected(false);
    }
  }, []);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    try {
      const payload = (message as any).data || message.payload;

      switch (message.type) {
        case 'init': {
          const { recentLogs, health: healthData, stats: statsData } = payload;
          if (healthData) {
            setHealth(healthData);
            if (healthData) {
              setHealth(healthData);
              const agentsArray = Array.isArray(healthData.agents)
                ? healthData.agents
                : typeof healthData.agents === 'object' && healthData.agents !== null
                  ? Object.values(healthData.agents)
                  : [];

              const initialAgents: Agent[] = agentsArray.map((ah: any) => ({
                id: ah.id || ah.agentId,
                name: ah.name || ah.agentId || ah.id,
                type: 'default',
                status: (ah.status === 'healthy' ? 'idle' : ah.status || 'idle') as Agent['status'],
                metrics: ah.metrics || {},
                tasksProcessed: ah.tasksProcessed || ah.totalTasks || 0,
                successRate: ah.successRate || 0,
                lastHeartbeat: ah.lastHeartbeat || new Date().toISOString(),
                activeTasks: ah.activeTasks || 0,
                totalExecuted: ah.tasksProcessed || ah.totalTasks || 0,
                avgDuration: ah.avgDuration || 0,
              }));
              setAgents(initialAgents);
            }
          }
          if (statsData) setStats(statsData);
          if (recentLogs && Array.isArray(recentLogs)) {
            const converted = recentLogs.map((log: AuditLog) => ({
              ...log,
              message: log.action,
              status: log.decision as any,
            }));
            setLogs(converted);
          }
          break;
        }

        case 'log': {
          const logEntry = payload as AuditLog;
          addLog(logEntry.action, logEntry.decision as any, logEntry.details);
          break;
        }

        case 'update': {
          const { eventType, data } = message as any;
          if (eventType === 'stats') {
            setStats(data);
          } else if (eventType === 'health') {
            setHealth(data);
          }
          break;
        }

        case 'health': {
          const healthData = payload as HealthStatus;
          setHealth(healthData);

          const agentsArray = Array.isArray(healthData.agents)
            ? healthData.agents
            : typeof healthData.agents === 'object' && healthData.agents !== null
              ? Object.values(healthData.agents)
              : [];

          setAgents((prev) =>
            prev.map((agent) => {
              const healthAgent: any = agentsArray.find((ha: any) => (ha.id || ha.agentId) === agent.id);
              if (healthAgent) {
                return {
                  ...agent,
                  status: (healthAgent.status === 'healthy' ? 'idle' : healthAgent.status || 'idle') as Agent['status'],
                  metrics: healthAgent.metrics || {},
                  tasksProcessed: healthAgent.tasksProcessed || healthAgent.totalTasks || 0,
                  successRate: healthAgent.successRate || 0,
                  lastHeartbeat: healthAgent.lastHeartbeat || new Date().toISOString(),
                };
              }
              return agent;
            })
          );
          break;
        }

        case 'stats': {
          const statsData = payload as Statistics;
          setStats(statsData);
          break;
        }

        case 'agent-update': {
          const agentUpdate = message.payload as Partial<Agent>;
          if (agentUpdate.id) {
            setAgents((prev) =>
              prev.map((agent) =>
                agent.id === agentUpdate.id
                  ? { ...agent, ...agentUpdate }
                  : agent
              )
            );
          }
          break;
        }

        case 'error': {
          const errorMessage = (message.payload as any)?.message || 'Unknown error';
          setError(errorMessage);
          addLog(errorMessage, 'error');
          break;
        }

        default:
          console.warn('[WebSocket] Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('[WebSocket] Error handling message:', err);
    }
  }, []);

  // Add log helper
  const addLog = useCallback(
    (message: string, status: any = 'system', details?: Record<string, any>) => {
      const newLog: any = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        message,
        status,
        details,
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev];
        // Keep only the last maxLogs entries
        return updated.slice(0, maxLogsRef.current);
      });
    },
    []
  );

  // Refresh Methods
  const refreshLogs = useCallback(async (agentId?: string) => {
    try {
      const response = await policyAPI.getLogs(agentId, 50);
      const logsData = Array.isArray(response) ? response : (response as any).logs || [];
      const convertedLogs: any[] = logsData.map((log: AuditLog) => ({
        ...log,
        message: log.action,
        status: log.decision as any,
      }));
      setLogs(convertedLogs);
    } catch (err) {
      console.error('[DashboardProvider] Failed to refresh logs:', err);
      const message = err instanceof Error ? err.message : 'Failed to refresh logs';
      addLog(message, 'error');
    }
  }, [addLog]);

  const refreshHealth = useCallback(async () => {
    try {
      const healthData = await policyAPI.getHealth();
      setHealth(healthData);

      const updatedAgents: Agent[] = healthData.agents.map(
        (agentHealth: AgentHealth) => ({
          id: agentHealth.id,
          name: agentHealth.name,
          type: 'default',
          status: (agentHealth.status === 'healthy' ? 'idle' : agentHealth.status) as Agent['status'],
          metrics: agentHealth.metrics,
          tasksProcessed: agentHealth.tasksProcessed,
          successRate: agentHealth.successRate,
          lastHeartbeat: agentHealth.lastHeartbeat,
          activeTasks: 0,
          totalExecuted: agentHealth.tasksProcessed || 0,
          avgDuration: 0,
        })
      );

      setAgents(updatedAgents);
    } catch (err) {
      console.error('[DashboardProvider] Failed to refresh health:', err);
      const message = err instanceof Error ? err.message : 'Failed to refresh health';
      addLog(message, 'error');
    }
  }, [addLog]);

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await policyAPI.getStatistics();
      setStats(statsData);
    } catch (err) {
      console.error('[DashboardProvider] Failed to refresh statistics:', err);
      const message = err instanceof Error ? err.message : 'Failed to refresh statistics';
      addLog(message, 'error');
    }
  }, [addLog]);

  // Task execution
  const runTask = useCallback(
    async (agentId: string, taskType: string, input: string) => {
      const taskId = `task-${Date.now()}`;

      try {
        // Add task to UI optimistically
        const newTask: any = {
          id: taskId,
          agentId,
          taskType,
          status: 'pending',
          input,
          timestamp: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, status: 'running' } : a
          )
        );

        // Execute task
        const taskRequest: TaskRequest = {
          agentId,
          taskType,
          input,
          metadata: { timestamp: Date.now() },
        };

        const response = await policyAPI.executeTask(taskRequest);

        // Update task with response
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                ...t,
                status: response.status as any,
                result: response.result,
              }
              : t
          )
        );

        // Add log entry
        addLog(
          `Task ${response.id} ${response.result.decision}ed by policy`,
          response.result.decision as any,
          { taskId: response.id, rules: response.result.rulesTriggered }
        );

        // Reset agent status
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, status: 'idle' } : a
          )
        );
      } catch (err) {
        console.error('[DashboardProvider] Task execution failed:', err);
        const message = err instanceof Error ? err.message : 'Task execution failed';

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: 'failed' }
              : t
          )
        );

        addLog(`Task failed: ${message}`, 'error');
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, status: 'idle' } : a
          )
        );
      }
    },
    [addLog]
  );

  // Utility functions
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Provide all required context values
  const value: DashboardContextType = {
    agents,
    logs,
    stats,
    health,
    isLoading,
    isWebSocketConnected,
    error,
    selectedLog,
    runTask,
    refreshLogs,
    refreshHealth,
    refreshStats,
    clearLogs,
    clearError,
    setSelectedLog,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
