'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Filter, Eye, ShieldAlert, Archive } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Violation {
    id: number;
    timestamp: string;
    agent_id: string;
    policy_id: string;
    status: 'deny' | 'warn';
    reason: string;
    metadata: any;
    resolution_status: 'open' | 'reviewed' | 'ignored' | 'exception';
    resolution_comment?: string;
    resolved_at?: string;
}

interface ViolationsViewProps { }

export default function ViolationsView({ }: ViolationsViewProps) {
    const { showToast } = useToast();
    const [violations, setViolations] = useState<any[]>([]);
    const [selectedViolation, setSelectedViolation] = useState<any | null>(null);
    const [filter, setFilter] = useState({ status: 'open', agentId: '' });

    // Missing local state
    const [comment, setComment] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(25);
    const [total, setTotal] = useState(0);
    const totalPages = Math.ceil(total / limit);

    const fetchViolations = async () => {
        try {
            const query = new URLSearchParams({
                status: filter.status,
                agentId: filter.agentId,
                page: page.toString(),
                limit: limit.toString()
            });
            const res = await fetch(`http://localhost:8082/api/violations?${query}`);
            if (res.ok) {
                const data = await res.json();
                // Handle both old array format and new paginated format for backward compat during dev
                if (Array.isArray(data)) {
                    setViolations(data);
                    setTotal(data.length);
                } else {
                    setViolations(data.items);
                    setTotal(data.total);
                }
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to fetch violations', 'error');
        }
    };

    useEffect(() => {
        fetchViolations();
        const interval = setInterval(fetchViolations, 5000);
        return () => clearInterval(interval);
    }, [filter, page]); // Re-fetch on filter or page change

    const handleResolve = async (status: string) => {
        if (!selectedViolation) return;
        try {
            await fetch(`http://localhost:8082/api/violations/${selectedViolation.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, comment })
            });
            showToast(`Violation marked as ${status}`, 'success');
            setSelectedViolation(null);
            setComment(''); // Reset comment
            fetchViolations();
        } catch (e) {
            console.error(e);
            showToast('Failed to update violation', 'error');
        }
    };

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* List View */}
            <div className={`flex-1 flex flex-col gap-4 overflow-hidden ${selectedViolation ? 'hidden md:flex' : 'flex'}`}>
                {/* Filters */}
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Filter size={16} className="text-gray-400 ml-2" />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="bg-transparent text-sm text-white focus:outline-none"
                        title="Filter Violations by Status"
                        aria-label="Filter Violations by Status"
                    >
                        <option value="open">Open Violations</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="ignored">False Positive</option>
                        <option value="all">All History</option>
                    </select>
                    <div className="flex-1" />
                    <button onClick={() => fetchViolations()} className="text-xs text-blue-400 hover:text-blue-300 px-3">Refresh</button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-xl relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Time</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Severity</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Agent</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Policy</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Status</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {violations.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No violations found.</td></tr>
                            ) : (
                                violations.map(v => (
                                    <tr key={v.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedViolation(v)}>
                                        <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{new Date(v.timestamp).toLocaleTimeString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.status === 'deny' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm font-mono text-blue-300">{v.agent_id}</td>
                                        <td className="p-3 text-sm text-gray-400">{v.policy_id}</td>
                                        <td className="p-3">
                                            {v.resolution_status === 'open' ? (
                                                <span className="text-xs text-green-400 font-bold flex items-center gap-1"><AlertTriangle size={12} /> New</span>
                                            ) : (
                                                <span className="text-xs text-gray-500 capitalize">{v.resolution_status}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                                title="View Details"
                                                aria-label="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-2">
                    <span className="text-xs text-gray-500">
                        Showing {total > 0 ? ((page - 1) * limit) + 1 : 0} - {Math.min(page * limit, total)} of {total}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                            title="Previous Page"
                            aria-label="Previous Page"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                            title="Next Page"
                            aria-label="Next Page"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            {selectedViolation && (
                <div className="w-full md:w-[400px] bg-[#0A0C10] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ShieldAlert size={18} className="text-red-500" />
                            Violation Details
                        </h3>
                        <button onClick={() => setSelectedViolation(null)} className="text-gray-400 hover:text-white" title="Close Details" aria-label="Close Details"><XCircle size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Summary */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Reason</label>
                                <div className="text-white text-sm bg-red-950/30 border border-red-500/20 p-3 rounded mt-1">
                                    {selectedViolation.reason}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Agent</label>
                                    <div className="text-gray-300 text-sm font-mono">{selectedViolation.agent_id}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Policy</label>
                                    <div className="text-gray-300 text-sm font-mono">{selectedViolation.policy_id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Input Data */}
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Input Context</label>
                            <div className="mt-1 bg-black rounded border border-white/10 p-3 overflow-x-auto">
                                <pre className="text-xs text-green-400 font-mono">
                                    {JSON.stringify(selectedViolation.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Audit Trail */}
                        {selectedViolation.resolution_status !== 'open' && (
                            <div className="bg-white/5 p-3 rounded border border-white/10">
                                <div className="text-xs text-gray-400 mb-1">Resolved on {new Date(selectedViolation.resolved_at!).toLocaleString()}</div>
                                <div className="text-sm text-white italic">"{selectedViolation.resolution_comment}"</div>
                                <div className="text-xs text-gray-500 capitalize mt-1 text-right">Status: {selectedViolation.resolution_status}</div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
                        {selectedViolation.resolution_status === 'open' ? (
                            <>
                                <textarea
                                    placeholder="Add resolution details..."
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-blue-500 outline-none resize-none h-20"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleResolve('reviewed')}
                                        className="bg-green-600 hover:bg-green-500 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Mark Reviewed
                                    </button>
                                    <button
                                        onClick={() => handleResolve('ignored')}
                                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Archive size={16} /> Mark False Positive
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => handleResolve('open')}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/50 py-2 rounded text-sm font-bold"
                            >
                                Re-open Case
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
