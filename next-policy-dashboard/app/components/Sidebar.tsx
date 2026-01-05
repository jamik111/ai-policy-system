import React from 'react';
import { Shield, LayoutDashboard, Database, Activity, AlertTriangle, Users } from 'lucide-react';

interface SidebarProps {
    activeView: 'monitoring' | 'policies' | 'violations' | 'agents' | 'analytics';
    setActiveView: (view: 'monitoring' | 'policies' | 'violations' | 'agents' | 'analytics') => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
    const navItems = [
        { id: 'monitoring', label: 'Monitor', icon: <Activity size={20} /> },
        { id: 'policies', label: 'Policies', icon: <Shield size={20} /> },
        { id: 'violations', label: 'Violations', icon: <AlertTriangle size={20} /> },
        { id: 'agents', label: 'Agents', icon: <Users size={20} /> },
        { id: 'analytics', label: 'Analytics', icon: <Database size={20} /> },
    ];

    return (
        <aside className="w-64 bg-[#0A0C10] border-r border-white/10 flex flex-col p-4 gap-6">
            <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <Shield className="text-white" size={18} />
                </div>
                <div>
                    <h1 className="font-black text-lg text-white leading-none tracking-tight">AI POLICY</h1>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Management System</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${activeView === item.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={item.label}
                        aria-label={item.label}
                    >
                        <div className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {item.icon}
                        </div>
                        <span className="text-sm">{item.label}</span>
                        {activeView === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-300 uppercase">System Online</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">v2.4.0-stable</div>
            </div>
        </aside>
    );
}
