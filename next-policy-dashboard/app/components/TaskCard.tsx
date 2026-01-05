'use client';

import React from 'react';
import { Task } from '../services/policyAPI';
import { ShieldCheck, ShieldAlert, Clock, AlertCircle } from 'lucide-react';

export default function TaskCard({ task }: { task: Task }) {
    const getStatusConfig = () => {
        switch (task.status) {
            case 'completed':
                return {
                    color: 'text-green-400',
                    border: 'border-green-500/30',
                    bg: 'bg-green-500/5',
                    icon: <ShieldCheck size={18} />,
                    label: 'ALLOWED'
                };
            case 'blocked':
                return {
                    color: 'text-red-400',
                    border: 'border-red-500/30',
                    bg: 'bg-red-500/5',
                    icon: <ShieldAlert size={18} />,
                    label: 'DENIED'
                };
            default:
                return {
                    color: 'text-amber-400',
                    border: 'border-amber-500/30',
                    bg: 'bg-amber-500/5',
                    icon: <Clock size={18} className="animate-spin-slow" />,
                    label: 'PROCESSING'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all duration-500`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-white text-sm">Task #{task.id}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">ID: {task.agentId} • {task.type}</p>
                </div>
                <div className={config.color}>{config.icon}</div>
            </div>

            <div className="mb-3">
                <p className="text-xs text-gray-300 font-medium">"{task.input}"</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className={`text-[10px] font-black tracking-[0.2em] ${config.color}`}>
                    {config.label}
                </span>
                {task.reason && (
                    <span className="text-[10px] text-gray-500 italic max-w-[150px] truncate" title={task.reason}>
                        {task.reason}
                    </span>
                )}
            </div>

            {task.actions && task.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {task.actions.map((action, i) => {
                        const key = Object.keys(action)[0];
                        const val = Object.values(action)[0];
                        return (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-400 border border-white/10 uppercase">
                                {key}: {val}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
