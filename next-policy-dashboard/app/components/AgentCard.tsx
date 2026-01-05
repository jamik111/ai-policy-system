'use client';

import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Agent } from '../services/policyAPI';
import { Play, Activity } from 'lucide-react';

export default function AgentCard({ agent }: { agent: Agent }) {
    const { runTask } = useDashboard();

    const handleRun = () => {
        // Simulation scenarios
        const inputs = [
            { msg: "Process user analytics", data: { id: 1 } },
            { msg: "Access sensitive passwords", data: { id: 2 } },
            { msg: "Legal compliance check", data: { id: 3 } },
            { msg: "Untrusted external probe", data: { id: 4 } },
            { msg: "Empty task data", data: null }
        ];
        const scenario = inputs[Math.floor(Math.random() * inputs.length)];
        runTask(agent.id, scenario.msg, scenario.data);
    };

    return (
        <div className={`p-4 rounded-xl border transition-all duration-300 ${agent.status === 'running'
                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-blue-500/30'
            }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-lg text-white font-outfit">{agent.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{agent.id} • {agent.type}</p>
                </div>
                <div className={`p-1.5 rounded-full ${agent.status === 'running' ? 'bg-blue-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'
                    }`}>
                    {agent.status === 'running' ? <Activity size={14} /> : <Play size={14} />}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Tasks</span>
                    <span className="text-xl font-bold text-white">{agent.taskCount}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status</span>
                    <span className={`text-xs font-semibold ${agent.status === 'running' ? 'text-blue-400' : 'text-green-400'
                        }`}>
                        {agent.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <button
                onClick={handleRun}
                disabled={agent.status === 'running'}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${agent.status === 'running'
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    }`}
            >
                Trigger Task
            </button>
        </div>
    );
}
