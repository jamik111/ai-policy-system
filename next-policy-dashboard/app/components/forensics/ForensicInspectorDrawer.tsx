'use client';

import React, { useState, useMemo } from 'react';
import {
    X,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
    Code,
    Download,
    Filter,
    ChevronRight,
    ChevronDown,
    Copy,
    ExternalLink,
    MessageSquare,
    Plus,
    Eye
} from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface ForensicInspectorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sample evaluation data for forensic analysis
function generateEvaluationData() {
    const decisions = ['ALLOW', 'WARN', 'DENY'] as const;
    const policies = ['PII Protection', 'Rate Limiting', 'Content Moderation', 'SQL Prevention'];
    const agents = ['ContentGenerator', 'DataAnalyzer', 'CustomerSupport', 'CodeAssistant'];

    return Array.from({ length: 20 }, (_, i) => ({
        id: `eval-${1000 + i}`,
        timestamp: Date.now() - Math.random() * 3600000,
        agentId: agents[Math.floor(Math.random() * agents.length)],
        taskType: ['GENERATE', 'ANALYZE', 'QUERY', 'SUMMARIZE'][Math.floor(Math.random() * 4)],
        decision: decisions[Math.floor(Math.random() * decisions.length)],
        score: Math.random() * 100,
        triggeredPolicies: Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            () => policies[Math.floor(Math.random() * policies.length)]
        ),
        payload: {
            prompt: `Sample prompt for evaluation ${i + 1}...`,
            context: { user: 'test-user', session: 'sess-' + i },
            sensitive_fields: Math.random() > 0.5 ? ['email', 'phone'] : []
        },
        evaluationTime: 2 + Math.random() * 20,
        cached: Math.random() > 0.3
    }));
}

const decisionConfig = {
    ALLOW: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle },
    WARN: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle },
    DENY: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle }
};

