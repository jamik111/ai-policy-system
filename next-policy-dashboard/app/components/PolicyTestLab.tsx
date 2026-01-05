'use client';
import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PolicyTestLabProps {
    initialPolicy?: any;
}

export default function PolicyTestLab({ initialPolicy }: PolicyTestLabProps) {
    const [jsonInput, setJsonInput] = useState('{\n  "agentId": "test_agent",\n  "input": "User password is..."\n}');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [testPolicy, setTestPolicy] = useState(initialPolicy ? JSON.stringify(initialPolicy, null, 2) : '{\n  "id": "test-1",\n  "effect": "deny",\n  "rules": [\n    { "type": "keyword", "value": "password", "action": "deny" }\n  ]\n}');

    const runTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8082/api/policies/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policy: JSON.parse(testPolicy),
                    context: JSON.parse(jsonInput)
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
            setResult({ error: 'Test failed (Check JSON syntax)' });
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col gap-4">
                <div className="glass p-4 rounded-xl border border-white/10 flex-1 flex flex-col">
                    <label htmlFor="test-policy-input" className="text-sm font-bold text-gray-400 mb-2 uppercase">1. Test Policy (JSON)</label>
                    <textarea
                        id="test-policy-input"
                        className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-xs font-mono text-green-400 outline-none resize-none"
                        value={testPolicy}
                        onChange={e => setTestPolicy(e.target.value)}
                    />
                </div>
                <div className="glass p-4 rounded-xl border border-white/10 flex-1 flex flex-col">
                    <label htmlFor="input-context-input" className="text-sm font-bold text-gray-400 mb-2 uppercase">2. Input Context (JSON)</label>
                    <textarea
                        id="input-context-input"
                        className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-xs font-mono text-blue-300 outline-none resize-none"
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                    />
                </div>
                <button
                    onClick={runTest}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-500 p-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all"
                >
                    <Play size={18} /> {loading ? 'Testing...' : 'Run Simulation'}
                </button>
            </div>

            <div className="glass p-6 rounded-xl border border-white/10 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Simulation Result</h3>

                {result ? (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${result.allowed
                            ? (result.status === 'warn' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-green-500/50 bg-green-500/10')
                            : 'border-red-500/50 bg-red-500/10'
                            }`}>
                            {result.allowed ? (
                                result.status === 'warn' ? <AlertTriangle size={48} className="text-yellow-500" /> : <CheckCircle size={48} className="text-green-500" />
                            ) : (
                                <XCircle size={48} className="text-red-500" />
                            )}
                            <div className="text-2xl font-bold uppercase tracking-widest">
                                {result.status || (result.allowed ? 'ALLOWED' : 'BLOCKED')}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-gray-400">Confidence Score</span>
                                <span className="font-mono text-white">{result.confidence ? (result.confidence * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-gray-400">Latency</span>
                                <span className="font-mono text-white">{result.latencyMs} ms</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-gray-400">Reason</span>
                                <span className="font-mono text-white text-right">{result.reason || '-'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 italic">
                        Run a test to see results...
                    </div>
                )}
            </div>
        </div>
    );
}
