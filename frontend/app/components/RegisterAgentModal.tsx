'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { Copy, Check, Terminal, Server, Loader2 } from 'lucide-react';
import { policyAPI } from '../services/policyAPI';
import { useDashboard } from '../context/DashboardContext';

interface RegisterAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterAgentModal({ isOpen, onClose }: RegisterAgentModalProps) {
    const [step, setStep] = useState(1);
    const [agentName, setAgentName] = useState('my-ai-agent');
    const [copied, setCopied] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const { refreshStats } = useDashboard();

    const apiEndpoint = 'http://localhost:8080/api/tasks/evaluate';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleComplete = async () => {
        setIsRegistering(true);
        try {
            // Auto-register the agent so the user sees immediate results
            await policyAPI.executeTask({
                agentId: agentName,
                taskType: 'connection-check',
                input: 'Agent Connected via Dashboard Manual Setup',
                metadata: { source: 'onboarding' }
            });
            refreshStats();
        } catch (err) {
            console.error('Auto-registration failed', err);
        }
        setIsRegistering(false);
        onClose();
    };

    const getCodeSnippet = () => `
// JavaScript / TypeScript Example
const response = await fetch('${apiEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: '${agentName}',    // Unique ID
    taskName: 'generate-content',
    payload: { prompt: 'Hello World' }
  })
});

const result = await response.json();
if (result.policyAllowed) {
  // Proceed with execution
} else {
  // Blocked by policy
}
`.trim();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connect New Agent" width="lg">
            <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-800'}`}>1</div>
                        <span className="font-medium">Name</span>
                    </div>
                    <div className="h-0.5 w-12 bg-gray-800" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-800'}`}>2</div>
                        <span className="font-medium">Integrate</span>
                    </div>
                </div>

                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Assign an Identity</label>
                        <input
                            type="text"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. customer-service-bot"
                        />
                        <p className="text-sm text-gray-500 mt-3">
                            This ID will be used to track policies and history for this specific agent instance.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Next: Get Integration Code
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-black/30 border border-gray-700 rounded-xl p-4 relative group">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => copyToClipboard(getCodeSnippet())}
                                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <pre className="text-sm font-mono text-gray-300 overflow-x-auto p-2">
                                {getCodeSnippet()}
                            </pre>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isRegistering}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                {isRegistering ? <Loader2 className="animate-spin" size={20} /> : 'Done & Connect'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
