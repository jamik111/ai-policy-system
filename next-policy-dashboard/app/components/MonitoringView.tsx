import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard, LogEntry } from '../context/DashboardContext';
import { Play, Pause, X, Filter, Clock, Activity, AlertTriangle, CheckCircle, Search, Info } from 'lucide-react';

interface MonitoringViewProps { }

export default function MonitoringView({ }: MonitoringViewProps) {
    const { logs, stats, clearLogs, agents, policies } = useDashboard();

    // UI State
    const [isPaused, setIsPaused] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    // Filters
    const [filterText, setFilterText] = useState('');
    const [filterAgent, setFilterAgent] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPolicy, setFilterPolicy] = useState('all');

    // Display Data (buffered if paused)
    const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        if (!isPaused) {
            setDisplayLogs(logs);
        }
    }, [logs, isPaused]);

    // Derived Metrics from *visible* logs (or global stats if available, but let's compute real-time from buffer)
    const metrics = useMemo(() => {
        const total = displayLogs.length;
        if (total === 0) return { errorRate: 0, avgLatency: 0, rpm: 0 };

        const errors = displayLogs.filter(l => l.status === 'deny').length;
        const sumLatency = displayLogs.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0);

        // RPM approximation based on timestamp difference of buffer? 
        // Or just use stats from backend if reliable. Let's use backend stats where possible but fallback to local.
        // Backend 'stats' object has 'avg_latency' and 'tasks_today'.

        return {
            errorRate: Math.round((errors / total) * 100),
            avgLatency: Math.round(sumLatency / total),
            total
        };
    }, [displayLogs]);

    const filteredLogs = displayLogs.filter(log => {
        if (filterStatus !== 'all' && log.status !== filterStatus) return false;
        // Search text in message or reason
        if (filterText && !log.message.toLowerCase().includes(filterText.toLowerCase())) return false;
        // Agent and Policy parsing from message might be brittle if not structured.
        // LogEntry has 'message'. context logs construction: `[${item.agent_id}] ...`
        // Ideally LogEntry should have agentId and policyId fields.
        // Looking at DashboardContext, LogEntry has: message, status, timestamp, latencyMs, confidence, originalId.
        // It DOES NOT have specific agentId or policyId visible in interface, but message has [agentId].

        if (filterAgent !== 'all' && !log.message.includes(`[${filterAgent}]`)) return false;

        // Policy ID isn't strictly in LogEntry interface in the context snippet I saw, 
        // but 'reason' might contain it or 'message'. 
        // Actually, looking at context fetch:
        // `message: '[' + (item.agent_id || 'system') + '] ' + item.action_type + ': ' + (item.reason || 'Processed')`
        // So agent_id is in message. Policy ID isn't easily accessible without parsing or adding to interface.
        // I will stick to text filter for policy for now or add explicit field to context if needed later.

        return true;
    });

    return (
        <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Live Events"
                    value={(metrics.total || 0).toString()}
                    subvalue={isPaused ? "Paused" : "Streaming"}
                    icon={<Activity size={18} className="text-blue-400" />}
                    color="blue"
                />
                <MetricCard
                    label="Deny Rate"
                    value={`${metrics.errorRate}%`}
                    subvalue="Last 50 events"
                    icon={<AlertTriangle size={18} className="text-red-400" />}
                    color="red"
                />
                <MetricCard
                    label="Avg Latency"
                    value={`${metrics.avgLatency}ms`}
                    subvalue="Processing time"
                    icon={<Clock size={18} className="text-purple-400" />}
                    color="purple"
                />
                <MetricCard
                    label="Daily Total"
                    value={stats?.tasks_today?.toString() || '0'}
                    subvalue="System-wide"
                    icon={<CheckCircle size={18} className="text-green-400" />}
                    color="green"
                />
            </div>

            {/* Controls & Filters */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none w-48"
                        />
                    </div>

                    <FilterSelect
                        value={filterAgent}
                        onChange={setFilterAgent}
                        options={[{ value: 'all', label: 'All Agents' }, ...agents.map(a => ({ value: a.id, label: a.name }))]}
                    />

                    <FilterSelect
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'allow', label: 'Allowed' },
                            { value: 'deny', label: 'Denied' },
                            { value: 'warn', label: 'Warnings' }
                        ]}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${isPaused
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                            }`}
                    >
                        {isPaused ? <><Play size={14} /> Resume Stream</> : <><Pause size={14} /> Pause Stream</>}
                    </button>
                    <button
                        onClick={clearLogs}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                        title="Clear Logs"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Log Stream */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                <div className="flex-1 overflow-y-auto p-0 scrollbar-custom">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="sticky top-0 bg-[#0A0C10] border-b border-white/10 text-gray-500 uppercase font-bold z-10">
                            <tr>
                                <th className="p-3 w-24">Time</th>
                                <th className="p-3 w-20">Status</th>
                                <th className="p-3">Message</th>
                                <th className="p-3 w-24 text-right">Latency</th>
                                <th className="p-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.map((log, i) => (
                                <tr key={i} className={`hover:bg-white/5 transition-colors cursor-pointer group ${log.status === 'deny' ? 'bg-red-500/5' : ''}`} onClick={() => setSelectedLog(log)}>
                                    <td className="p-3 text-gray-400">{log.timestamp}</td>
                                    <td className="p-3">
                                        <StatusBadge status={log.status} />
                                    </td>
                                    <td className="p-3 text-gray-300 truncate max-w-md" title={log.message}>{log.message}</td>
                                    <td className="p-3 text-right text-gray-500">{log.latencyMs?.toFixed(0)}ms</td>
                                    <td className="p-3 text-right">
                                        <button className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="View Details" aria-label="View Details"><Info size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-600 italic">
                                        No logs match filter criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0A0C10] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                Event Details
                            </h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white" title="Close" aria-label="Close"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Timestamp</div>
                                    <div className="text-sm font-mono text-white">{selectedLog.timestamp}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Status</div>
                                    <div className="mt-1"><StatusBadge status={selectedLog.status} /></div>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded border border-white/5">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Message</div>
                                <div className="text-sm text-gray-300">{selectedLog.message}</div>
                            </div>

                            <div className="p-3 bg-white/5 rounded border border-white/5">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Technical Data</div>
                                <div className="grid grid-cols-3 gap-4 text-xs font-mono text-gray-400">
                                    <div>Latency: <span className="text-white">{selectedLog.latencyMs}ms</span></div>
                                    <div>Confidence: <span className="text-white">{selectedLog.confidence ? (selectedLog.confidence * 100).toFixed(0) : 0}%</span></div>
                                    <div>Ref ID: <span className="text-white">{selectedLog.originalId}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                            <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, subvalue, icon, color }: any) {
    return (
        <div className={`bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors`}>
            <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <div className="text-xl font-bold text-white leading-none mb-1">{value}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold opacity-70 mb-0.5">{label}</div>
                <div className="text-[10px] text-gray-500">{subvalue}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        allow: 'bg-green-500/10 text-green-400 border-green-500/20',
        deny: 'bg-red-500/10 text-red-400 border-red-500/20',
        warn: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    const s = status as keyof typeof styles;
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${styles[s] || styles.pending}`}>
            {status}
        </span>
    );
}

function FilterSelect({ value, onChange, options }: any) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none cursor-pointer hover:border-white/30"
            title="Filter Options"
            aria-label="Filter Options"
        >
            {options.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}
