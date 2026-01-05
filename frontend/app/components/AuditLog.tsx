'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { type AuditLog as DashboardLog } from '../services/policyAPI';
import {
    Terminal,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Download,
    Trash2,
    ChevronDown,
} from 'lucide-react';

interface AuditLogProps {
    maxEntries?: number;
    showFilters?: boolean;
}

type FilterStatus = 'all' | 'allow' | 'deny' | 'pending' | 'system' | 'error';

export default function AuditLog({
    maxEntries = 100,
    showFilters = true,
}: AuditLogProps) {
    const { logs, clearLogs } = useDashboard();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            // Use setTimeout to ensure DOM has updated
            setTimeout(() => {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }, 0);
        }
    }, [logs]);

    // Filter logs based on status and search query
    const filteredLogs = logs
        .slice(0, maxEntries)
        .filter((log) => {
            if (filterStatus !== 'all' && (log as any).status !== filterStatus) {
                return false;
            }
            if (
                searchQuery &&
                !(log as any).message.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !log.id.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            return true;
        });

    const getLogIcon = (status: any) => {
        switch (status) {
            case 'allow':
                return <CheckCircle size={14} className="text-green-400" />;
            case 'deny':
                return <XCircle size={14} className="text-red-400" />;
            case 'pending':
                return <Clock size={14} className="text-yellow-400 animate-spin" />;
            case 'error':
                return <AlertCircle size={14} className="text-red-500" />;
            default:
                return <Terminal size={14} className="text-blue-400" />;
        }
    };

    const getLogColor = (status: any): string => {
        switch (status) {
            case 'allow':
                return 'text-green-400 dark:text-green-300';
            case 'deny':
                return 'text-red-400 dark:text-red-300';
            case 'pending':
                return 'text-yellow-400 dark:text-yellow-300';
            case 'error':
                return 'text-red-500 dark:text-red-400';
            case 'system':
                return 'text-blue-400 dark:text-blue-300';
            default:
                return 'text-gray-400 dark:text-gray-500';
        }
    };

    const formatTimestamp = (isoString: string): string => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    const formatDetailsValue = (value: any): string => {
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const exportLogs = () => {
        const csvContent = [
            ['ID', 'Timestamp', 'Status', 'Message'].join(','),
            ...filteredLogs.map((log) =>
                [
                    log.id,
                    log.timestamp,
                    (log as any).status,
                    `"${(log as any).message.replace(/"/g, '""')}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col h-full rounded-lg border border-white/10 overflow-hidden bg-gradient-to-b from-white/5 to-transparent dark:from-white/5 dark:to-transparent">
            {/* Header */}
            <div className="p-3 border-b border-white/10 bg-white/5 dark:bg-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-300 uppercase tracking-widest">
                        <Terminal size={14} />
                        System Audit Trail
                    </div>
                    <div className="flex items-center gap-2">
                        {filteredLogs.length > 0 && (
                            <>
                                <button
                                    onClick={exportLogs}
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                                    title="Export logs"
                                >
                                    <Download size={14} />
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setSearchQuery('');
                                        clearLogs();
                                    }}
                                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                                    title="Clear logs"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="flex gap-2">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                        />

                        {/* Filter Dropdown */}
                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value as FilterStatus)
                            }
                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                            aria-label="Filter logs by status"
                            title="Filter logs by status"
                        >
                            <option value="all">All</option>
                            <option value="allow">Allowed</option>
                            <option value="deny">Denied</option>
                            <option value="pending">Pending</option>
                            <option value="system">System</option>
                            <option value="error">Errors</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Logs Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
            >
                {filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 py-8">
                            {logs.length === 0 ? (
                                <>
                                    <Terminal size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-[11px] italic">
                                        Initializing secure session...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Filter size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-[11px] italic">
                                        No logs match your filters
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="group rounded border border-transparent hover:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200"
                        >
                            {/* Main Log Line */}
                            <div
                                onClick={() =>
                                    setExpandedLogId(
                                        expandedLogId === log.id ? null : log.id
                                    )
                                }
                                className="flex items-center gap-2 p-2 cursor-pointer"
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    {getLogIcon((log as any).status)}
                                </div>

                                {/* Timestamp */}
                                <span className="text-gray-500 flex-shrink-0 min-w-fit">
                                    {formatTimestamp(log.timestamp)}
                                </span>

                                {/* Status Badge */}
                                <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${getLogColor((log as any).status)} opacity-70`}
                                >
                                    {(log as any).status}
                                </span>

                                {/* Message */}
                                <span className="text-gray-300 flex-1 truncate">
                                    {(log as any).message}
                                </span>

                                {/* Expand Indicator */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <ChevronDown
                                        size={14}
                                        className={`flex-shrink-0 text-gray-400 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''
                                            }`}
                                    />
                                )}
                            </div>

                            {/* Expanded Details */}
                            {expandedLogId === log.id && log.details && (
                                <div className="px-4 py-2 bg-black/20 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="text-[10px] text-gray-400 space-y-1">
                                        {Object.entries(log.details).map(
                                            ([key, value]) => (
                                                <div key={key} className="grid grid-cols-2 gap-4">
                                                    <span className="font-bold text-gray-500">
                                                        {key}:
                                                    </span>
                                                    <span className="text-gray-300 font-mono break-words">
                                                        {formatDetailsValue(
                                                            value
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {logs.length > 0 && (
                <div className="px-3 py-2 border-t border-white/10 bg-white/5 dark:bg-white/5 text-[10px] text-gray-400 flex justify-between items-center">
                    <span>
                        Showing {filteredLogs.length} of {logs.length} entries
                    </span>
                    {maxEntries && logs.length > maxEntries && (
                        <span className="text-yellow-500">
                            (Limited to {maxEntries} most recent)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
