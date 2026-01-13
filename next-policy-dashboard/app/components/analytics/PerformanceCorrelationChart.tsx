'use client';

import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { Activity, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface PerformanceCorrelationChartProps {
    height?: number;
    compact?: boolean;
}

export default function PerformanceCorrelationChart({
    height = 300,
    compact = false
}: PerformanceCorrelationChartProps) {
    const { timeSeriesData, baselines } = useAnalytics();

    // Transform time series data for Recharts
    const chartData = useMemo(() => {
        const dataPoints = Math.min(compact ? 60 : 120, timeSeriesData.timestamps.length);
        const startIdx = timeSeriesData.timestamps.length - dataPoints;

        return timeSeriesData.timestamps.slice(startIdx).map((ts, i) => {
            const idx = startIdx + i;
            return {
                time: new Date(ts).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }),
                taskVolume: Math.round(timeSeriesData.taskVolume[idx]),
                latencyP50: Math.round(timeSeriesData.latencyP50[idx]),
                latencyP95: Math.round(timeSeriesData.latencyP95[idx]),
                errorRate: (timeSeriesData.errorRate[idx] * 100).toFixed(2),
                baseline: baselines.taskVolumeMean
            };
        });
    }, [timeSeriesData, baselines, compact]);

    // Calculate current stats
    const currentStats = useMemo(() => {
        const len = timeSeriesData.taskVolume.length;
        const last = len - 1;
        return {
            taskVolume: Math.round(timeSeriesData.taskVolume[last] || 0),
            latencyP95: Math.round(timeSeriesData.latencyP95[last] || 0),
            errorRate: ((timeSeriesData.errorRate[last] || 0) * 100).toFixed(1),
            trend: timeSeriesData.taskVolume[last] > timeSeriesData.taskVolume[last - 10] ? 'up' : 'down'
        };
    }, [timeSeriesData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-slate-400 font-mono mb-2">{label}</p>
                {payload.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="text-white font-mono font-bold">
                            {entry.name === 'Error Rate' ? `${entry.value}%` : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (compact) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Performance
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Last 60s</span>
                </div>
                <ResponsiveContainer width="100%" height={height - 50}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="time" tick={false} stroke="#475569" />
                        <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Line
                            type="monotone"
                            dataKey="taskVolume"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Performance Correlation
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time task volume, latency, and error rate correlation
                    </p>
                </div>

                {/* Live Stats */}
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <TrendingUp className={`w-3 h-3 ${currentStats.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                            <span className="text-lg font-bold text-white font-mono">{currentStats.taskVolume}</span>
                        </div>
                        <span className="text-xs text-slate-500">Tasks/s</span>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            <span className="text-lg font-bold text-white font-mono">{currentStats.latencyP95}ms</span>
                        </div>
                        <span className="text-xs text-slate-500">P95 Latency</span>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <Zap className="w-3 h-3 text-red-400" />
                            <span className="text-lg font-bold text-white font-mono">{currentStats.errorRate}%</span>
                        </div>
                        <span className="text-xs text-slate-500">Error Rate</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="taskVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        stroke="#475569"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#475569"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        label={{ value: 'Tasks/s', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#475569"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px' }}
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                    />

                    {/* Task Volume Area */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="taskVolume"
                        name="Task Volume"
                        stroke="#3b82f6"
                        fill="url(#taskVolumeGradient)"
                        strokeWidth={2}
                    />

                    {/* Baseline Reference */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="baseline"
                        name="Baseline"
                        stroke="#6366f1"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                    />

                    {/* P95 Latency */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="latencyP95"
                        name="P95 Latency"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
