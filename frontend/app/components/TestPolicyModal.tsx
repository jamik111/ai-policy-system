'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { policyAPI } from '../services/policyAPI';
import { Loader2, Play, ShieldAlert, ShieldCheck, Bug, Terminal } from 'lucide-react';

interface TestPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SAMPLE_PAYLOADS = [
    { name: 'Safe Query', value: 'What is the weather in Tokyo?' },
    { name: 'SQL Injection', value: "SELECT * FROM users WHERE '1'='1'" },
    { name: 'PII Leak', value: 'My email is user@example.com' },
    { name: 'System Command', value: 'rm -rf /' },
];

export default function TestPolicyModal({ isOpen, onClose, onSuccess }: TestPolicyModalProps) {
    const [input, setInput] = useState(SAMPLE_PAYLOADS[0].value);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runTest = async () => {
        setIsRunning(true);
        setResult(null);
        try {
            const response = await policyAPI.executeTask({
                agentId: 'default-agent',
                taskType: 'policy-test',
                input: input,
                metadata: { source: 'dashboard', mode: 'manual_test' }
            });
            setResult(response);
            onSuccess();
        } catch (err: any) {
            setResult({ error: err.message || 'Test failed' });
        }
        setIsRunning(false);
    };

    const isBlocked = result && (
        (result.error && result.error.toLowerCase().includes('denied')) ||
        result.result?.decision === 'deny'
    );

    const isAllowed = result && !result.error && result.result?.decision === 'allow';
    const isSystemError = result && result.error && !isBlocked;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Policy Verification Playground" width="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                {/* Left: Input */}
                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-400 mb-2 block">Test Inputs</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {SAMPLE_PAYLOADS.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => setInput(p.value)}
                                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-64 bg-black/40 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none outline-none"
                            placeholder="Enter prompt or data payload..."
                        />
                    </div>

                    <button
                        onClick={runTest}
                        disabled={isRunning || !input}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        {isRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        Evaluate Policy
                    </button>
                </div>

                {/* Right: Output */}
                <div className="flex flex-col bg-gray-800/20 rounded-xl border border-gray-700/50 p-4">
                    <label className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Terminal size={14} /> Evaluation Result
                    </label>

                    <div className="flex-1 flex flex-col">
                        {result ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Status Banner */}
                                <div className={`p-4 rounded-xl border flex items-center gap-4 ${isSystemError
                                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                        : isAllowed
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {isSystemError ? <Bug size={24} /> :
                                        isAllowed ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}

                                    <div>
                                        <h3 className="font-bold text-lg uppercase tracking-wide">
                                            {isSystemError ? 'SYSTEM ERROR' : isAllowed ? 'ALLOWED' : 'BLOCKED'}
                                        </h3>
                                        <p className="text-sm opacity-90 font-medium">
                                            {result.error ? result.error : `${(result.result?.confidence * 100).toFixed(1)}% Confidence Score`}
                                        </p>
                                    </div>
                                </div>

                                {/* Analysis Details */}
                                {!isSystemError && (
                                    <div className="space-y-3">
                                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Triggered Rules</span>
                                            {result.result?.rulesTriggered?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {result.result.rulesTriggered.map((rule: string, i: number) => (
                                                        <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded border border-red-500/10">
                                                            {rule}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No specific deny rules matched</span>
                                            )}
                                        </div>

                                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 font-mono text-xs overflow-x-auto">
                                            <span className="text-xs text-gray-500 font-sans uppercase font-bold block mb-1">Raw Response</span>
                                            <pre className="text-gray-300">{JSON.stringify(result, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-600 flex-col gap-2 opacity-50">
                                <ShieldAlert size={40} />
                                <p className="text-sm">Ready to evaluate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
