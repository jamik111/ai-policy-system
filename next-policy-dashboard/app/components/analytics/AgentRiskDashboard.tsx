'use client';

import React, { useState, useMemo } from 'react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Shield,
    Activity,
    Clock,
    Target,
    ChevronRight,
    BarChart3,
    Minus
} from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface AgentRiskDashboardProps {
    height?: number;
}

// Generate synthetic agent data for demonstration
function generateAgentData() {
    const agents = [
        { id: 'agent-001', name: 'ContentGenerator', type: 'LLM', riskScore: 23, trend: 'STABLE' as const },
        { id: 'agent-002', name: 'DataAnalyzer', type: 'Analytics', riskScore: 67, trend: 'DEGRADING' as const },
        { id: 'agent-003', name: 'CustomerSupport', type: 'Chatbot', riskScore: 12, trend: 'IMPROVING' as const },
        { id: 'agent-004', name: 'CodeAssistant', type: 'Dev Tools', riskScore: 45, trend: 'STABLE' as const },
        { id: 'agent-005', name: 'EmailDrafter', type: 'Automation', riskScore: 89, trend: 'DEGRADING' as const },
        { id: 'agent-006', name: 'ReportBuilder', type: 'Analytics', riskScore: 34, trend: 'IMPROVING' as const },
    ];

    return agents.map(agent => ({
        ...agent,
        trustScore: 100 - agent.riskScore,
        violations24h: Math.floor(Math.random() * (agent.riskScore / 10)),
        tasksPerHour: Math.floor(50 + Math.random() * 150),
        lastViolation: agent.riskScore > 50 ? Date.now() - Math.random() * 3600000 : null,
        riskFactors: agent.riskScore > 60
            ? ['High PII access', 'Elevated token usage', 'Unusual patterns']
            : agent.riskScore > 40
                ? ['Moderate risk patterns']
                : [],
        nextViolationProb: Math.min(0.95, agent.riskScore / 100 + Math.random() * 0.1)
    }));
}

function getRiskColor(score: number): string {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-400';
}

function getRiskBg(score: number): string {
    if (score < 30) return 'bg-green-500/10 border-green-500/30';
    if (score < 60) return 'bg-yellow-500/10 border-yellow-500/30';
    if (score < 80) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
}

function getTrendIcon(trend: 'IMPROVING' | 'STABLE' | 'DEGRADING') {
    switch (trend) {
        case 'IMPROVING': return <TrendingDown className="w-4 h-4 text-green-400" />;
        case 'DEGRADING': return <TrendingUp className="w-4 h-4 text-red-400" />;
        default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
}

export default function AgentRiskDashboard({ height = 500 }: AgentRiskDashboardProps) {
    const { anomalies, systemHealth } = useAnalytics();
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'risk' | 'name' | 'activity'>('risk');

    const agents = useMemo(() => generateAgentData(), []);

    const sortedAgents = useMemo(() => {
        const sorted = [...agents];
        switch (sortBy) {
            case 'risk':
                sorted.sort((a, b) => b.riskScore - a.riskScore);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'activity':
                sorted.sort((a, b) => b.tasksPerHour - a.tasksPerHour);
                break;
        }
        return sorted;
    }, [agents, sortBy]);

    // Dashboard stats
    const stats = useMemo(() => ({
        totalAgents: agents.length,
        highRisk: agents.filter(a => a.riskScore >= 60).length,
        improving: agents.filter(a => a.trend === 'IMPROVING').length,
        degrading: agents.filter(a => a.trend === 'DEGRADING').length,
        avgRiskScore: Math.round(agents.reduce((sum, a) => sum + a.riskScore, 0) / agents.length)
    }), [agents]);

    const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;

    return (
        <div
            className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800"
            style={{ minHeight: height }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        Agent Risk Dashboard
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Per-agent risk scoring and behavioral analysis
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white font-mono">{stats.totalAgents}</div>
                        <div className="text-xs text-slate-500">Agents</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-red-400 font-mono">{stats.highRisk}</div>
                        <div className="text-xs text-slate-500">High Risk</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400 font-mono">{stats.avgRiskScore}%</div>
                        <div className="text-xs text-slate-500">Avg Risk</div>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500">Sort by:</span>
                {(['risk', 'name', 'activity'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${sortBy === s
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {sortedAgents.map((agent) => (
                    <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                        className={`
                            p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedAgent === agent.id
                                ? 'bg-blue-500/10 border-blue-500/50'
                                : `${getRiskBg(agent.riskScore)} hover:bg-opacity-20`
                            }
                        `}
                    >
                        {/* Agent Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${getRiskBg(agent.riskScore)} flex items-center justify-center`}>
                                    <Target className={`w-5 h-5 ${getRiskColor(agent.riskScore)}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{agent.name}</div>
                                    <div className="text-xs text-slate-500">{agent.type} • {agent.id}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-2xl font-bold font-mono ${getRiskColor(agent.riskScore)}`}>
                                    {agent.riskScore}
                                </div>
                                <div className="text-xs text-slate-500">Risk Score</div>
                            </div>
                        </div>

                        {/* Risk Bar */}
                        <div className="mb-3">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${agent.riskScore >= 80 ? 'bg-red-500' :
                                            agent.riskScore >= 60 ? 'bg-orange-500' :
                                                agent.riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${agent.riskScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                                {getTrendIcon(agent.trend)}
                                <span className="text-slate-400">{agent.trend}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500">
                                    <Activity className="w-3 h-3 inline mr-1" />
                                    {agent.tasksPerHour}/hr
                                </span>
                                {agent.violations24h > 0 && (
                                    <span className="text-red-400">
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        {agent.violations24h} violations
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedAgent === agent.id && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                {/* Trust Score */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Trust Score</span>
                                    <div className="flex items-center gap-2">
                                        <Shield className={`w-4 h-4 ${agent.trustScore >= 70 ? 'text-green-400' :
                                                agent.trustScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                                            }`} />
                                        <span className="font-mono text-white">{agent.trustScore}%</span>
                                    </div>
                                </div>

                                {/* Next Violation Probability */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Violation Probability (24h)</span>
                                    <span className={`font-mono ${agent.nextViolationProb > 0.7 ? 'text-red-400' :
                                            agent.nextViolationProb > 0.4 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        {(agent.nextViolationProb * 100).toFixed(0)}%
                                    </span>
                                </div>

                                {/* Risk Factors */}
                                {agent.riskFactors.length > 0 && (
                                    <div>
                                        <span className="text-xs text-slate-400 block mb-1">Risk Factors</span>
                                        <div className="flex flex-wrap gap-1">
                                            {agent.riskFactors.map((factor, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400"
                                                >
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-2">
                                    <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono transition-colors">
                                        Investigate
                                    </button>
                                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-mono transition-colors">
                                        Policies
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Risk Distribution Summary */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400 font-mono">
                        {agents.filter(a => a.riskScore < 30).length}
                    </div>
                    <div className="text-xs text-slate-400">Low Risk</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-yellow-400 font-mono">
                        {agents.filter(a => a.riskScore >= 30 && a.riskScore < 60).length}
                    </div>
                    <div className="text-xs text-slate-400">Medium Risk</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-orange-400 font-mono">
                        {agents.filter(a => a.riskScore >= 60 && a.riskScore < 80).length}
                    </div>
                    <div className="text-xs text-slate-400">High Risk</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-400 font-mono">
                        {agents.filter(a => a.riskScore >= 80).length}
                    </div>
                    <div className="text-xs text-slate-400">Critical</div>
                </div>
            </div>
        </div>
    );
}
