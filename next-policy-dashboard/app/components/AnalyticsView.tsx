'use client';
import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { RefreshCw, Calendar, AlertTriangle, Shield, Activity } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface AnalyticsData {
    traffic: any[];
    violations: any[];
    agents: any[];
}

export default function AnalyticsView() {
    const { showToast } = useToast();
    const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8082/api/analytics?range=${range}`);
            if (res.ok) {
                setData(await res.json());
            } else {
                throw new Error('Failed to fetch analytics');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to load analytics data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Live update every 10s
        return () => clearInterval(interval);
    }, [range]);

    if (!data) return <div className="text-white p-10 animate-pulse">Loading analytics...</div>;

    return (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden overflow-y-auto pb-20 pr-2 scrollbar-custom">
            {/* Header / Controls */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-blue-500" /> System Analytics
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        {['1h', '24h', '7d'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r as any)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase ${range === r ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchData}
                        className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white ${loading ? 'animate-spin' : ''}`}
                        title="Refresh Analytics"
                        aria-label="Refresh Analytics"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Top Row: Traffic & Latency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[350px]">
                {/* Traffic Volume */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Traffic Volume & Enforcements</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.traffic}>
                                <defs>
                                    <linearGradient id="colorAllow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDeny" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#6B7280" fontSize={10} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="allow" stroke="#10B981" fillOpacity={1} fill="url(#colorAllow)" stackId="1" />
                                <Area type="monotone" dataKey="deny" stroke="#EF4444" fillOpacity={1} fill="url(#colorDeny)" stackId="1" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Agent Performance */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Agent Load Distribution</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="category" dataKey="agent_id" name="Agent" stroke="#6B7280" fontSize={10} />
                                <YAxis type="number" dataKey="total_requests" name="Requests" stroke="#6B7280" fontSize={10} />
                                <ZAxis type="number" dataKey="blocks" range={[60, 400]} name="Blocks" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Scatter name="Agents" data={data.agents} fill="#3B82F6" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Violations & Latency Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
                {/* Top Violations */}
                <div className="lg:col-span-1 bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-yellow-500" /> Top Policy Triggers
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.violations}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="policy_id" type="category" width={80} stroke="#9CA3AF" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency Trend */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">System Latency Trend (ms)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.traffic}>
                                <defs>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#6B7280" fontSize={10} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="latency" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorLatency)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
