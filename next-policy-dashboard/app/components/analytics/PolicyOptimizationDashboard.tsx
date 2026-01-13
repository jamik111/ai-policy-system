'use client';

import React, { useState, useMemo } from 'react';
import {
    Settings2,
    TrendingUp,
    TrendingDown,
    Target,
    Gauge,
    BarChart3,
    PieChart,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface PolicyOptimizationDashboardProps {
    height?: number;
}

// Generate synthetic policy effectiveness data
function generatePolicyData() {
    const policies = [
        { id: 'pol-001', name: 'PII Data Protection', category: 'Security' },
        { id: 'pol-002', name: 'Rate Limiting', category: 'Performance' },
        { id: 'pol-003', name: 'Content Moderation', category: 'Compliance' },
        { id: 'pol-004', name: 'SQL Injection Prevention', category: 'Security' },
        { id: 'pol-005', name: 'Token Budget Enforcement', category: 'Cost' },
        { id: 'pol-006', name: 'GDPR Compliance', category: 'Compliance' },
    ];

    return policies.map(policy => {
        const tp = Math.floor(100 + Math.random() * 400);
        const fp = Math.floor(Math.random() * 50);
        const tn = Math.floor(500 + Math.random() * 1000);
        const fn = Math.floor(Math.random() * 30);

        const precision = tp / (tp + fp);
        const recall = tp / (tp + fn);
        const f1Score = 2 * (precision * recall) / (precision + recall);

        return {
            ...policy,
            effectiveness: {
                truePositives: tp,
                falsePositives: fp,
                trueNegatives: tn,
                falseNegatives: fn,
                precision,
                recall,
                f1Score
            },
            performance: {
                avgEvaluationTime: 2 + Math.random() * 15,
                timeoutRate: Math.random() * 0.02,
                cacheHitRate: 0.6 + Math.random() * 0.35
            },
            optimization: {
                recommendedPriority: Math.floor(1 + Math.random() * 10),
                currentPriority: Math.floor(1 + Math.random() * 10),
                recommendedThreshold: 0.5 + Math.random() * 0.4,
                currentThreshold: 0.5 + Math.random() * 0.4,
                suggestions: [
                    fp > 30 ? 'Consider increasing threshold to reduce false positives' : null,
                    fn > 20 ? 'Threshold too high - some violations may be missed' : null,
                    Math.random() > 0.5 ? 'Enable caching for faster evaluations' : null
                ].filter(Boolean) as string[]
            }
        };
    });
}

function getF1Color(score: number): string {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-lime-400';
    if (score >= 0.7) return 'text-yellow-400';
    if (score >= 0.6) return 'text-orange-400';
    return 'text-red-400';
}

export default function PolicyOptimizationDashboard({ height = 500 }: PolicyOptimizationDashboardProps) {
    const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'f1' | 'name' | 'performance'>('f1');

    const policies = useMemo(() => generatePolicyData(), []);

    const sortedPolicies = useMemo(() => {
        const sorted = [...policies];
        switch (sortBy) {
            case 'f1':
                sorted.sort((a, b) => b.effectiveness.f1Score - a.effectiveness.f1Score);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'performance':
                sorted.sort((a, b) => a.performance.avgEvaluationTime - b.performance.avgEvaluationTime);
                break;
        }
        return sorted;
    }, [policies, sortBy]);

    // Dashboard stats
    const stats = useMemo(() => ({
        totalPolicies: policies.length,
        avgF1: (policies.reduce((sum, p) => sum + p.effectiveness.f1Score, 0) / policies.length * 100).toFixed(0),
        avgEvalTime: (policies.reduce((sum, p) => sum + p.performance.avgEvaluationTime, 0) / policies.length).toFixed(1),
        avgCacheHit: (policies.reduce((sum, p) => sum + p.performance.cacheHitRate, 0) / policies.length * 100).toFixed(0)
    }), [policies]);

    const selectedPolicyData = selectedPolicy ? policies.find(p => p.id === selectedPolicy) : null;

    return (
        <div
            className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800"
            style={{ minHeight: height }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-400" />
                        Policy Optimization
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Policy effectiveness analysis and optimization recommendations
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white font-mono">{stats.totalPolicies}</div>
                        <div className="text-xs text-slate-500">Policies</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-400 font-mono">{stats.avgF1}%</div>
                        <div className="text-xs text-slate-500">Avg F1</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-cyan-400 font-mono">{stats.avgEvalTime}ms</div>
                        <div className="text-xs text-slate-500">Avg Eval</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-purple-400 font-mono">{stats.avgCacheHit}%</div>
                        <div className="text-xs text-slate-500">Cache Hit</div>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500">Sort by:</span>
                {(['f1', 'name', 'performance'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${sortBy === s
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {s === 'f1' ? 'F1 Score' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Policy List */}
            <div className="space-y-3">
                {sortedPolicies.map((policy) => {
                    const isSelected = selectedPolicy === policy.id;
                    const f1Percent = (policy.effectiveness.f1Score * 100).toFixed(0);

                    return (
                        <div
                            key={policy.id}
                            className={`
                                rounded-lg border transition-all cursor-pointer
                                ${isSelected
                                    ? 'bg-indigo-500/10 border-indigo-500/50'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                }
                            `}
                        >
                            {/* Policy Row */}
                            <div
                                className="p-4 flex items-center justify-between"
                                onClick={() => setSelectedPolicy(isSelected ? null : policy.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center`}>
                                        <Target className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{policy.name}</div>
                                        <div className="text-xs text-slate-500">{policy.category} • {policy.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* F1 Score */}
                                    <div className="text-right">
                                        <div className={`text-xl font-bold font-mono ${getF1Color(policy.effectiveness.f1Score)}`}>
                                            {f1Percent}%
                                        </div>
                                        <div className="text-xs text-slate-500">F1 Score</div>
                                    </div>

                                    {/* Mini Metrics */}
                                    <div className="flex gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="text-green-400 font-mono">{(policy.effectiveness.precision * 100).toFixed(0)}%</div>
                                            <div className="text-slate-500">Precision</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-blue-400 font-mono">{(policy.effectiveness.recall * 100).toFixed(0)}%</div>
                                            <div className="text-slate-500">Recall</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-cyan-400 font-mono">{policy.performance.avgEvaluationTime.toFixed(1)}ms</div>
                                            <div className="text-slate-500">Eval Time</div>
                                        </div>
                                    </div>

                                    {isSelected ? (
                                        <ChevronUp className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isSelected && (
                                <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Confusion Matrix */}
                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                                                <PieChart className="w-3 h-3" />
                                                Confusion Matrix
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
                                                    <div className="text-green-400 font-mono font-bold">{policy.effectiveness.truePositives}</div>
                                                    <div className="text-slate-500">True +</div>
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
                                                    <div className="text-red-400 font-mono font-bold">{policy.effectiveness.falsePositives}</div>
                                                    <div className="text-slate-500">False +</div>
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
                                                    <div className="text-red-400 font-mono font-bold">{policy.effectiveness.falseNegatives}</div>
                                                    <div className="text-slate-500">False -</div>
                                                </div>
                                                <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
                                                    <div className="text-green-400 font-mono font-bold">{policy.effectiveness.trueNegatives}</div>
                                                    <div className="text-slate-500">True -</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance */}
                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                                                <Gauge className="w-3 h-3" />
                                                Performance
                                            </h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Evaluation Time</span>
                                                    <span className="text-white font-mono">{policy.performance.avgEvaluationTime.toFixed(1)}ms</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Timeout Rate</span>
                                                    <span className="text-white font-mono">{(policy.performance.timeoutRate * 100).toFixed(2)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Cache Hit Rate</span>
                                                    <span className="text-purple-400 font-mono">{(policy.performance.cacheHitRate * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optimization */}
                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3 text-yellow-400" />
                                                Recommendations
                                            </h4>
                                            {policy.optimization.suggestions.length > 0 ? (
                                                <div className="space-y-2">
                                                    {policy.optimization.suggestions.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-start gap-2 text-xs text-yellow-300 bg-yellow-500/10 rounded p-2"
                                                        >
                                                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                            {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-green-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Policy is well optimized
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono transition-colors flex items-center gap-2">
                                            <RefreshCw className="w-3 h-3" />
                                            Recalculate Metrics
                                        </button>
                                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-mono transition-colors">
                                            View History
                                        </button>
                                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-mono transition-colors">
                                            Edit Policy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
