'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, Trash2, FileJson, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from './ui/ConfirmDialog';

interface PolicyEditorProps {
    initialPolicy?: any;
    onSave: (policy: any) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void>;
}

export default function PolicyEditor({ initialPolicy, onSave, onCancel, onDelete }: PolicyEditorProps) {
    const { showToast } = useToast();
    const [policy, setPolicy] = useState(initialPolicy || {
        id: '',
        rules: [],
        priority: 0,
        description: ''
    });

    // Confirmation States
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track unsaved changes
    useEffect(() => {
        if (initialPolicy) {
            const isChanged = JSON.stringify(policy) !== JSON.stringify(initialPolicy);
            setHasUnsavedChanges(isChanged);
        } else if (policy.id || policy.description) {
            setHasUnsavedChanges(true); // New policy with edits
        }
    }, [policy, initialPolicy]);


    const handleSave = async () => {
        if (!policy.id) {
            showToast('Policy ID is required', 'error');
            return;
        }
        try {
            await onSave(policy);
            showToast('Policy saved successfully', 'success');
            setHasUnsavedChanges(false);
        } catch (e) {
            showToast('Failed to save policy', 'error');
        }
    };

    const handleDelete = async () => {
        if (onDelete && policy.id) {
            try {
                await onDelete(policy.id);
                showToast('Policy deleted', 'success');
            } catch (e) {
                showToast('Failed to delete policy', 'error');
            }
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if (e.key === 'Escape') {
                if (hasUnsavedChanges) setShowCancelConfirm(true);
                else onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [policy, hasUnsavedChanges]); // Dependencies for closure

    const addRule = () => {
        setPolicy({
            ...policy,
            rules: [...(Array.isArray(policy.rules) ? policy.rules : []), { type: 'keyword', value: '', action: 'deny' }]
        });
    };

    const updateRule = (idx: number, field: string, value: any) => {
        const newRules = [...(Array.isArray(policy.rules) ? policy.rules : [])];
        newRules[idx] = { ...newRules[idx], [field]: value };
        setPolicy({ ...policy, rules: newRules });
    };

    const removeRule = (idx: number) => {
        setPolicy({
            ...policy,
            rules: policy.rules.filter((_: any, i: number) => i !== idx)
        });
    };

    return (
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col animate-scale-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileJson className="text-blue-400" />
                    {initialPolicy ? 'Edit Policy' : 'New Policy'}
                    {hasUnsavedChanges && <span className="text-[10px] text-yellow-500 font-mono ml-2">* Unsaved</span>}
                </h2>
                <div className="flex gap-2">
                    {initialPolicy && onDelete && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                            title="Delete Policy"
                            aria-label="Delete Policy"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => hasUnsavedChanges ? setShowCancelConfirm(true) : onCancel()}
                        className="p-2 hover:bg-white/10 rounded-lg"
                        title="Close Editor"
                        aria-label="Close Editor"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {/* ID & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Policy ID</label>
                        <input
                            type="text"
                            value={policy.id}
                            disabled={!!initialPolicy}
                            onChange={e => setPolicy({ ...policy, id: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                            placeholder="e.g. pii-protection"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                        <input
                            type="text"
                            value={policy.description}
                            onChange={e => setPolicy({ ...policy, description: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                            placeholder="Policy purpose..."
                        />
                    </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label htmlFor="priority-input" className="text-xs font-bold text-gray-400 uppercase">Priority (Higher = enforced first)</label>
                    <input
                        id="priority-input"
                        type="number"
                        value={policy.priority}
                        onChange={e => setPolicy({ ...policy, priority: parseInt(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Rules */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-400 uppercase">Rules</label>
                        <button
                            onClick={addRule}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
                        >
                            + Add Rule
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(Array.isArray(policy.rules) ? policy.rules : []).map((rule: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start bg-black/20 p-3 rounded-lg border border-white/5 animate-slide-up">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <select
                                            value={rule.type}
                                            onChange={(e) => updateRule(i, 'type', e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none"
                                            title="Rule Type"
                                        >
                                            <option value="keyword">Keyword</option>
                                            <option value="regex">Regex</option>
                                            <option value="semantic">Semantic</option>
                                        </select>
                                        <select
                                            value={rule.action}
                                            onChange={(e) => updateRule(i, 'action', e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none text-yellow-500"
                                            title="Action"
                                        >
                                            <option value="deny">Block</option>
                                            <option value="warn">Warn</option>
                                            <option value="allow">Allow</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={rule.value}
                                        onChange={e => updateRule(i, 'value', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-sm outline-none font-mono text-blue-300"
                                        placeholder={rule.type === 'regex' ? 'Regex pattern...' : 'Keyword or phrase...'}
                                    />
                                </div>
                                <button
                                    onClick={() => removeRule(i)}
                                    className="text-gray-500 hover:text-red-400 p-1"
                                    title="Remove Rule"
                                    aria-label="Remove Rule"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        {policy.rules.length === 0 && (
                            <div className="text-center py-8 text-gray-600 border border-dashed border-white/10 rounded-lg">
                                No rules defined.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button onClick={() => hasUnsavedChanges ? setShowCancelConfirm(true) : onCancel()} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Cancel (Esc)
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                >
                    <Save size={16} /> Save Policy (Ctrl+S)
                </button>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Policy?"
                message={`Are you sure you want to delete policy "${policy.id}"? This action cannot be undone.`}
                confirmText="Delete Policy"
                isDestructive={true}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <ConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to discard them and exit?"
                confirmText="Discard Changes"
                isDestructive={true}
                onConfirm={onCancel}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
}
