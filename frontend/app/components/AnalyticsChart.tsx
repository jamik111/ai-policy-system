'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import styles from './AnalyticsChart.module.css';

export interface MetricCardData {
    label: string;
    value: number;
    color?: string;
    bgColor?: string;
    trend?: number; // Percentage change
    unit?: string;
}

interface AnalyticsChartProps {
    data?: MetricCardData[];
    title?: string;
    showTrendIndicators?: boolean;
}

export default function AnalyticsChart({
    data,
    title = 'System Metrics',
    showTrendIndicators = true,
}: AnalyticsChartProps) {
    // Client-only timestamp to prevent hydration mismatch
    const [lastUpdated, setLastUpdated] = useState<string>('--:--:--');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleTimeString());
        const interval = setInterval(() => {
            setLastUpdated(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Default data if none provided
    const chartData = useMemo((): MetricCardData[] => {
        if (data && data.length > 0) {
            return data;
        }
        // No fake data - return empty array
        return [];
    }, [data]);

    const maxValue = useMemo(
        () => Math.max(...chartData.map((d) => d.value), 1),
        [chartData]
    );

    const getDimClass = (percent: number, type: 'w' | 'h') => {
        const rounded = Math.round(Math.min(Math.max(percent, 0), 100) / 5) * 5;
        return (styles as any)[`${type}${rounded}`];
    };

    return (
        <div className="w-full">
            {/* Title */}
            {title && (
                <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">
                    {title}
                </h2>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {chartData.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all duration-300 ${item.bgColor || 'bg-white/5 border-white/10'
                            } hover:border-opacity-70 hover:bg-opacity-10`}
                    >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                {item.label}
                            </span>
                            {showTrendIndicators && item.trend !== undefined && (
                                <div
                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.trend >= 0
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {item.trend >= 0 ? (
                                        <TrendingUp size={11} />
                                    ) : (
                                        <TrendingDown size={11} />
                                    )}
                                    {Math.abs(item.trend)}%
                                </div>
                            )}
                        </div>

                        {/* Value Display */}
                        <div className="mb-2">
                            <span
                                className={`text-xl font-black font-mono ${item.color || 'text-white'
                                    }`}
                            >
                                {item.value.toLocaleString()}
                            </span>
                            {item.unit && (
                                <span className="text-[9px] text-gray-500 ml-1">
                                    {item.unit}
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${item.color === 'text-green-400'
                                    ? 'bg-green-500'
                                    : item.color === 'text-red-400'
                                        ? 'bg-red-500'
                                        : item.color === 'text-yellow-400'
                                            ? 'bg-yellow-500'
                                            : item.color === 'text-blue-400'
                                                ? 'bg-blue-500'
                                                : 'bg-white'
                                    } ${getDimClass((item.value / maxValue) * 100, 'w')}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-end justify-center gap-2 h-32 pb-2">
                        {chartData.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center flex-1 group relative"
                            >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded border border-white/20 text-[10px] whitespace-nowrap z-50 transition-opacity">
                                    <span className="font-semibold text-white">
                                        {item.value.toLocaleString()}
                                    </span>
                                </div>

                                {/* Bar */}
                                <div
                                    className={`w-full rounded-t transition-all duration-500 ease-out border-t border-white/20 ${item.color === 'text-green-400'
                                        ? 'bg-green-500/40'
                                        : item.color === 'text-red-400'
                                            ? 'bg-red-500/40'
                                            : item.color === 'text-yellow-400'
                                                ? 'bg-yellow-500/40'
                                                : item.color === 'text-blue-400'
                                                    ? 'bg-blue-500/40'
                                                    : 'bg-white/20'
                                        } ${getDimClass((item.value / maxValue) * 100, 'h')}`}
                                />

                                {/* Label */}
                                <span className="text-[9px] text-gray-500 font-bold uppercase mt-2 text-center truncate px-1 leading-tight">
                                    {item.label.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Stats */}
            <div className="mt-4 flex justify-between items-center text-[9px] text-gray-400 font-mono">
                <div className="flex items-center gap-1">
                    <Activity size={12} />
                    <span>System Health: <span className="text-green-400">Optimal</span></span>
                </div>
                <span>Last Updated: {lastUpdated}</span>
            </div>
        </div>
    );
}
