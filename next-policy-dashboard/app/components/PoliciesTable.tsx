import React, { useState } from 'react';
import { Edit2, Trash2, Power, Play, History, MoreHorizontal, FileText, Check, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface PoliciesTableProps {
    policies: any[];
    onEdit: (policy: any) => void;
    onDelete: (id: string) => Promise<void>;
    onTest: (policy: any) => void;
    onToggle: (policy: any) => Promise<void>;
    onViewHistory: (policy: any) => void;
}

export default function PoliciesTable({ policies, onEdit, onDelete, onTest, onToggle, onViewHistory }: PoliciesTableProps) {
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this policy?')) {
            setDeletingId(id);
            await onDelete(id);
            setDeletingId(null);
        }
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 rounded-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 rounded-tl-xl">Status</th>
                            <th className="p-4">Policy Name / ID</th>
                            <th className="p-4">Rules</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Total Triggers</th>
                            <th className="p-4 rounded-tr-xl text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {policies.map(policy => (
                            <tr key={policy.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggle(policy); }}
                                        className={`w-8 h-4 rounded-full p-0.5 transition-colors ${policy.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                                        title={policy.is_active ? "Deactivate" : "Activate"}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${policy.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{policy.id}</span>
                                        <span className="text-xs text-gray-500 line-clamp-1">{policy.description || "No description"}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-gray-300 border border-white/10">
                                        {policy.rules?.length || 0} rules
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <svg width="100%" height="6" className="block text-blue-500">
                                                <rect width={`${Math.min(policy.priority, 100)}%`} height="100%" fill="currentColor" className="transition-all duration-500" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-400">{policy.priority}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {/* Placeholder for triggers, could come from stats if merged */}
                                    -
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onTest(policy)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Test in Sandbox"><Play size={16} /></button>
                                        <button onClick={() => onViewHistory(policy)} className="p-1.5 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors" title="View History"><History size={16} /></button>
                                        <button onClick={() => onEdit(policy)} className="p-1.5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={(e) => handleDelete(policy.id, e)} className="p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {policies.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                    No policies found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
