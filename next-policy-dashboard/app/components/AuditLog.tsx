'use client';

import React, { useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Terminal } from 'lucide-react';

export default function AuditLog() {
    const { logs, clearLogs } = useDashboard();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (status: string) => {
        switch (status) {
            case 'allow': return 'text-green-400';
            case 'deny': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            case 'pending': return 'text-amber-400';
            default: return 'text-blue-400';
        }
    };

    return (
        <div className="flex flex-col h-full glass overflow-hidden">
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Terminal size={14} />
                    Audit Trail & Logs
                </div>
                <button
                    onClick={clearLogs}
                    className="text-[10px] text-gray-500 hover:text-white transition-colors"
                >
                    CLEAR TERMINAL
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 scrollbar-custom"
            >
                {logs.length === 0 ? (
                    <div className="text-gray-600 italic">No activity logs recorded yet. Waiting for system triggers...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 items-start">
                            <span className="text-gray-600 whitespace-nowrap min-w-[70px]">[{log.timestamp}]</span>
                            <div className="flex-1">
                                <span className={getLogColor(log.status)}>{log.message}</span>
                                {log.latencyMs !== undefined && (
                                    <span className="ml-2 text-[10px] text-gray-600">
                                        ({log.latencyMs.toFixed(2)}ms {log.confidence ? `| ${(log.confidence * 100).toFixed(0)}% conf` : ''})
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
