'use client';

import React, { useState, useMemo } from 'react';
import {
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    Bell,
    BellOff,
    ChevronDown,
    ChevronUp,
    Zap
} from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface AnomalyDetectionPanelProps {
    height?: number;
}

const severityConfig = {
    LOW: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: AlertCircle },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle }
};

const typeConfig: Record<string, { label: string; description: string }> = {
    LATENCY_SPIKE: { label: 'Latency Spike', description: 'Abnormal increase in response times' },
    VOLUME_SURGE: { label: 'Volume Surge', description: 'Unexpected spike in task volume' },
    ERROR_BURST: { label: 'Error Burst', description: 'Elevated error rate detected' },
    DRIFT_DETECTED: { label: 'Drift Detected', description: 'Behavioral drift from baseline' },
    PATTERN_BREAK: { label: 'Pattern Break', description: 'Unusual pattern deviation' }
};

export default function AnomalyDetectionPanel({ height = 350 }: AnomalyDetectionPanelProps) {
    const { anomalies, baselines, timeSeriesData } = useAnalytics();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all');
    const [sortBy, setSortBy] = useState<'time' | 'severity'>('time');

    // Filter and sort anomalies
    const processedAnomalies = useMemo(() => {
        let filtered = [...anomalies];

        if (filter === 'active') {
            filtered = filtered.filter(a => !a.acknowledged);
        } else if (filter === 'acknowledged') {
            filtered = filtered.filter(a => a.acknowledged);
        }

        if (sortBy === 'severity') {
            const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        } else {
            filtered.sort((a, b) => b.detectedAt - a.detectedAt);
        }

        return filtered;
    }, [anomalies, filter, sortBy]);

    // Calculate current system stress
    const systemStress = useMemo(() => {
        const len = timeSeriesData.taskVolume.length;
        const current = timeSeriesData.taskVolume[len - 1] || 0;
        const deviation = (current - baselines.taskVolumeMean) / baselines.taskVolumeStdDev;
        return {
            value: Math.abs(deviation),
            direction: deviation > 0 ? 'up' : 'down',
            label: Math.abs(deviation) > 3 ? 'Critical' : Math.abs(deviation) > 2 ? 'Elevated' : 'Normal'
        };
    }, [timeSeriesData.taskVolume, baselines]);

    // Stats
    const stats = useMemo(() => ({
        total: anomalies.length,
        active: anomalies.filter(a => !a.acknowledged).length,
        critical: anomalies.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length
    }), [anomalies]);

    const formatTime = (ts: number) => {
        const diff = Date.now() - ts;
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return new Date(ts).toLocaleTimeString();
    };

    return (
        <div
            className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800 flex flex-col"
            style={{ height }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        Anomaly Detection
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time behavioral anomaly monitoring
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                        <Bell className={`w-4 h-4 ${stats.critical > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                        <span className="text-sm font-mono">
                            <span className="text-white">{stats.active}</span>
                            <span className="text-slate-500"> active</span>
                        </span>
                    </div>

                    {/* System Stress Indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${systemStress.label === 'Critical' ? 'bg-red-500/10 border border-red-500/30' :
                            systemStress.label === 'Elevated' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                                'bg-green-500/10 border border-green-500/30'
                        }`}>
                        {systemStress.direction === 'up' ? (
                            <TrendingUp className={`w-4 h-4 ${systemStress.label === 'Critical' ? 'text-red-400' :
                                    systemStress.label === 'Elevated' ? 'text-yellow-400' : 'text-green-400'
                                }`} />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-sm font-mono text-white">{systemStress.label}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex bg-slate-800/50 rounded-lg p-0.5">
                    {(['all', 'active', 'acknowledged'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none"
                >
                    <option value="time">Latest First</option>
                    <option value="severity">Severity</option>
                </select>
            </div>

            {/* Anomaly List */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {processedAnomalies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <CheckCircle className="w-12 h-12 mb-3 opacity-50" />
                        <p className="font-mono text-sm">No anomalies detected</p>
                        <p className="text-xs mt-1">System operating normally</p>
                    </div>
                ) : (
                    processedAnomalies.map((anomaly) => {
                        const config = severityConfig[anomaly.severity];
                        const typeInfo = typeConfig[anomaly.type] || { label: anomaly.type, description: '' };
                        const Icon = config.icon;
                        const isExpanded = expandedId === anomaly.id;

                        return (
                            <div
                                key={anomaly.id}
                                className={`
                                    ${config.bg} ${config.border} border rounded-lg p-3 cursor-pointer
                                    transition-all hover:bg-opacity-20
                                    ${anomaly.acknowledged ? 'opacity-50' : ''}
                                `}
                                onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
                            >
                                {/* Main Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${config.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color} font-mono`}>
                                                    {anomaly.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                                {anomaly.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(anomaly.detectedAt)}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                z={anomaly.zScore.toFixed(2)}
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-500">Current Value</span>
                                                <div className="text-white font-mono">{anomaly.currentValue.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Expected</span>
                                                <div className="text-white font-mono">{anomaly.expectedValue.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Confidence</span>
                                                <div className="text-white font-mono">{(anomaly.confidence * 100).toFixed(0)}%</div>
                                            </div>
                                        </div>

                                        {/* Z-Score Bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>Z-Score Deviation</span>
                                                <span>{anomaly.zScore.toFixed(2)}σ</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${anomaly.zScore > 4 ? 'bg-red-500' :
                                                            anomaly.zScore > 3 ? 'bg-orange-500' :
                                                                anomaly.zScore > 2 ? 'bg-yellow-500' : 'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (anomaly.zScore / 5) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-3">
                                            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-mono transition-colors">
                                                Investigate
                                            </button>
                                            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors flex items-center gap-1">
                                                <BellOff className="w-3 h-3" />
                                                Acknowledge
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
