import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Activity, RotateCcw, FileText } from 'lucide-react';

interface PolicyHistoryViewProps {
    policy: any;
    onBack: () => void;
    onRestore: (version: number) => Promise<void>;
}

export default function PolicyHistoryView({ policy, onBack, onRestore }: PolicyHistoryViewProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'versions' | 'logs'>('versions');

    useEffect(() => {
        // Fetch History & Logs
        Promise.all([
            fetch(`http://localhost:8082/api/policies/${policy.id}/versions`).then(r => r.json()),
            fetch(`http://localhost:8082/api/policies/${policy.id}/logs`).then(r => r.json())
        ]).then(([hData, lData]) => {
            if (Array.isArray(hData)) setHistory(hData);
            if (Array.isArray(lData)) setLogs(lData);
        }).catch(console.error);
    }, [policy.id]);

    return (
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Back" aria-label="Back"><ArrowLeft size={18} /></button>
                    <div>
                        <h2 className="font-bold text-white text-lg">{policy.id}</h2>
                        <p className="text-xs text-gray-400">Policy Details & History</p>
                    </div>
                </div>
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    <button onClick={() => setActiveTab('versions')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'versions' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Version History
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Recent Hits
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'versions' && (
                    <div className="space-y-4">
                        {history.map((ver: any) => (
                            <div key={ver.version} className="p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-all">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold font-mono">v{ver.version}</span>
                                        <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12} /> {new Date(ver.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 line-clamp-2 w-full max-w-lg font-mono">
                                        {JSON.stringify(ver.policy.rules)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRestore(ver.version)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-xs border border-white/10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <RotateCcw size={14} /> Restore
                                </button>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-center text-gray-500 py-10">No history found.</div>}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-2">
                        {logs.map((log: any) => (
                            <div key={log.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex justify-between items-start text-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${log.allowed ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="font-bold text-gray-300">{log.action_type || 'Evaluation'}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs">{log.reason}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                    <div className="text-gray-600 text-[10px] mt-1">{log.latency_ms}ms</div>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-center text-gray-500 py-10">No recent evaluations found for this policy.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
