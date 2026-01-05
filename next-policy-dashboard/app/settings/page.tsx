"use client";

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import {
    Info, Building2, Palette, Shield, Lock, ShieldCheck, Key,
    Plug, Cloud, Globe, Webhook, Bell, Mail, Zap, Users,
    Database, Save, FileText, CheckCircle, ShieldAlert,
    UserPlus, Terminal, Settings, FlaskConical, Search,
    List, ChevronRight, ExternalLink, RefreshCw, AlertTriangle,
    Plus, HardDrive, Zap as ZapIcon, Sliders, MessageSquare,
    Globe as GlobeIcon
} from 'lucide-react';

type Section = {
    id: string;
    label: string;
    icon: any;
};

type Category = {
    title: string;
    sections: Section[];
};

export default function SettingsPage() {
    const { showToast } = useToast();
    const [activeSection, setActiveSection] = useState('system_info');
    const [searchQuery, setSearchQuery] = useState('');
    const [showTermConfirm, setShowTermConfirm] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);

    const categories: Category[] = [
        {
            title: "GENERAL",
            sections: [
                { id: 'system_info', label: 'System Information', icon: Info },
                { id: 'org_settings', label: 'Organization Settings', icon: Building2 },
                { id: 'branding', label: 'Branding', icon: Palette },
            ]
        },
        {
            title: "SECURITY",
            sections: [
                { id: 'auth', label: 'Authentication', icon: Shield },
                { id: 'sessions', label: 'Session Management', icon: Lock },
                { id: 'ip_restrictions', label: 'IP Restrictions', icon: ShieldCheck },
                { id: 'security_policies', label: 'Security Policies', icon: Key },
            ]
        },
        {
            title: "INTEGRATIONS",
            sections: [
                { id: 'connected_services', label: 'Connected Services', icon: Plug },
                { id: 'api_management', label: 'API Management', icon: Cloud },
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                { id: 'sso_config', label: 'SSO Configuration', icon: Globe },
            ]
        },
        {
            title: "NOTIFICATIONS",
            sections: [
                { id: 'email_templates', label: 'Email Templates', icon: Mail },
                { id: 'alert_rules', label: 'Alert Rules', icon: Bell },
                { id: 'escalation_policies', label: 'Escalation Policies', icon: Zap },
            ]
        },
        {
            title: "DATA & COMPLIANCE",
            sections: [
                { id: 'data_retention', label: 'Data Retention', icon: Database },
                { id: 'backup_recovery', label: 'Backup & Recovery', icon: Save },
                { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
                { id: 'compliance_reports', label: 'Compliance Reports', icon: CheckCircle },
            ]
        },
        {
            title: "TEAM & ACCESS",
            sections: [
                { id: 'user_management', label: 'User Management', icon: Users },
                { id: 'roles_permissions', label: 'Roles & Permissions', icon: ShieldAlert },
                { id: 'team_settings', label: 'Team Settings', icon: List },
                { id: 'invitations', label: 'Invitations', icon: UserPlus },
            ]
        },
        {
            title: "ADVANCED",
            sections: [
                { id: 'feature_flags', label: 'Feature Flags', icon: FlaskConical },
                { id: 'dev_options', label: 'Developer Options', icon: Terminal },
                { id: 'system_maintenance', label: 'System Maintenance', icon: Settings },
                { id: 'performance_tuning', label: 'Performance Tuning', icon: ZapIcon },
            ]
        }
    ];

    const getActiveSectionLabel = () => {
        for (const cat of categories) {
            const section = cat.sections.find(s => s.id === activeSection);
            if (section) return section.label;
        }
        return "Settings";
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] text-gray-200 font-sans selection:bg-blue-500/30">
            <Header stats={{ active_agents: 12 }} />

            <main className="max-w-[1600px] mx-auto p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-8 h-fit lg:sticky lg:top-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6 px-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Settings className="text-blue-400" size={20} />
                                </div>
                                <h1 className="text-xl font-bold text-white tracking-tight">System Settings</h1>
                            </div>

                            <div className="relative mb-6 px-4">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search settings..."
                                    title="Search settings"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            <nav className="space-y-6">
                                {categories.map((category) => {
                                    const filteredSections = category.sections.filter(s =>
                                        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        category.title.toLowerCase().includes(searchQuery.toLowerCase())
                                    );

                                    if (filteredSections.length === 0) return null;

                                    return (
                                        <div key={category.title} className="space-y-1">
                                            <h2 className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">{category.title}</h2>
                                            {filteredSections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setActiveSection(section.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all group ${activeSection === section.id
                                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <section.icon size={16} className={activeSection === section.id ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'} />
                                                        {section.label}
                                                    </div>
                                                    {activeSection === section.id && <ChevronRight size={14} className="text-blue-400/50" />}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Pane */}
                    <section className="flex-1 bg-[#161b22] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />

                        {/* Section Header */}
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{getActiveSectionLabel()}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Configure and manage system-wide settings for your organization.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => showToast('Configuration reloaded from server', 'info')}
                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                        title="Reload settings"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={() => showToast('System settings updated successfully', 'success')}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                        title="Save all changes"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section Content */}
                        <div className="p-8">
                            {activeSection === 'system_info' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Version & Status</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">Core Engine Version</span>
                                                    <span className="text-[11px] font-mono text-white bg-white/5 px-2 py-0.5 rounded">v2.4.18-stable</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">Dashboard UI</span>
                                                    <span className="text-[11px] font-mono text-white bg-white/5 px-2 py-0.5 rounded">v1.2.0</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">System Environment</span>
                                                    <span className="text-[11px] font-bold text-blue-400">Production</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-[11px] text-gray-400">Instance Uptime</span>
                                                    <span className="text-[11px] font-mono text-green-400">14d 06h 22m</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Instance Configuration</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">Region</span>
                                                    <span className="text-[11px] text-white">US-East (N. Virginia)</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">Storage Provider</span>
                                                    <span className="text-[11px] text-white">AWS S3 / RDS</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-400">Primary Node ID</span>
                                                    <span className="text-[11px] font-mono text-gray-500">ish-prod-node-01</span>
                                                </div>
                                                <button className="w-full mt-2 py-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-2">
                                                    <ExternalLink size={12} /> View Cluster Topology
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-yellow-500/10 rounded-xl h-fit">
                                                <AlertTriangle className="text-yellow-500" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white mb-1">Upcoming Maintenance</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                                    The core engine is scheduled for an upgrade to **v2.5.0** on **Jan 15, 2026 at 02:00 UTC**.
                                                    Expect momentary latency increases during the 10-minute deployment window.
                                                </p>
                                                <button className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:bg-yellow-500/20 transition-all">
                                                    Reschedule or Defer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'org_settings' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">General Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Organization Name</label>
                                                    <input type="text" defaultValue="ISH Security Solutions" title="Organization Name" placeholder="Organization Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Technical Contact Email</label>
                                                    <input type="email" defaultValue="admin@ish-security.com" title="Technical Contact Email" placeholder="email@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Primary Domain</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" defaultValue="ish-security.com" title="Primary Domain" placeholder="example.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                        <button className="px-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white transition-all">Verify</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Business Address</label>
                                                    <textarea rows={3} defaultValue="Suite 500, Tech Plaza&#10;Silicon Valley, CA 94043&#10;United States" title="Business Address" placeholder="Street, City, Country" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Tax ID / VAT Number</label>
                                                    <input type="text" defaultValue="US-99-1234567" title="Tax ID" placeholder="Tax ID" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'branding' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Visual Identity</h4>
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center group hover:border-blue-500/30 transition-all cursor-pointer" title="Upload Logo">
                                                        <Plus size={24} className="text-gray-600 group-hover:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Company Logo</label>
                                                        <p className="text-[10px] text-gray-600 mb-2">SVG or PNG (Max 500kb)</p>
                                                        <button className="text-[10px] font-bold text-blue-400 hover:underline">Upload Image</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Primary Accent Color</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {[
                                                            { hex: '#3b82f6', class: 'bg-blue-500' },
                                                            { hex: '#8b5cf6', class: 'bg-indigo-500' },
                                                            { hex: '#ec4899', class: 'bg-pink-500' },
                                                            { hex: '#f97316', class: 'bg-orange-500' },
                                                            { hex: '#10b981', class: 'bg-emerald-500' }
                                                        ].map(color => (
                                                            <button
                                                                key={color.hex}
                                                                className={`w-8 h-8 rounded-full border-2 border-white/10 relative ${color.class}`}
                                                                title={`Accent Color ${color.hex}`}
                                                            >
                                                                {color.hex === '#3b82f6' && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle size={14} className="text-white drop-shadow-md" /></div>}
                                                            </button>
                                                        ))}
                                                        <button className="w-8 h-8 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-white/20 hover:text-white transition-all" title="Add Custom Color">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                            <div className="w-32 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 gap-2 mb-4">
                                                <div className="w-4 h-4 rounded bg-blue-500" />
                                                <div className="h-2 w-16 bg-white/10 rounded" />
                                            </div>
                                            <h4 className="text-xs font-bold text-white mb-2">Interface Preview</h4>
                                            <p className="text-[10px] text-gray-500 px-8">Your branding choices will be applied globally to all team members.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'sessions' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Global Session Policy</h4>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Idle Session Timeout (Minutes)</label>
                                                    <input type="number" defaultValue="30" title="Session Timeout" placeholder="30" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Max Concurrent Sessions</label>
                                                    <input type="number" defaultValue="3" title="Max Sessions" placeholder="3" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                                </div>
                                            </div>
                                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-xs font-bold text-white mb-1">Automatic Session Invalidation</h5>
                                                        <p className="text-[10px] text-gray-500">Kill all active sessions when a user's password is changed.</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer" title="Auto-invalidation toggle">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked title="Toggle Invalidation" />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                                    <div>
                                                        <h5 className="text-xs font-bold text-red-400 mb-1 uppercase tracking-tight">Active Session Management</h5>
                                                        <p className="text-[10px] text-red-900/50 font-medium">This is a high-security action that affects all authenticated users.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowTermConfirm(true)}
                                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/10"
                                                    >
                                                        End All Sessions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Global Termination Confirmation */}
                                    {showTermConfirm && (
                                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                                            <div className="relative w-full max-w-sm bg-[#0A0C10] border border-white/10 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 mx-auto">
                                                    <ShieldAlert size={32} />
                                                </div>
                                                <h3 className="text-xl font-bold text-white text-center mb-2">Logout All Devices?</h3>
                                                <p className="text-gray-400 text-xs text-center mb-8 leading-relaxed">
                                                    You are about to invalidate <span className="text-white font-bold">all active authentication tokens</span> system-wide. All users will be immediately logged out and notified via email.
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setIsTerminating(true);
                                                            setTimeout(() => {
                                                                setIsTerminating(false);
                                                                setShowTermConfirm(false);
                                                                showToast('Global session invalidation complete. 127 users notified.', 'success');
                                                            }, 2000);
                                                        }}
                                                        disabled={isTerminating}
                                                        className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isTerminating ? (
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : 'Terminate All Sessions'}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowTermConfirm(false)}
                                                        className="w-full py-3.5 bg-white/5 text-gray-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                                                        disabled={isTerminating}
                                                    >
                                                        Cancel action
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeSection === 'ip_restrictions' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Allowed IP Ranges</h4>
                                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                                                Add IP / CIDR
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Corporate Office (SF)', range: '192.168.1.0/24' },
                                                { label: 'London Branch', range: '142.25.10.88' },
                                            ].map(ip => (
                                                <div key={ip.range} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div>
                                                        <span className="text-xs font-bold text-white block">{ip.label}</span>
                                                        <span className="text-[10px] font-mono text-gray-500">{ip.range}</span>
                                                    </div>
                                                    <button className="text-[10px] font-bold text-red-500/50 hover:text-red-400 transition-colors">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Integrations Sections --- */}
                            {activeSection === 'connected_services' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { name: 'Slack', status: 'Connected', icon: <MessageSquare size={20} className="text-[#4A154B]" /> },
                                            { name: 'Microsoft Teams', status: 'Inactive', icon: <Users size={20} className="text-[#6264A7]" /> },
                                            { name: 'Jira Software', status: 'Connected', icon: <HardDrive size={20} className="text-[#0052CC]" /> },
                                            { name: 'Splunk', status: 'Error', icon: <AlertTriangle size={20} className="text-red-400" /> },
                                            { name: 'Datadog', status: 'Inactive', icon: <Cloud size={20} className="text-purple-400" /> },
                                        ].map(service => (
                                            <div key={service.name} className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-all">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                        {service.icon}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${service.status === 'Connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        service.status === 'Error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                        }`}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                                <h5 className="text-sm font-bold text-white mb-1">{service.name}</h5>
                                                <p className="text-[11px] text-gray-500 mb-6 font-medium">Synchronization and alert routing.</p>
                                                <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                                    {service.status === 'Connected' ? 'Manage' : 'Configure'}
                                                </button>
                                            </div>
                                        ))}
                                        <button className="bg-[#0A0C10] border-2 border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-blue-500/30 transition-all cursor-pointer" title="Add Service">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                                                <Plus size={20} className="text-gray-600 group-hover:text-blue-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">Add Service</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'api_management' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Global API Access</h4>
                                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/40">
                                                <Plus size={14} /> Create New Secret
                                            </button>
                                        </div>
                                        <div className="overflow-hidden border border-white/5 rounded-xl">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                                    <tr>
                                                        <th className="px-6 py-4">Key Friendly Name</th>
                                                        <th className="px-6 py-4">Permissions</th>
                                                        <th className="px-6 py-4">Last Used</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {[
                                                        { name: 'CI/CD Deployment Key', scope: 'Write', last: '2h ago' },
                                                        { name: 'Analytics Reader', scope: 'Read-only', last: '5d ago' },
                                                        { name: 'Admin Backup Key', scope: 'Full Access', last: 'Never' },
                                                    ].map(key => (
                                                        <tr key={key.name} className="hover:bg-white/[0.02] transition-colors group text-[11px]">
                                                            <td className="px-6 py-4 font-bold text-white tracking-wide">{key.name}</td>
                                                            <td className="px-6 py-4 uppercase font-black tracking-widest text-[#8b949e]">{key.scope}</td>
                                                            <td className="px-6 py-4 font-mono text-gray-500">{key.last}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button className="font-bold text-red-500/50 hover:text-red-400 transition-colors px-3 py-1 bg-red-500/5 rounded-md">Revoke</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'webhooks' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">System Webhooks</h4>
                                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                                                Register Webhook
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { url: 'https://hooks.slack.com/services/T01ABC...', events: 'Policies, Agents', status: 'Active' },
                                                { url: 'https://datadog.hooks.com/v1/event...', events: 'System Metrics', status: 'Active' },
                                            ].map(hook => (
                                                <div key={hook.url} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[11px] font-mono text-blue-400 block mb-1">{hook.url}</span>
                                                        <span className="text-[10px] text-gray-500">Events: {hook.events}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{hook.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Notifications Sections --- */}
                            {activeSection === 'alert_rules' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Global Alert Routing</h4>
                                        <div className="space-y-4">
                                            {[
                                                { title: 'Critical Policy Violation', priority: 'High', target: 'Slack #security-alerts' },
                                                { title: 'System Latency Spike', priority: 'Medium', target: 'Email admin@ish-security.com' },
                                                { title: 'New Agent Registered', priority: 'Low', target: 'Dashboard Only' },
                                            ].map(rule => (
                                                <div key={rule.title} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                                                    <div className="flex gap-4">
                                                        <div className={`p-3 rounded-xl h-fit border ${rule.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                            rule.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                            }`}>
                                                            <ZapIcon size={18} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-bold text-white mb-1">{rule.title}</h5>
                                                            <p className="text-[11px] text-gray-500">Route to <span className="text-blue-400 border-b border-blue-500/30 font-mono tracking-tighter">{rule.target}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button className="p-2 text-gray-600 hover:text-white transition-colors" title="Settings">
                                                            <Sliders size={16} />
                                                        </button>
                                                        <div className="relative inline-flex items-center cursor-pointer scale-90" title="Toggle Alert Rule">
                                                            <input type="checkbox" className="sr-only peer" defaultChecked title="Toggle Rule" />
                                                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-4 bg-white/2 border border-dashed border-white/5 rounded-2xl text-[10px] font-black text-gray-600 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                                                + Define New Routing Rule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Data & Compliance Sections --- */}
                            {activeSection === 'data_retention' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Retention Policies</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Audit Log Retention</label>
                                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none" title="Audit Log Retention">
                                                        <option value="30">30 Days</option>
                                                        <option value="90">90 Days</option>
                                                        <option value="365" defaultValue="true">1 Year (Default)</option>
                                                        <option value="forever">Indefinite (SLA Required)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Metric Data Retention</label>
                                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none" title="Metric Data Retention">
                                                        <option value="7">7 Days</option>
                                                        <option value="30" defaultValue="true">30 Days</option>
                                                        <option value="90">90 Days</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                                                <div className="flex gap-3 mb-4">
                                                    <Info className="text-blue-400" size={18} />
                                                    <h5 className="text-xs font-bold text-white">Storage Utilization</h5>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-gray-400">Database Storage</span>
                                                        <span className="text-white">42.8 GB / 100 GB</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[42.8%]" />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Retention settings directly impact your monthly storage costs.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'audit_logs' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Audit Stream</h4>
                                            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2">
                                                <ExternalLink size={14} /> Export CSV
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { user: 'admin@ish.com', action: 'Modified Auth Policy', time: '12m ago', ip: '192.168.1.45' },
                                                { user: 'sys_bot', action: 'Purged Temporary Logs', time: '1h ago', ip: 'internal' },
                                                { user: 'manager_x', action: 'Revoked API Key', time: '3h ago', ip: '24.112.5.90' },
                                                { user: 'root', action: 'Enabled 2FA Enforcement', time: 'Yesterday', ip: '10.0.0.12' },
                                            ].map((log, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                            <UserPlus size={14} className="text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-white">{log.user}</span>
                                                                <span className="text-[10px] text-gray-500">•</span>
                                                                <span className="text-[10px] text-gray-400">{log.action}</span>
                                                            </div>
                                                            <span className="text-[9px] font-mono text-gray-600">{log.ip}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">{log.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Team & Access Sections --- */}
                            {activeSection === 'user_management' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Administrative Users</h4>
                                            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest">
                                                Add New Member
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { name: 'Sarah Connor', role: 'Security Admin', email: 'sarah@ish-security.com', img: 'SC' },
                                                { name: 'John Doe', role: 'Compliance Officer', email: 'john@ish-security.com', img: 'JD' },
                                                { name: 'Kyle Reese', role: 'Developer', email: 'kyle@ish-security.com', img: 'KR' },
                                                { name: 'System Automator', role: 'Service Account', email: 'bot@internal.ish', img: 'SA' },
                                            ].map(user => (
                                                <div key={user.email} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                                                            {user.img}
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-bold text-white mb-0.5">{user.name}</h5>
                                                            <p className="text-[10px] text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#8b949e] block mb-2">{user.role}</span>
                                                        <button className="text-[10px] font-bold text-gray-600 hover:text-white transition-colors">Edit Access</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'roles_permissions' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">RBAC Configuration</h4>
                                        <div className="space-y-4">
                                            {[
                                                { role: 'Account Owner', users: 1, color: 'text-purple-400' },
                                                { role: 'Admin', users: 4, color: 'text-blue-400' },
                                                { role: 'Auditor (Read-only)', users: 2, color: 'text-green-400' },
                                                { role: 'Deployment Agent', users: 12, color: 'text-orange-400' },
                                            ].map(role => (
                                                <div key={role.role} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                                                    <div>
                                                        <h5 className={`text-sm font-bold ${role.color} mb-1`}>{role.role}</h5>
                                                        <p className="text-[11px] text-gray-500">{role.users} Active Users assigned</p>
                                                    </div>
                                                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all">
                                                        Define Permissions
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Advanced Sections --- */}
                            {activeSection === 'feature_flags' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Experimental Features</h4>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Real-time Threat Graph', desc: 'Enable 3D visualization of incoming agent requests.', status: true },
                                                { label: 'AI Policy Assistant', desc: 'Natural language interface for rule generation.', status: false },
                                                { label: 'Multi-region Failover', desc: 'Automated cluster migration between AWS regions.', status: false },
                                            ].map(flag => (
                                                <div key={flag.label} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                                                    <div>
                                                        <h5 className="text-sm font-bold text-white mb-1">{flag.label}</h5>
                                                        <p className="text-[11px] text-gray-500">{flag.desc}</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer" title={`Toggle ${flag.label}`}>
                                                        <input type="checkbox" className="sr-only peer" defaultChecked={flag.status} title={flag.label} />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'dev_options' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Developer Toolset</h4>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Debug Level</label>
                                                <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none" title="Debug Level">
                                                    <option value="none">None (Production)</option>
                                                    <option value="info">Info</option>
                                                    <option value="debug" defaultValue="true">Debug</option>
                                                    <option value="trace">Trace (Verbose)</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                    <Terminal size={16} /> Open Web Console
                                                </button>
                                                <button className="flex-1 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
                                                    Purge All Caches
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'system_maintenance' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-8">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Database & Cluster Health</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                            {[
                                                { label: 'DB Connections', value: '142', status: 'Healthy' },
                                                { label: 'Cache Hit Rate', value: '98.2%', status: 'Healthy' },
                                                { label: 'Worker Load', value: '12%', status: 'Healthy' },
                                                { label: 'Search Latency', value: '45ms', status: 'Healthy' },
                                            ].map(stat => (
                                                <div key={stat.label} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">{stat.label}</span>
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-lg font-bold text-white">{stat.value}</span>
                                                        <span className="text-[9px] text-green-400 font-bold uppercase">{stat.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
                                                Rebuild Search Index
                                            </button>
                                            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
                                                Optimize Storage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section Placeholder for Others */}
                            {!['system_info', 'org_settings', 'branding', 'auth', 'sessions', 'ip_restrictions', 'connected_services', 'api_management', 'webhooks', 'alert_rules', 'data_retention', 'audit_logs', 'user_management', 'roles_permissions', 'feature_flags', 'dev_options', 'system_maintenance'].includes(activeSection) && (
                                <div className="flex flex-col items-center justify-center py-32 opacity-20 group">
                                    <Settings size={64} className="text-gray-500 mb-4 animate-spin-slow group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm font-bold tracking-widest uppercase">{activeSection.replace('_', ' ')} Coming Soon</span>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main >

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div >
    );
}
