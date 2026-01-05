'use client';

import React, { useState } from 'react';
import { Task } from '../context/DashboardContext';
import {
    ShieldCheck,
    ShieldAlert,
    Clock,
    AlertTriangle,
    ChevronDown,
    TrendingUp,
    ZapOff,
} from 'lucide-react';
import styles from './TaskCard.module.css';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
}

export default function TaskCard({ task, compact = false }: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getWidthClass = (percent: number) => {
        const rounded = Math.round(Math.min(Math.max(percent, 0), 100) / 5) * 5;
        return (styles as any)[`w${rounded}`];
    };

    const getStatusColor = (): string => {
        switch (task.status) {
            case 'completed':
                if (task.result?.decision === 'allow') {
                    return 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 text-green-400 dark:text-green-300';
                }
                return 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-400 dark:text-red-300';
            case 'failed':
                return 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-400 dark:text-red-300';
            case 'running':
            case 'pending':
                return 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-400 dark:text-blue-300';
            case 'blocked':
                return 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5 text-orange-400 dark:text-orange-300';
            default:
                return 'border-white/10 bg-white/5 text-gray-500 dark:text-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return task.result?.decision === 'allow' ? (
                    <ShieldCheck size={16} className="text-green-400" />
                ) : (
                    <ShieldAlert size={16} className="text-red-400" />
                );
            case 'failed':
                return <AlertTriangle size={16} className="text-red-400" />;
            case 'running':
            case 'pending':
                return <Clock size={16} className="text-blue-400 animate-pulse" />;
            case 'blocked':
                return <ZapOff size={16} className="text-orange-400" />;
            default:
                return <AlertTriangle size={16} className="text-gray-400" />;
        }
    };

    const getStatusLabel = (): string => {
        if (task.status === 'completed' && task.result) {
            return (task.result.decision || 'unknown').toUpperCase();
        }
        return (task.status || 'unknown').toUpperCase();
    };

    const formatDuration = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <div
            className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor()} hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono opacity-60 uppercase tracking-wider">
                            #{task.id?.substring(0, 8) ?? 'unknown'}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 opacity-70">
                            {task.taskType}
                        </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white truncate">
                        {task.input?.substring(0, 60) ?? 'No input data'}
                        {(task.input?.length ?? 0) > 60 ? '...' : ''}
                    </h4>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon()}
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Status and Metadata Row */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase opacity-80">
                        {getStatusLabel()}
                    </span>
                    {task.result?.duration && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(task.result.duration)}
                        </span>
                    )}
                </div>
                {task.result?.decision === 'allow' && (
                    <TrendingUp size={14} className="text-green-400" />
                )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Agent Info */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Agent
                        </span>
                        <code className="text-[12px] text-white/80 font-mono bg-black/20 px-2 py-1 rounded block">
                            {task.agentId}
                        </code>
                    </div>

                    {/* Result Details */}
                    {task.result && (
                        <>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                    Confidence Score
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${task.result.confidence > 0.7
                                                ? 'bg-green-500'
                                                : task.result.confidence > 0.4
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                } ${getWidthClass(task.result.confidence * 100)}`}
                                        />
                                    </div>
                                    <span className="text-[12px] font-mono text-white min-w-fit">
                                        {(task.result.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Rules Triggered */}
                            {task.result.rulesTriggered && task.result.rulesTriggered.length > 0 && (
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">
                                        Rules Triggered ({task.result.rulesTriggered.length})
                                    </span>
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {task.result.rulesTriggered.map((rule: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="text-[11px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300 font-mono truncate"
                                            >
                                                • {rule}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Timestamp */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Timestamp
                        </span>
                        <span className="text-[11px] text-gray-300 font-mono">
                            {new Date(task.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
