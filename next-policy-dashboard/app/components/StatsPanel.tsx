'use client';
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Shield, Activity, Eye, Zap, CheckCircle } from 'lucide-react';

export default function StatsPanel({ stats }: { stats: any }) {
    if (!stats) return <div className="p-4 text-center text-gray-500 text-xs">Loading analytics...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                label="Total Policies"
                value={stats.totalPolicies || 0}
                icon={<Shield size={20} className="text-blue-500" />}
                subLabel="Active Rules"
                color="blue"
            />
            <StatsCard
                label="Active Agents"
                value={stats.activeAgents || 0}
                icon={<Zap size={20} className="text-purple-500" />}
                subLabel="Online Now"
                color="purple"
            />
            <StatsCard
                label="Tasks Today"
                value={stats.tasksToday || 0}
                icon={<Activity size={20} className="text-amber-500" />}
                subLabel="Processing"
                color="amber"
            />
            <StatsCard
                label="Success Rate"
                value={`${stats.successRate}%`}
                icon={<CheckCircle size={20} className="text-green-500" />}
                subLabel="Policy Check"
                color="green"
            />
        </div>
    );
}

function StatsCard({ label, value, icon, subLabel, color }: any) {
    return (
        <Card className="hover:bg-white/5 transition-colors group border-white/10" noPadding>
            <div className="p-4 flex items-center justify-between">
                <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</div>
                    <div className="text-2xl font-bold text-white mt-1">{value}</div>
                    {subLabel && <div className="text-[10px] text-gray-500 mt-1">{subLabel}</div>}
                </div>
                <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}
