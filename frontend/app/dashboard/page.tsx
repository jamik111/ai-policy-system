'use client';

import { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import TaskCard from '../components/TaskCard';
import AgentCard from '../components/AgentCard';
import ConnectionStatus from '../components/ConnectionStatus';
import SectionEmptyState from '../components/SectionEmptyState';
import TestPolicyModal from '../components/TestPolicyModal';
import RegisterAgentModal from '../components/RegisterAgentModal';
import {
  Loader2,
  Shield,
  Play,
  Activity,
  Users,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldAlert,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const { stats, logs, agents, isLoading, isWebSocketConnected, refreshStats } = useDashboard();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Connecting to Control Plane...</p>
        </div>
      </main>
    );
  }

  const hasNoData = logs.length === 0 && agents.length === 0;

  // Zero State for First-Time Users
  if (hasNoData) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">AI Governance Control Plane</h1>
          <p className="text-gray-400 mb-8">Ensure your AI agents operate safely and compliantly with real-time policy enforcement.</p>

          <div className="space-y-4">
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-600/30"
            >
              <Play size={22} /> Verify Policy Logic
            </button>
            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="w-full py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors border border-gray-700"
            >
              <Plus size={22} /> Connect First Agent
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <ConnectionStatus isConnected={isWebSocketConnected} />
          </div>
        </div>
        <TestPolicyModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} onSuccess={refreshStats} />
        <RegisterAgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
      </main>
    );
  }

  // Filter for violations
  const violations = logs.filter(log => log.decision === 'deny');
  const violationsCount = stats?.totalViolations ?? violations.length;

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* SECTION 1: COMMAND CENTER HEADER */}
        <header className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/10">
                <Shield size={28} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Governance Status</h1>
                <div className="flex items-center gap-2 mt-1">
                  <ConnectionStatus isConnected={isWebSocketConnected} />
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-400 text-sm">Control Plane Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all border border-gray-600"
              >
                <Plus size={18} /> Connect Agent
              </button>
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95"
              >
                <Play size={18} /> Verify Policy Logic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
            <MetricBox
              label="Total Tasks"
              value={stats?.totalTasks ?? logs.length}
              icon={<Activity size={16} />}
              color="blue"
              onClick={() => { }} // Could open history
            />
            <MetricBox
              label="Violations"
              value={violationsCount}
              icon={<AlertTriangle size={16} />}
              color={violationsCount > 0 ? "red" : "gray"}
              onClick={() => { }} // Could open filtered log
            />
            <MetricBox
              label="Active Agents"
              value={agents.length}
              icon={<Users size={16} />}
              color="green"
              onClick={() => setIsAgentModalOpen(true)}
            />
            <MetricBox
              label="Success Rate"
              value={`${stats?.successRate ?? 100}%`}
              icon={<CheckCircle size={16} />}
              color="purple"
              onClick={() => setIsTestModalOpen(true)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* SECTION 2: LIVE ACTIVITY FEED */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Live Activity
              </h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">Real-time Feed</span>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-1 min-h-[300px] flex flex-col">
              {logs.length === 0 ? (
                <SectionEmptyState type="tasks" onAction={() => setIsTestModalOpen(true)} />
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                  {logs.slice(0, 10).map((log) => (
                    <TaskCard key={log.id} task={log as any} compact={true} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: POLICY VIOLATIONS (RISK) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-400" />
                Policy Violations
              </h2>
              {violationsCount > 0 && (
                <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full animate-pulse font-medium">
                  {violationsCount} Detected
                </span>
              )}
            </div>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-1 min-h-[300px] flex flex-col">
              {violations.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-6 min-h-[300px]">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">System Secure</h3>
                  <p className="text-sm text-gray-500 max-w-[240px] mb-6">No policy violations detected in recent activity.</p>
                  <button
                    onClick={() => setIsTestModalOpen(true)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
                  >
                    Simulate Attack Test
                  </button>
                </div>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                  {violations.slice(0, 10).map((log) => (
                    <TaskCard key={log.id} task={log as any} compact={true} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SECTION 4: CONNECTED AGENTS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} className="text-green-400" />
              Connected Agents
            </h2>
            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + Add New
            </button>
          </div>

          {agents.length === 0 ? (
            <SectionEmptyState type="agents" onAction={() => setIsAgentModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {/* Add Agent Card */}
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-800 hover:border-gray-700 bg-gray-800/20 hover:bg-gray-800/50 transition-all group h-[140px]"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={20} className="text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Register Agent</span>
              </button>
            </div>
          )}
        </section>

      </div>
      <TestPolicyModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} onSuccess={refreshStats} />
      <RegisterAgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
    </main>
  );
}

function MetricBox({ label, value, icon, color, onClick }: { label: string, value: string | number, icon: any, color: string, onClick?: () => void }) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10 cursor-pointer",
    green: "text-green-400 bg-green-500/5 border-green-500/10 hover:bg-green-500/10 cursor-pointer",
    red: "text-red-400 bg-red-500/5 border-red-500/10 hover:bg-red-500/10 cursor-pointer",
    purple: "text-purple-400 bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10 cursor-pointer",
    gray: "text-gray-400 bg-gray-500/5 border-gray-500/10 hover:bg-gray-500/10 cursor-pointer"
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col p-4 rounded-xl border transition-all active:scale-95 ${colors[color as keyof typeof colors]}`}
    >
      <div className="flex items-center gap-2 opacity-80 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
