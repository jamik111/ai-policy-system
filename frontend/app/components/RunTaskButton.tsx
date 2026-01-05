'use client';

import React, { useState } from 'react';
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { policyAPI } from '../services/policyAPI';

interface RunTaskButtonProps {
    agentId?: string;
    onSuccess?: () => void;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md';
}

export default function RunTaskButton({
    agentId = 'default-agent',
    onSuccess,
    variant = 'primary',
    size = 'md',
}: RunTaskButtonProps) {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<string | null>(null);

    const runTask = async () => {
        setStatus('running');
        setResult(null);

        try {
            const response = await policyAPI.executeTask({
                agentId,
                taskType: 'test-evaluation',
                input: 'Test policy evaluation from dashboard',
                metadata: { source: 'dashboard', timestamp: Date.now() },
            });

            if (response.status === 'completed') {
                setStatus('success');
                setResult(response.result?.decision === 'allow' ? 'ALLOWED' : 'DENIED');
            } else {
                setStatus('error');
                setResult('Task failed');
            }

            onSuccess?.();
        } catch (err) {
            setStatus('error');
            setResult('Connection failed');
        }

        // Reset after 3 seconds
        setTimeout(() => {
            setStatus('idle');
            setResult(null);
        }, 3000);
    };

    const baseClasses = `
        inline-flex items-center gap-2 font-medium rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        ${variant === 'primary'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
        }
    `;

    const getIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />;
            case 'success':
                return <CheckCircle size={size === 'sm' ? 14 : 16} className="text-green-400" />;
            case 'error':
                return <XCircle size={size === 'sm' ? 14 : 16} className="text-red-400" />;
            default:
                return <Play size={size === 'sm' ? 14 : 16} />;
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'running':
                return 'Running...';
            case 'success':
            case 'error':
                return result;
            default:
                return 'Run Test Task';
        }
    };

    return (
        <button
            onClick={runTask}
            disabled={status === 'running'}
            className={baseClasses}
        >
            {getIcon()}
            {getLabel()}
        </button>
    );
}
