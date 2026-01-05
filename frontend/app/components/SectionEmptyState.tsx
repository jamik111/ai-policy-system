'use client';

import React from 'react';
import {
    Inbox,
    Users,
    ShieldCheck,
    FileText,
    Play,
    Terminal,
    CheckCircle
} from 'lucide-react';

type EmptyStateType = 'tasks' | 'agents' | 'violations' | 'auditLogs';

interface SectionEmptyStateProps {
    type: EmptyStateType;
    onAction: () => void;
}

const emptyStates: Record<EmptyStateType, {
    icon: React.ReactNode;
    text: string;
    cta: string;
    result: string;
}> = {
    tasks: {
        icon: <Inbox size={28} />,
        text: "No policy evaluations yet.",
        cta: "Run Test Evaluation",
        result: "Executes a sample request against your policies and shows the result here.",
    },
    agents: {
        icon: <Users size={28} />,
        text: "No agents connected.",
        cta: "View Setup Guide",
        result: "Opens documentation on how to connect your AI agent to the policy engine.",
    },
    violations: {
        icon: <ShieldCheck size={28} />,
        text: "No blocked requests — your agents are compliant.",
        cta: "Run Test Evaluation",
        result: "Triggers a policy check to verify your rules are working correctly.",
    },
    auditLogs: {
        icon: <FileText size={28} />,
        text: "Audit log is empty.",
        cta: "Generate First Entry",
        result: "Runs a policy evaluation that creates a logged audit trail entry.",
    },
};

export default function SectionEmptyState({ type, onAction }: SectionEmptyStateProps) {
    const state = emptyStates[type];

    return (
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-800/30 border border-gray-700/50 rounded-xl text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 mb-4">
                {state.icon}
            </div>

            {/* Explanation - 1 sentence */}
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
                {state.text}
            </p>

            {/* CTA Button */}
            <button
                onClick={onAction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
                <Play size={14} />
                {state.cta}
            </button>

            {/* What happens after - subtle hint */}
            <p className="text-gray-600 text-xs mt-3 max-w-xs">
                {state.result}
            </p>
        </div>
    );
}
