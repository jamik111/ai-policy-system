'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Shield, Clock, Filter, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface ThreatHeatmapProps {
    height?: number;
}

// Generate synthetic threat data for visualization
function generateThreatData() {
    const hours = 24;
    const days = 7;
    const data: Array<{ day: string; hour: number; threats: number; severity: number }> = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let d = 0; d < days; d++) {
        for (let h = 0; h < hours; h++) {
            // Simulate higher threat levels during business hours
            const isBusinessHours = h >= 9 && h <= 17;
            const isWeekday = d >= 1 && d <= 5;
            const baseThreats = isBusinessHours && isWeekday ? 15 : 5;
            const threats = Math.floor(baseThreats + Math.random() * 20);
            const severity = Math.min(100, threats * 3 + Math.random() * 30);

            data.push({
                day: dayNames[d],
                hour: h,
                threats,
                severity
            });
        }
    }
    return data;
}

function getSeverityColor(severity: number): string {
    if (severity < 20) return 'bg-slate-800';
    if (severity < 40) return 'bg-green-900/60';
    if (severity < 60) return 'bg-yellow-900/60';
    if (severity < 80) return 'bg-orange-900/60';
    return 'bg-red-900/60';
}

function getSeverityBorder(severity: number): string {
    if (severity < 20) return 'border-slate-700';
    if (severity < 40) return 'border-green-700/50';
    if (severity < 60) return 'border-yellow-700/50';
    if (severity < 80) return 'border-orange-700/50';
    return 'border-red-700/50';
}

export default function ThreatHeatmap({ height = 400 }: ThreatHeatmapProps) {
    const { anomalies, systemHealth } = useAnalytics();
    const [selectedCell, setSelectedCell] = useState<{ day: string; hour: number } | null>(null);
    const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'critical'>('all');

    const threatData = useMemo(() => generateThreatData(), []);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate threat stats
    const threatStats = useMemo(() => {
        const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
        const highCount = anomalies.filter(a => a.severity === 'HIGH').length;
        const recentAnomalies = anomalies.filter(a => Date.now() - a.detectedAt < 300000); // Last 5 min

        return {
            total: anomalies.length,
            critical: criticalCount,
            high: highCount,
            recent: recentAnomalies.length,
            trend: recentAnomalies.length > 3 ? 'increasing' : 'stable'
        };
    }, [anomalies]);

    const getFilteredData = (day: string, hour: number) => {
        const cell = threatData.find(d => d.day === day && d.hour === hour);
        if (!cell) return null;

        if (filterSeverity === 'high' && cell.severity < 60) return null;
        if (filterSeverity === 'critical' && cell.severity < 80) return null;

        return cell;
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800" style={{ minHeight: height }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Threat Heatmap
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Weekly threat distribution by hour
                    </p>
                </div>

                {/* Stats & Filter */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-white font-mono">{threatStats.total}</div>
                            <div className="text-xs text-slate-500">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-400 font-mono">{threatStats.critical}</div>
                            <div className="text-xs text-slate-500">Critical</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-400 font-mono">{threatStats.high}</div>
                            <div className="text-xs text-slate-500">High</div>
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as any)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Severity</option>
                        <option value="high">High+</option>
                        <option value="critical">Critical Only</option>
                    </select>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    {/* Hour Labels */}
                    <div className="flex ml-12 mb-1">
                        {Array.from({ length: 24 }, (_, i) => (
                            <div
                                key={i}
                                className="flex-1 text-center text-xs text-slate-500 font-mono"
                            >
                                {i % 3 === 0 ? `${i}h` : ''}
                            </div>
                        ))}
                    </div>

                    {/* Grid Rows */}
                    {dayNames.map((day) => (
                        <div key={day} className="flex items-center gap-1 mb-1">
                            {/* Day Label */}
                            <div className="w-10 text-xs text-slate-400 font-mono text-right pr-2">
                                {day}
                            </div>

                            {/* Hour Cells */}
                            {Array.from({ length: 24 }, (_, hour) => {
                                const cell = getFilteredData(day, hour);
                                const isSelected = selectedCell?.day === day && selectedCell?.hour === hour;

                                if (!cell) {
                                    return (
                                        <div
                                            key={hour}
                                            className="flex-1 h-6 bg-slate-900 rounded-sm border border-slate-800 opacity-30"
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={hour}
                                        className={`
                                            flex-1 h-6 rounded-sm cursor-pointer transition-all
                                            ${getSeverityColor(cell.severity)}
                                            ${isSelected ? 'ring-2 ring-blue-500 scale-110 z-10' : ''}
                                            border ${getSeverityBorder(cell.severity)}
                                            hover:scale-105 hover:z-10
                                        `}
                                        onClick={() => setSelectedCell({ day, hour })}
                                        title={`${day} ${hour}:00 - ${cell.threats} threats (${cell.severity.toFixed(0)}% severity)`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend & Selected Cell Info */}
            <div className="mt-4 flex items-center justify-between">
                {/* Legend */}
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">Severity:</span>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-800 rounded border border-slate-700" />
                            <span className="text-xs text-slate-400">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-green-900/60 rounded border border-green-700/50" />
                            <span className="text-xs text-slate-400">Normal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-yellow-900/60 rounded border border-yellow-700/50" />
                            <span className="text-xs text-slate-400">Elevated</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-orange-900/60 rounded border border-orange-700/50" />
                            <span className="text-xs text-slate-400">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-red-900/60 rounded border border-red-700/50" />
                            <span className="text-xs text-slate-400">Critical</span>
                        </div>
                    </div>
                </div>

                {/* Selected Cell Details */}
                {selectedCell && (
                    <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white font-mono">
                                {selectedCell.day} {selectedCell.hour}:00
                            </span>
                            <span className="text-sm text-slate-400">
                                {threatData.find(d => d.day === selectedCell.day && d.hour === selectedCell.hour)?.threats || 0} threats
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Health Status Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${systemHealth.overallScore > 80 ? 'text-green-400' :
                                systemHealth.overallScore > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`} />
                        <span className="text-sm text-slate-400">System Health:</span>
                        <span className={`font-mono font-bold ${systemHealth.overallScore > 80 ? 'text-green-400' :
                                systemHealth.overallScore > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {systemHealth.overallScore}%
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${threatStats.trend === 'stable' ? 'text-green-400' : 'text-red-400'
                            }`} />
                        <span className="text-xs text-slate-500">
                            Threat trend: <span className="text-white">{threatStats.trend}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
