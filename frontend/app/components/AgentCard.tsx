'use client';

import React, { useCallback, useState } from 'react';
import { Agent, useDashboard } from '../context/DashboardContext';
import {
    Play,
    Activity,
    Cpu,
    HardDrive,
    Zap,
    AlertCircle,
    Check,
    TrendingUp,
} from 'lucide-react';
import styles from './AgentCard.module.css';

interface AgentCardProps {
    agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
    const { runTask } = useDashboard();
    const [isExecuting, setIsExecuting] = useState(false);

    const getStatusColor = (): string => {
        switch (agent.status) {
            case 'healthy':
            case 'idle':
                return 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent text-green-400 dark:text-green-300';
            case 'running':
            case 'evaluating':
                return 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-400 dark:text-blue-300';
            case 'degraded':
                return 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent text-yellow-400 dark:text-yellow-300';
            case 'offline':
                return 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent text-red-400 dark:text-red-300';
            default:
                return 'border-white/10 bg-white/5 text-gray-400 dark:text-gray-500';
        }
    };

    const getStatusIcon = () => {
        switch (agent.status) {
            case 'healthy':
            case 'idle':
                return <Check size={16} className="text-green-400" />;
            case 'running':
            case 'evaluating':
                return <Activity size={16} className="text-blue-400 animate-pulse" />;
            case 'degraded':
                return <AlertCircle size={16} className="text-yellow-400" />;
            case 'offline':
                return <AlertCircle size={16} className="text-red-400" />;
            default:
                return <Activity size={16} className="text-gray-400" />;
        }
    };

    const getStatusLabel = (): string => {
        const statusMap: Record<string, string> = {
            healthy: 'HEALTHY',
            idle: 'IDLE',
            running: 'RUNNING',
            evaluating: 'EVALUATING',
            degraded: 'DEGRADED',
            offline: 'OFFLINE',
        };
        return statusMap[agent.status] || agent.status.toUpperCase();
    };

    const isActiveOrBusy = agent.status !== 'idle' && agent.status !== 'healthy';
    const isOffline = agent.status === 'offline';

    const handleTrigger = useCallback(async () => {
        if (isExecuting || isActiveOrBusy || isOffline) return;

        setIsExecuting(true);

        try {
            // Sample task scenarios
            const scenarios = [
                {
                    type: 'standard',
                    message: 'Process log batch #441',
                },
                {
                    type: 'sensitive-op',
                    message: 'Access credential vault',
                },
                {
                    type: 'unauthorized',
                    message: 'External probe request',
                },
            ];

            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            await runTask(agent.id, scenario.type, scenario.message);
        } catch (error) {
            console.error('Failed to execute task:', error);
        } finally {
            setIsExecuting(false);
        }
    }, [agent.id, isExecuting, isActiveOrBusy, isOffline, runTask]);

    const successRate = agent.successRate ?? 0;
    const cpuUsage = agent.metrics.cpu ?? 0;
    const memoryUsage = agent.metrics.memory ?? 0;

    const getWidthClass = (percent: number) => {
        const rounded = Math.round(Math.min(Math.max(percent, 0), 100) / 5) * 5;
        return (styles as any)[`w${rounded}`];
    };

    return (
        <div
            className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor()} hover:border-opacity-60 hover:bg-opacity-100`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white truncate">
                            {agent.name}
                        </h3>
                        <div className="flex-shrink-0">
                            {getStatusIcon()}
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono uppercase opacity-70">
                        {agent.type}
                    </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/10 whitespace-nowrap">
                    {getStatusLabel()}
                </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {/* CPU */}
                <div className="p-2 bg-black/30 dark:bg-black/50 rounded border border-white/10 text-center">
                    <div className="flex items-center justify-center mb-1 opacity-70">
                        <Cpu size={12} />
                    </div>
                    <span className="block text-[8px] text-gray-400 uppercase font-bold mb-1">
                        CPU
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                        {cpuUsage.toFixed(0)}%
                    </span>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={`${styles.progressBar} ${getWidthClass(cpuUsage)} ${cpuUsage > 80
                                ? 'bg-red-500'
                                : cpuUsage > 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Memory */}
                <div className="p-2 bg-black/30 dark:bg-black/50 rounded border border-white/10 text-center">
                    <div className="flex items-center justify-center mb-1 opacity-70">
                        <HardDrive size={12} />
                    </div>
                    <span className="block text-[8px] text-gray-400 uppercase font-bold mb-1">
                        MEM
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                        {(memoryUsage / 1024).toFixed(1)}G
                    </span>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={`${styles.progressBar} ${getWidthClass((memoryUsage / 16384) * 100)} ${memoryUsage > 8192
                                ? 'bg-red-500'
                                : memoryUsage > 4096
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Success Rate */}
                <div className="p-2 bg-black/30 dark:bg-black/50 rounded border border-white/10 text-center">
                    <div className="flex items-center justify-center mb-1 opacity-70">
                        <TrendingUp size={12} />
                    </div>
                    <span className="block text-[8px] text-gray-400 uppercase font-bold mb-1">
                        Success
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                        {(successRate * 100).toFixed(0)}%
                    </span>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={`${styles.progressBar} ${getWidthClass(successRate * 100)} bg-blue-500`}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {(agent.tasksProcessed || agent.lastHeartbeat) && (
                <div className="text-[9px] text-gray-400 space-y-1 mb-3 p-2 bg-white/5 rounded border border-white/5">
                    {agent.tasksProcessed !== undefined && (
                        <div className="flex justify-between">
                            <span>Tasks Processed:</span>
                            <span className="text-white font-mono">
                                {agent.tasksProcessed}
                            </span>
                        </div>
                    )}
                    {agent.lastHeartbeat && (
                        <div className="flex justify-between">
                            <span>Last Heartbeat:</span>
                            <span className="text-white font-mono text-[8px]">
                                {new Date(agent.lastHeartbeat).toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleTrigger}
                disabled={isActiveOrBusy || isOffline || isExecuting}
                className={`w-full py-2 px-3 rounded font-bold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 border ${isOffline
                    ? 'bg-red-900/20 text-red-400 border-red-500/20 cursor-not-allowed opacity-50'
                    : isActiveOrBusy || isExecuting
                        ? 'bg-blue-900/20 text-blue-400 border-blue-500/20 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 cursor-pointer'
                    }`}
            >
                <Play size={12} />
                {isExecuting
                    ? 'Executing...'
                    : isActiveOrBusy
                        ? 'Processing...'
                        : isOffline
                            ? 'Offline'
                            : 'Execute Task'}
            </button>
        </div>
    );
}
