"use client";

import { DashboardProvider } from '../context/DashboardContext';
import FilterBar from '../components/FilterBar';
import AgentCard from '../components/AgentCard';
import TaskCard from '../components/TaskCard';
import AuditLog from '../components/AuditLog';
import { useDashboard } from '../context/DashboardContext';
import '../../styles/globals.css';

import { Shield, LayoutDashboard, Database, Beaker, Activity, AlertTriangle } from 'lucide-react';
import PolicyEditor from '../components/PolicyEditor';
import PolicyTestLab from '../components/PolicyTestLab';
import StatsPanel from '../components/StatsPanel';
import ViolationsView from '../components/ViolationsView';
import AgentsView from '../components/AgentsView';
import AnalyticsView from '../components/AnalyticsView';
import PoliciesTable from '../components/PoliciesTable';
import PolicyHistoryView from '../components/PolicyHistoryView';
import MonitoringView from '../components/MonitoringView';
import { useState } from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function DashboardContent() {
    const {
        agents, tasks, logs, filter, setFilter,
        activeView, setActiveView, policies, savePolicy, deletePolicy, stats
    } = useDashboard();

    // Local state for 'policies' view
    const [policyMode, setPolicyMode] = useState<'list' | 'edit' | 'lab' | 'history'>('list');
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

    const handleTogglePolicy = async (policy: any) => {
        try {
            await savePolicy({ ...policy, is_active: policy.is_active ? 0 : 1 });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex bg-[#0A0C10] h-screen text-white font-inter selection:bg-blue-500/30">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Header stats={stats} />

                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    {activeView === 'monitoring' ? (
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {/* Stats Panel */}
                            <StatsPanel stats={stats} />

                            <div className="flex-1 overflow-hidden">
                                <MonitoringView />
                            </div>
                        </div>
                    ) : activeView === 'policies' ? (
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            <div className="flex gap-2">
                                <button onClick={() => { setPolicyMode('edit'); setSelectedPolicy(null); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase transition-all shadow-lg shadow-blue-900/20">
                                    + Create Policy
                                </button>
                                <button onClick={() => setPolicyMode('lab')} className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold uppercase transition-all">
                                    Test Policy
                                </button>
                            </div>

                            <div className="flex-1 grid grid-cols-[250px_1fr] gap-4 overflow-hidden">
                                {/* Sidebar */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-1">
                                    <button
                                        onClick={() => setPolicyMode('list')}
                                        className={`p-2 rounded text-left text-sm font-bold ${policyMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        All Policies
                                    </button>
                                    <button
                                        onClick={() => { setSelectedPolicy(null); setPolicyMode('edit'); }}
                                        className={`p-2 rounded text-left text-sm font-bold ${policyMode === 'edit' && !selectedPolicy ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        + New Policy
                                    </button>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button
                                        onClick={() => setPolicyMode('lab')}
                                        className={`p-2 rounded text-left text-sm font-bold flex items-center gap-2 ${policyMode === 'lab' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Beaker size={14} /> Testing Lab
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                                    {policyMode === 'list' && (
                                        <PoliciesTable
                                            policies={policies}
                                            onEdit={(p) => { setSelectedPolicy(p); setPolicyMode('edit'); }}
                                            onDelete={deletePolicy}
                                            onTest={(p) => { setSelectedPolicy(p); setPolicyMode('lab'); }}
                                            onToggle={handleTogglePolicy}
                                            onViewHistory={(p) => { setSelectedPolicy(p); setPolicyMode('history'); }}
                                        />
                                    )}
                                    {policyMode === 'edit' && (
                                        <PolicyEditor
                                            initialPolicy={selectedPolicy}
                                            onSave={savePolicy}
                                            onCancel={() => setPolicyMode('list')}
                                            onDelete={deletePolicy}
                                        />
                                    )}
                                    {policyMode === 'lab' && (
                                        <PolicyTestLab initialPolicy={selectedPolicy} />
                                    )}
                                    {policyMode === 'history' && selectedPolicy && (
                                        <PolicyHistoryView
                                            policy={selectedPolicy}
                                            onBack={() => setPolicyMode('list')}
                                            onRestore={async (ver) => {
                                                try {
                                                    await fetch(`http://localhost:8082/api/policies/${selectedPolicy.id}/rollback`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ version: ver })
                                                    });
                                                    setPolicyMode('list');
                                                } catch (e) {
                                                    console.error("Rollback failed", e);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'violations' ? (
                        <ViolationsView />
                    ) : activeView === 'agents' ? (
                        <AgentsView />
                    ) : activeView === 'analytics' ? (
                        <AnalyticsView />
                    ) : null}
                </div>

                {/* Footer (Hidden in Monitoring View to avoid duplication) */}
                {activeView !== 'monitoring' && (
                    <div className="p-4 pt-0">
                        <div className="h-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col opacity-50 hover:opacity-100 transition-opacity">
                            <AuditLog />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function Dashboard() {
    return (
        <ToastProvider>
            <DashboardProvider>
                <DashboardContent />
            </DashboardProvider>
        </ToastProvider>
    );
}
