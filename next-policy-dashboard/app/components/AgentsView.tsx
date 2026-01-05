import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, AlertOctagon, CheckCircle, Activity, Box, Database as DbIcon, Save, X, LayoutGrid, List as ListIcon, Trash2, Search, Filter } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from './ui/ConfirmDialog';

interface Agent {
    id: string;
    name: string;
    status: 'created' | 'connected' | 'active' | 'suspended' | 'blocked';
    capabilities: string[];
    assigned_policies: string[];
    last_heartbeat: string;
    role?: string;
    risk_level?: string;
}

export default function AgentsView() {
    const { policies, tasks } = useDashboard();
    const { showToast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filter, setFilter] = useState('');

    // Selection & Bulk Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Management State
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Form State (Shared for Edit/Register)
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        status: 'active',
        role: 'general',
        assigned_policies: [] as string[]
    });

    // Confirmation
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    const fetchAgents = async () => {
        try {
            const res = await fetch('http://localhost:8082/api/agents');
            if (res.ok) setAgents(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredAgents = agents.filter(a =>
    (a.name?.toLowerCase().includes(filter.toLowerCase()) ||
        a.id.toLowerCase().includes(filter.toLowerCase()))
    );

    const handleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredAgents.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredAgents.map(a => a.id)));
    };

    const openEdit = (agent: Agent) => {
        setSelectedAgent(agent);
        setFormData({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            role: agent.role || 'general',
            assigned_policies: agent.assigned_policies || []
        });
        setIsEditing(true);
    };

    const openRegister = () => {
        setSelectedAgent(null);
        setFormData({ id: '', name: '', status: 'active', role: 'general', assigned_policies: [] });
        setIsRegistering(true);
    };

    const handleSave = async () => {
        try {
            const method = isRegistering ? 'POST' : 'PUT';
            const url = isRegistering ? 'http://localhost:8082/api/agents' : `http://localhost:8082/api/agents/${selectedAgent?.id}`;
            const body = isRegistering ? formData : { ...formData, id: undefined }; // Don't send ID on update

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save');

            showToast(isRegistering ? 'Agent registered' : 'Agent updated', 'success');
            setIsEditing(false);
            setIsRegistering(false);
            fetchAgents();
        } catch (e) {
            showToast('Operation failed', 'error');
        }
    };

    const handleBulkAction = async (action: 'block' | 'activate') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.size} agents?`)) return;

        try {
            await Promise.all(Array.from(selectedIds).map(id =>
                fetch(`http://localhost:8082/api/agents/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: action === 'block' ? 'blocked' : 'active' })
                })
            ));
            showToast(`Bulk ${action} completed`, 'success');
            setSelectedIds(new Set());
            fetchAgents();
        } catch (e) {
            showToast('Bulk action failed', 'error');
        }
    };

    const togglePolicy = (id: string) => {
        const current = formData.assigned_policies || [];
        if (current.includes(id)) setFormData({ ...formData, assigned_policies: current.filter(p => p !== id) });
        else setFormData({ ...formData, assigned_policies: [...current, id] });
    };

    // Derived Metrics for Selected Agent
    const agentTasks = selectedAgent ? tasks.filter(t => t.agentId === selectedAgent.id) : [];
    const successRate = agentTasks.length ? Math.round((agentTasks.filter(t => t.policyResult !== 'deny').length / agentTasks.length) * 100) : 100;

    return (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none w-64"
                        />
                    </div>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`} title="Grid View" aria-label="Grid View"><LayoutGrid size={14} /></button>
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-500'}`} title="Table View" aria-label="Table View"><ListIcon size={14} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-right-4">
                            <span className="text-xs text-gray-400 font-bold">{selectedIds.size} selected</span>
                            <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500/20">Activate</button>
                            <button onClick={() => handleBulkAction('block')} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20">Block</button>
                        </div>
                    )}
                    <button onClick={openRegister} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20">
                        <Plus size={14} /> Register Agent
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {filteredAgents.map(agent => (
                            <div key={agent.id}
                                onClick={() => handleSelect(agent.id)}
                                className={`bg-white/5 border p-5 rounded-xl transition-all group relative overflow-hidden cursor-pointer ${selectedIds.has(agent.id) ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {/* Selection Check */}
                                <div className={`absolute top-3 right-3 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.has(agent.id) ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-black/40'}`}>
                                    {selectedIds.has(agent.id) && <CheckCircle size={10} className="text-white" />}
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold uppercase ${agent.status === 'blocked' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {agent.name ? agent.name.substring(0, 2) : '??'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                                        <div className="text-[10px] text-gray-500 font-mono">{agent.id}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`font-bold capitalize ${agent.status === 'active' ? 'text-green-400' :
                                            agent.status === 'blocked' ? 'text-red-400' : 'text-yellow-400'
                                            }`}>{agent.status}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Role</span>
                                        <span className="text-white capitalize">{agent.role || 'General'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Last Seen</span>
                                        <span className="text-gray-400">{agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleTimeString() : 'Never'}</span>
                                    </div>
                                </div>

                                <button onClick={(e) => { e.stopPropagation(); openEdit(agent); }} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-300 border border-white/5">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold">
                                <tr>
                                    <th className="p-4 w-10">
                                        <div onClick={handleSelectAll} className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center ${selectedIds.size === filteredAgents.length && filteredAgents.length > 0 ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-black/40'}`}>
                                            {selectedIds.size === filteredAgents.length && filteredAgents.length > 0 && <CheckCircle size={10} className="text-white" />}
                                        </div>
                                    </th>
                                    <th className="p-4">Agent</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Policies</th>
                                    <th className="p-4">Last Seen</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAgents.map(agent => (
                                    <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div onClick={() => handleSelect(agent.id)} className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center ${selectedIds.has(agent.id) ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-black/40'}`}>
                                                {selectedIds.has(agent.id) && <CheckCircle size={10} className="text-white" />}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{agent.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{agent.id}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${agent.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                                agent.status === 'blocked' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>{agent.status}</span>
                                        </td>
                                        <td className="p-4 text-gray-300 capitalize">{agent.role || 'General'}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[10px] border border-blue-500/20">
                                                {agent.assigned_policies?.length || 0} assigned
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-xs font-mono">{agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleTimeString() : 'Never'}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEdit(agent)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Edit Agent" aria-label="Edit Agent">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Slide-over Panel (Register/Edit) */}
            {(isEditing || isRegistering) && (
                <div className="absolute top-0 right-0 h-full w-[500px] bg-[#0A0C10] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 z-50">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {isRegistering ? <Plus className="text-blue-500" /> : <Box className="text-blue-500" />}
                                {isRegistering ? 'Register New Agent' : 'Agent Details'}
                            </h2>
                            <div className="text-xs text-gray-400 mt-1">{isRegistering ? 'Add a new agent to the system' : `Manage configuration for ${selectedAgent?.name}`}</div>
                        </div>
                        <button onClick={() => { setIsEditing(false); setIsRegistering(false); }} className="p-2 hover:bg-white/10 rounded-lg" title="Close Panel" aria-label="Close Panel"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Metrics Section (Only for Edit) */}
                        {isEditing && selectedAgent && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <div className="text-2xl font-bold text-white">{successRate}%</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Success Rate</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <div className="text-2xl font-bold text-white">{agentTasks.length}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Tasks</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <div className="text-2xl font-bold text-white">{selectedAgent.assigned_policies?.length || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Policies</div>
                                </div>
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-white/10 pb-2">Configuration</h3>

                            {isRegistering && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Agent ID (Unique)</label>
                                    <input type="text" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" placeholder="e.g. data-processor-01" />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Display Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" placeholder="Friendly Name" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="role-select">Role</label>
                                    <select id="role-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" title="Select Role">
                                        <option value="general">General</option>
                                        <option value="researcher">Researcher</option>
                                        <option value="executor">Executor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="status-select">Status</label>
                                    <select id="status-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" title="Select Status">
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Policy Assignment */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-white/10 pb-2">Policy Assignment</h3>
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                {policies.map(p => (
                                    <div key={p.id} onClick={() => togglePolicy(p.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${formData.assigned_policies.includes(p.id) ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${formData.assigned_policies.includes(p.id) ? 'bg-blue-400' : 'bg-gray-600'}`} />
                                            <div>
                                                <div className="text-sm font-bold text-white">{p.name || p.id}</div>
                                                <div className="text-[10px] text-gray-500">{p.description || "No description"}</div>
                                            </div>
                                        </div>
                                        {formData.assigned_policies.includes(p.id) && <CheckCircle size={16} className="text-blue-400" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                        <button onClick={() => { setIsEditing(false); setIsRegistering(false); }} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                            <Save size={16} /> {isRegistering ? 'Register Agent' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
