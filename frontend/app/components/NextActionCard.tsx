'use client';

import React from 'react';
import {
    Play,
    Shield,
    FileEdit,
    CheckCircle2,
    AlertTriangle,
    Zap,
    ArrowRight
} from 'lucide-react';

interface NextActionCardProps {
    hasAgents: boolean;
    hasTasks: boolean;
    violationsCount: number;
    onRunTest: () => void;
    onViewViolations: () => void;
}

export default function NextActionCard({
    hasAgents,
    hasTasks,
    violationsCount,
    onRunTest,
    onViewViolations,
}: NextActionCardProps) {
    // Determine next action based on system state
    const getNextAction = () => {
        if (!hasTasks && !hasAgents) {
            return {
                type: 'onboarding' as const,
                icon: <Zap size={24} />,
                title: 'Run your first policy test',
                description: 'See how the policy engine evaluates AI agent requests in real-time.',
                action: onRunTest,
                actionLabel: 'Run Test',
                color: 'blue',
            };
        }

        if (violationsCount > 0) {
            return {
                type: 'attention' as const,
                icon: <AlertTriangle size={24} />,
                title: `${violationsCount} request${violationsCount > 1 ? 's' : ''} blocked`,
                description: 'Review policy violations to ensure your agents are behaving correctly.',
                action: onViewViolations,
                actionLabel: 'Review Now',
                color: 'red',
            };
        }

        return {
            type: 'success' as const,
            icon: <CheckCircle2 size={24} />,
            title: 'System running smoothly',
            description: 'All AI agents are operating within policy. No action needed.',
            action: onRunTest,
            actionLabel: 'Run Another Test',
            color: 'green',
        };
    };

    const action = getNextAction();

    const colorStyles = {
        blue: {
            bg: 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60',
            border: 'border-blue-500/40',
            icon: 'text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
        red: {
            bg: 'bg-gradient-to-r from-red-900/60 to-orange-900/60',
            border: 'border-red-500/40',
            icon: 'text-red-400',
            button: 'bg-red-600 hover:bg-red-700',
        },
        green: {
            bg: 'bg-gradient-to-r from-green-900/60 to-emerald-900/60',
            border: 'border-green-500/40',
            icon: 'text-green-400',
            button: 'bg-green-600 hover:bg-green-700',
        },
    };

    const styles = colorStyles[action.color];

    return (
        <div className={`${styles.bg} ${styles.border} border rounded-xl p-5 mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${styles.icon}`}>
                    {action.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-1">
                        {action.title}
                    </h2>
                    <p className="text-sm text-gray-300">
                        {action.description}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={action.action}
                    className={`${styles.button} px-5 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap`}
                >
                    {action.actionLabel}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

// Quick Actions Bar Component
export function QuickActionsBar({
    onRunTest,
    onViewViolations,
}: {
    onRunTest: () => void;
    onViewViolations: () => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onRunTest}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                <Play size={14} />
                Run Test
            </button>
            <button
                onClick={onViewViolations}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
                <Shield size={14} />
                Violations
            </button>
            <a
                href="/policies"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
                <FileEdit size={14} />
                Policies
            </a>
        </div>
    );
}
