'use client';

import React from 'react';
import { AlertCircle, Inbox, Zap } from 'lucide-react';

interface EmptyStateProps {
    icon?: 'inbox' | 'alert' | 'zap';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const icons = {
    inbox: Inbox,
    alert: AlertCircle,
    zap: Zap,
};

export default function EmptyState({
    icon = 'inbox',
    title,
    description,
    action,
}: EmptyStateProps) {
    const Icon = icons[icon];

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-xl text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Icon size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