export default function ForensicInspectorDrawer({ isOpen, onClose }: ForensicInspectorDrawerProps) {
    const { forensicSession } = useAnalytics();
    const [selectedEval, setSelectedEval] = useState<string | null>(null);
    const [decisionFilter, setDecisionFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPayload, setShowPayload] = useState(false);
    const [notes, setNotes] = useState<Record<string, string[]>>({});
    const [newNote, setNewNote] = useState('');

    const evaluations = useMemo(() => generateEvaluationData(), []);

    const filteredEvaluations = useMemo(() => {
        return evaluations.filter(e => {
            if (decisionFilter.length > 0 && !decisionFilter.includes(e.decision)) return false;
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                return e.id.toLowerCase().includes(lowerQuery) ||
                    e.agentId.toLowerCase().includes(lowerQuery) ||
                    e.triggeredPolicies.some(p => p.toLowerCase().includes(lowerQuery));
            }
            return true;
        });
    }, [evaluations, decisionFilter, searchQuery]);

    const selectedEvalData = selectedEval ? evaluations.find(e => e.id === selectedEval) : null;

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const toggleDecisionFilter = (decision: string) => {
        setDecisionFilter(prev =>
            prev.includes(decision)
                ? prev.filter(d => d !== decision)
                : [...prev, decision]
        );
    };

    const addNote = () => {
        if (!selectedEval || !newNote.trim()) return;
        setNotes(prev => ({
            ...prev,
            [selectedEval]: [...(prev[selectedEval] || []), newNote.trim()]
        }));
        setNewNote('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[900px] max-w-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-blue-400" />
                        <div>
                            <h2 className="text-lg font-bold text-white font-mono">Forensic Inspector</h2>
                            <p className="text-xs text-slate-400">Deep-dive into policy evaluations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-800 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by ID, agent, or policy..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-mono flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    {/* Decision Filters */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        {(['ALLOW', 'WARN', 'DENY'] as const).map((decision) => {
                            const config = decisionConfig[decision];
                            const isActive = decisionFilter.includes(decision);
                            return (
                                <button
                                    key={decision}
                                    onClick={() => toggleDecisionFilter(decision)}
                                    className={`px-3 py-1 rounded-md text-xs font-mono transition-colors flex items-center gap-1 ${isActive
                                            ? `${config.bg} ${config.color} ${config.border} border`
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {decision}
                                </button>
                            );
                        })}
                        {decisionFilter.length > 0 && (
                            <button
                                onClick={() => setDecisionFilter([])}
                                className="text-xs text-slate-500 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Evaluation List */}
                    <div className="w-[350px] border-r border-slate-800 overflow-y-auto">
                        <div className="p-2 text-xs text-slate-500 font-mono border-b border-slate-800">
                            {filteredEvaluations.length} evaluations
                        </div>
                        {filteredEvaluations.map((evalItem) => {
                            const config = decisionConfig[evalItem.decision];
                            const Icon = config.icon;
                            const isSelected = selectedEval === evalItem.id;

                            return (
                                <div
                                    key={evalItem.id}
                                    onClick={() => setSelectedEval(evalItem.id)}
                                    className={`p-3 border-b border-slate-800 cursor-pointer transition-colors ${isSelected
                                            ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                                            : 'hover:bg-slate-900/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                            <span className="text-sm font-mono text-white">{evalItem.id}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {formatTime(evalItem.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{evalItem.agentId}</span>
                                        <span>•</span>
                                        <span className={config.color}>{evalItem.decision}</span>
                                        <span>•</span>
                                        <span>{evalItem.score.toFixed(0)}%</span>
                                    </div>
                                    {evalItem.triggeredPolicies.length > 0 && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {evalItem.triggeredPolicies.slice(0, 2).map((p, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-400"
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                            {evalItem.triggeredPolicies.length > 2 && (
                                                <span className="text-xs text-slate-500">
                                                    +{evalItem.triggeredPolicies.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedEvalData ? (
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-mono">{selectedEvalData.id}</h3>
                                        <p className="text-sm text-slate-400">
                                            {new Date(selectedEvalData.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg ${decisionConfig[selectedEvalData.decision].bg} ${decisionConfig[selectedEvalData.decision].border} border`}>
                                        <span className={`font-bold font-mono ${decisionConfig[selectedEvalData.decision].color}`}>
                                            {selectedEvalData.decision}
                                        </span>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Agent</div>
                                        <div className="text-sm font-mono text-white">{selectedEvalData.agentId}</div>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Task Type</div>
                                        <div className="text-sm font-mono text-white">{selectedEvalData.taskType}</div>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Score</div>
                                        <div className="text-sm font-mono text-white">{selectedEvalData.score.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Eval Time</div>
                                        <div className="text-sm font-mono text-cyan-400">
                                            {selectedEvalData.evaluationTime.toFixed(1)}ms
                                            {selectedEvalData.cached && <span className="text-purple-400 ml-1">(cached)</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Triggered Policies */}
                                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Triggered Policies
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvalData.triggeredPolicies.map((policy, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400 flex items-center gap-2"
                                            >
                                                {policy}
                                                <ExternalLink className="w-3 h-3" />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Payload Viewer */}
                                <div className="bg-slate-900 rounded-lg border border-slate-800">
                                    <button
                                        onClick={() => setShowPayload(!showPayload)}
                                        className="w-full p-4 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Code className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm font-bold text-white">Request Payload</span>
                                        </div>
                                        {showPayload ? (
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        )}
                                    </button>
                                    {showPayload && (
                                        <div className="px-4 pb-4">
                                            <div className="relative">
                                                <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-xs font-mono text-slate-300 border border-slate-800">
                                                    {JSON.stringify(selectedEvalData.payload, null, 2)}
                                                </pre>
                                                <button
                                                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEvalData.payload, null, 2))}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-green-400" />
                                        Investigation Notes
                                    </h4>
                                    {(notes[selectedEvalData.id] || []).map((note, i) => (
                                        <div key={i} className="bg-slate-800 rounded p-2 mb-2 text-sm text-slate-300">
                                            {note}
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a note..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={addNote}
                                            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Eye className="w-12 h-12 mb-3 opacity-50" />
                                <p className="font-mono">Select an evaluation to inspect</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
