import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { policyAPI, Agent, Task } from '../services/policyAPI';

export interface LogEntry {
    message: string;
    status: 'allow' | 'deny' | 'warn' | 'pending' | 'system';
    timestamp: string;
    latencyMs?: number;
    confidence?: number;
    originalId?: number;
}

interface DashboardContextType {
    agents: Agent[];
    tasks: Task[];
    logs: LogEntry[];
    runTask: (agentId: string, taskInput: string, taskData: any) => Promise<void>;
    clearLogs: () => void;
    filter: string;
    setFilter: (filter: string) => void;

    // Policy Management
    // Policy Management
    activeView: 'monitoring' | 'policies' | 'violations' | 'agents' | 'analytics';
    setActiveView: (view: 'monitoring' | 'policies' | 'violations' | 'agents' | 'analytics') => void;
    policies: any[];
    refreshPolicies: () => Promise<void>;
    savePolicy: (policy: any) => Promise<void>;
    deletePolicy: (id: string) => Promise<void>;
    stats: any; // Added stats
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [agents, setAgents] = useState<Agent[]>([
        { id: 'support_bot_01', name: 'SupportBot', type: 'support', status: 'idle', taskCount: 0 },
        { id: 'admin_bot_01', name: 'AdminBot', type: 'admin', status: 'idle', taskCount: 0 },
        { id: 'data_miner_01', name: 'DataMiner', type: 'data_miner', status: 'idle', taskCount: 0 },
        { id: 'agent-001', name: 'Alpha-Data', type: 'data-processing', status: 'idle', taskCount: 0 },
    ]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState('');

    // Policy State
    const [activeView, setActiveView] = useState<'monitoring' | 'policies' | 'violations' | 'agents' | 'analytics'>('monitoring');
    const [policies, setPolicies] = useState<any[]>([]);

    // Stats State
    const [stats, setStats] = useState<any>(null);

    // Load Policies
    const refreshPolicies = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8082/api/policies');
            if (res.ok) setPolicies(await res.json());
        } catch (e) {
            console.error(e);
        }
    }, []);

    const savePolicy = async (policy: any) => {
        try {
            await fetch('http://localhost:8082/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policy)
            });
            await refreshPolicies();
        } catch (e) { console.error(e); }
    };

    const deletePolicy = async (id: string) => {
        try {
            await fetch(`http://localhost:8082/api/policies/${id}`, { method: 'DELETE' });
            await refreshPolicies();
        } catch (e) { console.error(e); }
    };

    // Polling for real-time logs & stats from Backend
    useEffect(() => {
        refreshPolicies(); // Initial load

        const fetchLogsAndStats = async () => {
            try {
                // Fetch Logs
                const logRes = await fetch('http://localhost:8082/api/logs');
                if (logRes.ok) {
                    const data = await logRes.json();
                    const newLogs: LogEntry[] = data.map((item: any) => ({
                        message: `[${item.agent_id || 'system'}] ${item.action_type}: ${item.reason || 'Processed'}`,
                        status: item.status || (item.allowed ? 'allow' : 'deny'),
                        timestamp: new Date(item.timestamp).toLocaleTimeString(),
                        latencyMs: item.latency_ms,
                        confidence: item.confidence,
                        originalId: item.id
                    }));
                    setLogs(newLogs.slice(0, 50));

                    // Update Agent Status
                    const activeAgents = new Set(data.slice(0, 10).map((d: any) => d.agent_id));
                    setAgents(prev => prev.map(a => ({
                        ...a,
                        status: activeAgents.has(a.id) ? 'running' : 'idle',
                        taskCount: data.filter((d: any) => d.agent_id === a.id).length
                    })));

                    const recentTasks: Task[] = data.slice(0, 20).map((item: any) => ({
                        id: `T-${item.id}`,
                        agentId: item.agent_id,
                        agentName: item.agent_id,
                        type: 'auto',
                        status: item.allowed ? 'completed' : 'blocked',
                        policyResult: item.status || (item.allowed ? 'allow' : 'deny'),
                        input: item.metadata,
                        data: {},
                        reason: item.reason,
                        actions: []
                    }));
                    setTasks(recentTasks);
                }

                // Fetch Stats
                const statsRes = await fetch('http://localhost:8082/api/stats');
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                }

            } catch (e) {
                console.error("Failed to fetch backend data", e);
            }
        };

        const interval = setInterval(fetchLogsAndStats, 2000);
        return () => clearInterval(interval);
    }, [refreshPolicies]);

    const runTask = useCallback(async (agentId: string, taskInput: string, taskData: any) => {
        console.log("Manual task run - syncing with backend logs soon...");
    }, []);

    const clearLogs = () => setLogs([]);

    return (
        <DashboardContext.Provider value={{
            agents, tasks, logs, runTask, clearLogs, filter, setFilter,
            activeView, setActiveView, policies, refreshPolicies, savePolicy, deletePolicy,
            stats // Exposed stats
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

