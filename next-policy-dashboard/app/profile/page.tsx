"use client";

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useToast } from '../contexts/ToastContext';
import {
    User, Settings, Edit2, MapPin, Clock, Mail, Phone, Calendar,
    Shield, Activity, CreditCard, LayoutGrid, Plug, Camera, Globe,
    Briefcase, Sparkles, Users, Lock, Smartphone, Laptop, Monitor,
    AlertTriangle, CheckCircle, XCircle, XOctagon, Download, Trash2, HelpCircle,
    Key, LogOut, Eye, EyeOff, RefreshCw, AlertCircle,
    Moon, Sun, Volume2, Type, Bell, Command, Printer, RotateCcw,
    Accessibility, HardDrive, Database, Zap, Code, FlaskConical,
    Slack, Trello, MessageSquare, ExternalLink, Plus,
    Webhook, Terminal, BarChart3, Radio, Pause, Play, ShieldCheck, Upload,
    FileText, History, Receipt, X
} from 'lucide-react';
interface ActivityItem {
    id: string;
    type: 'login' | 'policy' | 'blocked' | 'resolved' | 'export';
    title: string;
    details: string;
    time: string;
}

interface LoginHistoryItem {
    id: string;
    date: string;
    loc: string;
    dev: string;
}

interface PasswordHistoryItem {
    id: string;
    date: string;
}

interface BackupMethod {
    id: string;
    type: 'sms' | 'email';
    value: string;
    verified: boolean;
}

interface UserProfile {
    name: string;
    displayName: string;
    role: string;
    department: string;
    company: string;
    location: string;
    timezone: string;
    email: string;
    phone: string;
    backupEmail: string;
    companySize: string;
    industry: string;
    workEmail: string;
    joined: string;
    lastLogin: string;
    completion: number;
    bio: string;
    skills: string[];
    specialties: string[];
    recentActivities: ActivityItem[];
    loginHistory: LoginHistoryItem[];
    passwordLastChanged: string;
    passwordHistory: PasswordHistoryItem[];
    securityScore: number;
    avatarUrl: string | null;
    settings: {
        twoFactorEnabled: boolean;
        twoFactorMethod: 'totp' | 'sms' | 'email';
        backupMethods: BackupMethod[];
        remainingBackupCodes: number;
        emailOnNewDevice: boolean;
        alertSuspicious: boolean;
        notifyPasswordChange: boolean;
        autoLogout: string;
        theme: 'light' | 'dark' | 'auto';
        accentColor: string;
        density: 'comfortable' | 'compact' | 'spacious';
        fontSize: number;
        reduceAnimations: boolean;
        highContrast: boolean;
        colorblindMode: boolean;
        language: string;
        dateFormat: string;
        timeFormat: string;
        notifications: {
            policyViolations: boolean;
            agentStatus: boolean;
            systemAlerts: boolean;
            weeklySummary: boolean;
            productUpdates: boolean;
            tipsTutorials: boolean;
            desktopNotifications: boolean;
            soundAlerts: boolean;
            badgeCounters: boolean;
            dndEnabled: boolean;
            dndStart: string;
            dndEnd: string;
            dndWeekends: boolean;
        };
        defaultView: string;
        currency: string;
        dashboardWidgets: {
            kpiCards: boolean;
            activityFeed: boolean;
            performanceChart: boolean;
            recentViolations: boolean;
            agentStatusGrid: boolean;
            analyticsPreview: boolean;
        };
        tablePreferences: {
            rowsPerPage: number;
            denseMode: boolean;
            stickyHeader: boolean;
        };
        chartPreferences: {
            timespan: string;
            showPoints: boolean;
            enableZoom: boolean;
        };
        shortcutsEnabled: boolean;
        shortcuts: {
            search: string;
            newPolicy: string;
            filter: string;
            settings: string;
            help: string;
        };
        timezone: string;
        autoTimezone: boolean;
        adjustDST: boolean;
        numberFormat: string;
        measurementUnit: string;
    };
}

export default function ProfilePage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
    const [recordingKey, setRecordingKey] = useState<string | null>(null);
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

    // Default User Data
    const defaultUser: UserProfile = {
        name: "Admin User",
        displayName: "adminuser",
        role: "Security Lead",
        department: "Security Department",
        company: "Clevora AI",
        location: "Tashkent, Uzbekistan",
        timezone: "GMT+5 (Asia/Tashkent)",
        email: "jamshidmuminov2607@gmail.com",
        phone: "+998 90 123-45-67",
        backupEmail: "backup@example.com",
        companySize: "51-200 employees",
        industry: "Artificial Intelligence",
        workEmail: "admin@clevora.ai",
        joined: "Jan 2026",
        lastLogin: "2 min ago",
        completion: 85,
        bio: "Experienced security professional lead with over 10 years in enterprise AI risk management and threat intelligence.",
        skills: ['AI Governance', 'Security', 'Compliance', 'Policy Management', 'Risk Assessment', 'Python', 'JavaScript', 'React'],
        specialties: ['AI Safety', 'Security Architecture', 'Compliance Automation'],
        recentActivities: [
            { id: '1', type: 'login', title: 'Login', details: 'From: Tashkent, UZ â€¢ Chrome on macOS', time: '2 min ago' },
            { id: '2', type: 'policy', title: 'Updated policy "Rate Limiter"', details: 'Changed threshold from 100 to 150', time: '1 hour ago' },
            { id: '3', type: 'blocked', title: 'Blocked Agent-12', details: 'Reason: Multiple policy violations', time: '3 hours ago' },
            { id: '4', type: 'resolved', title: 'Resolved violation #VIO-1234', details: 'Marked as false positive', time: '5 hours ago' },
            { id: '5', type: 'export', title: 'Exported analytics report', details: 'Date range: Last 7 days', time: 'Yesterday' },
            { id: '6', type: 'login', title: 'Login from new device', details: 'From: Tashkent, UZ â€¢ Safari on iPhone', time: 'Yesterday' },
        ] as ActivityItem[],
        loginHistory: [
            { id: '1', date: 'Jan 3, 14:30', loc: 'Tashkent, UZ', dev: 'Chrome/macOS' },
            { id: '2', date: 'Jan 3, 09:15', loc: 'Tashkent, UZ', dev: 'Chrome/macOS' },
            { id: '3', date: 'Jan 2, 17:45', loc: 'Tashkent, UZ', dev: 'Safari/iPhone' },
            { id: '4', date: 'Jan 2, 08:30', loc: 'Tashkent, UZ', dev: 'Chrome/macOS' },
            { id: '5', date: 'Jan 1, 16:20', loc: 'Tashkent, UZ', dev: 'Chrome/macOS' },
        ] as LoginHistoryItem[],
        passwordLastChanged: "15 days ago",
        passwordHistory: [
            { id: '1', date: 'Dec 19, 2025' },
            { id: '2', date: 'Oct 1, 2025' },
            { id: '3', date: 'Jul 15, 2025' },
        ],
        securityScore: 85,
        avatarUrl: null,
        settings: {
            twoFactorEnabled: true,
            twoFactorMethod: 'totp',
            backupMethods: [
                { id: '1', type: 'sms', value: '+998 90 ***-**-67', verified: true },
                { id: '2', type: 'email', value: 'jam***@gmail.com', verified: true },
            ],
            remainingBackupCodes: 5,
            emailOnNewDevice: true,
            alertSuspicious: true,
            notifyPasswordChange: true,
            autoLogout: "30 minutes",
            theme: 'dark',
            accentColor: 'blue',
            density: 'compact',
            fontSize: 14,
            reduceAnimations: false,
            highContrast: false,
            colorblindMode: false,
            language: "English (US)",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12-hour (2:30 PM)",
            notifications: {
                policyViolations: true,
                agentStatus: true,
                systemAlerts: true,
                weeklySummary: true,
                productUpdates: false,
                tipsTutorials: false,
                desktopNotifications: true,
                soundAlerts: true,
                badgeCounters: true,
                dndEnabled: true,
                dndStart: "10:00 PM",
                dndEnd: "08:00 AM",
                dndWeekends: true,
            },
            defaultView: "Dashboard",
            currency: "USD ($)",
            dashboardWidgets: {
                kpiCards: true,
                activityFeed: true,
                performanceChart: true,
                recentViolations: true,
                agentStatusGrid: true,
                analyticsPreview: false,
            },
            tablePreferences: {
                rowsPerPage: 25,
                denseMode: true,
                stickyHeader: true,
            },
            chartPreferences: {
                timespan: "Last 6 hours",
                showPoints: true,
                enableZoom: true,
            },
            shortcutsEnabled: true,
            shortcuts: {
                search: 'k',
                newPolicy: 'n',
                filter: 'f',
                settings: ',',
                help: '/'
            },
            timezone: "GMT+5 (Asia/Tashkent)",
            autoTimezone: true,
            adjustDST: true,
            numberFormat: "1,234.56",
            measurementUnit: "Metric (km, kg)",
        }
    };

    const [user, setUser] = useState<UserProfile>(defaultUser);

    // Load from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                const merged = { ...defaultUser, ...parsed };
                setUser(merged);
            } catch (e) {
                console.error('Failed to load profile', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Live Apply Appearance Settings
    useEffect(() => {
        if (!isLoaded || !user.settings) return;

        const root = document.documentElement;
        const s = user.settings;

        // Theme Application
        if (s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Accessibility Toggles
        if (s.reduceAnimations) root.classList.add('reduce-motion'); else root.classList.remove('reduce-motion');
        if (s.highContrast) root.classList.add('high-contrast'); else root.classList.remove('high-contrast');
        if (s.colorblindMode) root.classList.add('cb-deuteranopia'); else root.classList.remove('cb-deuteranopia');

        // Font Size Application to Root (for global scaling)
        root.style.fontSize = `${s.fontSize}px`;

        // Density Variable Mapping
        const densityMap = {
            compact: { padding: '1rem', gap: '1rem', card: '1rem', radius: '0.75rem' },
            comfortable: { padding: '2rem', gap: '1.5rem', card: '2rem', radius: '1.25rem' },
            spacious: { padding: '4rem', gap: '2.5rem', card: '3rem', radius: '2.5rem' }
        };
        const dm = densityMap[s.density || 'comfortable'];
        root.style.setProperty('--layout-padding', dm.padding);
        root.style.setProperty('--layout-gap', dm.gap);
        root.style.setProperty('--card-padding', dm.card);
        root.style.setProperty('--card-radius', dm.radius);

    }, [user.settings, isLoaded]);

    // Live Clock State
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatShortTime = (date: Date) => {
        if (!user.settings) return date.toLocaleTimeString();
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: user.settings.timeFormat?.includes('PM'),
            timeZone: user.settings.timezone?.includes('Asia/Tashkent') ? 'Asia/Tashkent' :
                user.settings.timezone?.includes('New_York') ? 'America/New_York' : 'UTC'
        };
        return date.toLocaleTimeString('en-US', options);
    };

    const formatShortDate = (dateStr: string) => {
        const date = dateStr === 'Just now' ? new Date() : new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const fmt = user.settings?.dateFormat;
        if (fmt === 'DD/MM/YYYY') return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        if (fmt === 'YYYY-MM-DD') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const convertPrice = (baseUSD: number) => {
        const cur = user.settings?.currency;
        if (cur?.includes('EUR')) return `â‚¬${(baseUSD * 0.92).toFixed(2)}`;
        if (cur?.includes('UZS')) return `${(baseUSD * 12500).toLocaleString()} UZS`;
        return `$${baseUSD.toFixed(2)}`;
    };

    // Global Keyboard Shortcuts Listener
    useEffect(() => {
        if (!user.settings?.shortcutsEnabled || isShortcutModalOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if Cmd/Ctrl is pressed (matching the UI hints)
            if (!(e.metaKey || e.ctrlKey)) return;

            const key = e.key.toLowerCase();
            const s = user.settings.shortcuts;

            if (key === s.search) { e.preventDefault(); showToast('Opening Global Search...', 'success'); }
            else if (key === s.newPolicy) { e.preventDefault(); showToast('Opening New Policy Creator...', 'success'); }
            else if (key === s.filter) { e.preventDefault(); showToast('Activating Filter...', 'success'); }
            else if (key === s.settings) { e.preventDefault(); showToast('Opening Quick Settings...', 'success'); }
            else if (key === s.help) { e.preventDefault(); showToast('Showing Shortcuts Help...', 'info'); }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user.settings, isShortcutModalOpen]);

    // Live Save to localStorage
    const updateUserData = (newData: UserProfile) => {
        setUser(newData);
        localStorage.setItem('userProfile', JSON.stringify(newData));
    };

    const handleChangePassword = () => {
        if (!passwords.next || passwords.next !== passwords.confirm) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        const newHistoryItem = { id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
        const updatedUser = {
            ...user,
            passwordLastChanged: "Just now",
            passwordHistory: [newHistoryItem, ...(user.passwordHistory || [])],
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: 'Password changed', details: 'Security update', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        };

        updateUserData(updatedUser);
        setIsPasswordModalOpen(false);
        setPasswords({ current: '', next: '', confirm: '' });
        showToast('Password updated successfully!', 'success');
    };

    const handleToggle2FA = () => {
        const newState = !user.settings?.twoFactorEnabled;
        updateUserData({
            ...user,
            settings: { ...user.settings, twoFactorEnabled: newState },
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: newState ? '2FA Enabled' : '2FA Disabled', details: `Method: ${user.settings?.twoFactorMethod}`, time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
        showToast(`2FA ${newState ? 'enabled' : 'disabled'} successfully!`, 'success');
    };

    const handleAddBackupMethod = () => {
        const type = confirm('Add SMS backup? (OK for SMS, Cancel for Email)') ? 'sms' : 'email';
        const val = prompt(`Enter backup ${type}:`);
        if (!val) return;

        const newMethod: BackupMethod = {
            id: Date.now().toString(),
            type,
            value: val,
            verified: true
        };

        updateUserData({
            ...user,
            settings: {
                ...user.settings,
                backupMethods: [...(user.settings?.backupMethods || []), newMethod]
            },
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: 'Backup method added', details: `${type}: ${val}`, time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
        showToast('Backup method added!', 'success');
    };

    const handleRemoveBackupMethod = (id: string) => {
        if (!confirm('Are you sure?')) return;
        updateUserData({
            ...user,
            settings: {
                ...user.settings,
                backupMethods: (user.settings?.backupMethods || []).filter(m => m.id !== id)
            }
        });
        showToast('Backup method removed', 'success');
    };

    const handleRegenerateCodes = () => {
        if (!confirm('Regenerate backup codes? Old codes will be invalidated.')) return;
        updateUserData({
            ...user,
            settings: { ...user.settings, remainingBackupCodes: 10 },
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: 'Backup codes regenerated', details: '10 new codes generated', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
        showToast('Backup codes regenerated!', 'success');
    };

    const handleEndAllSessions = () => {
        if (!confirm('Are you sure you want to end all other sessions?')) return;
        updateUserData({
            ...user,
            recentActivities: [
                { id: Date.now().toString(), type: 'blocked', title: 'All other sessions ended', details: 'Bulk security action', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
        showToast('All other sessions terminated', 'success');
    };

    const handleResendVerification = () => {
        showToast('Verification email sent to backup address!', 'success');
        updateUserData({
            ...user,
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: 'Verification email resent', details: 'Target: backup@example.com', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
    };

    const handleUpdateSecurityQuestions = () => {
        showToast('Security questions updated!', 'success');
        updateUserData({
            ...user,
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: 'Security questions updated', details: 'Refreshed 3 questions', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
    };

    const handleRecoveryCodesAction = (action: 'view' | 'download') => {
        showToast(`Recovery codes ${action === 'view' ? 'displayed' : 'downloaded'}!`, 'success');
        updateUserData({
            ...user,
            recentActivities: [
                { id: Date.now().toString(), type: 'policy', title: `Recovery codes ${action === 'view' ? 'viewed' : 'downloaded'}`, details: 'Security access alert', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
    };

    const handleDataExport = () => {
        showToast('Data export request received. You will receive an email shortly.', 'success');
        updateUserData({
            ...user,
            recentActivities: [
                { id: Date.now().toString(), type: 'export', title: 'Full data export requested', details: 'Archive generation in progress', time: 'Just now' },
                ...(user.recentActivities || [])
            ] as ActivityItem[]
        });
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you ABSOLUTELY sure? This action is permanent and will delete all your data, policies, and logs.')) {
            if (confirm('Final confirmation: You are about to permanently delete your account.')) {
                showToast('Account deletion initiated.', 'error');
                updateUserData({
                    ...user,
                    recentActivities: [
                        { id: Date.now().toString(), type: 'blocked', title: 'Account deletion requested', details: 'Permanent removal initiated', time: 'Just now' },
                        ...(user.recentActivities || [])
                    ] as ActivityItem[]
                });
            }
        }
    };

    const handleExportActivityCSV = () => {
        const headers = ['Type', 'Title', 'Details', 'Time'];
        const rows = (user.recentActivities || []).map(a => [a.type, a.title, a.details, a.time]);
        const csvContent = [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Activity log exported successfully!', 'success');
    };

    const handleExportLoginCSV = () => {
        const headers = ['Date', 'Device', 'Location'];
        const rows = (user.loginHistory || []).map(l => [l.date, l.dev, l.loc]);
        const csvContent = [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `login_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Login history exported successfully!', 'success');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <>
            <div
                className={`min-h-screen bg-[#0A0C10] text-gray-200 font-sans selection:bg-blue-500/30 transition-all duration-300
                ${user.settings?.density === 'compact' ? 'layout-compact' : user.settings?.density === 'spacious' ? 'layout-spacious' : 'layout-comfortable'}
            `}
                style={{
                    '--accent-primary': user.settings?.accentColor === 'gradient'
                        ? 'linear-gradient(to bottom right, #6366f1, #a855f7, #ec4899)'
                        : `var(--accent-${user.settings?.accentColor || 'blue'})`
                } as React.CSSProperties}
            >
                <Header stats={{ active_agents: 12 }} />

                <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

                    {/* --- Profile Header Card --- */}
                    <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden relative group">
                        {/* Background Banner (Optional, keeping it subtle) */}
                        <div className="h-32 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/5" />

                        <div className="px-8 pb-8">
                            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">

                                {/* Profile Photo */}
                                <div className="relative group/photo">
                                    <div className="w-32 h-32 rounded-2xl bg-[#0A0C10] p-1.5 border border-white/10 shadow-2xl">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-2 right-2 p-2 bg-black/80 text-white rounded-lg opacity-0 group-hover/photo:opacity-100 transition-all hover:bg-black border border-white/10" aria-label="Change profile photo" title="Change photo">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                {/* User Info & Actions */}
                                <div className="flex-1 w-full pt-14 md:pt-12">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <input
                                                    type="text"
                                                    value={user.name}
                                                    onChange={(e) => updateUserData({ ...user, name: e.target.value })}
                                                    className="text-3xl font-bold bg-transparent border border-transparent hover:border-white/10 rounded-lg px-2 text-white outline-none focus:border-blue-500/50 w-full md:w-80 transition-all"
                                                    aria-label="Profile Name"
                                                />
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={16} className="text-purple-400" />
                                                    <input
                                                        type="text"
                                                        value={user.role}
                                                        onChange={(e) => updateUserData({ ...user, role: e.target.value })}
                                                        className="text-sm bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-1 text-gray-300 focus:border-purple-500/50 outline-none transition-all"
                                                        placeholder="Role"
                                                        aria-label="Profile Role"
                                                    />
                                                </div>
                                                <span className="hidden md:inline text-gray-600">â€¢</span>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={16} className="text-blue-400" />
                                                    <input
                                                        type="text"
                                                        value={user.department}
                                                        onChange={(e) => updateUserData({ ...user, department: e.target.value })}
                                                        className="text-sm bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-1 text-gray-300 focus:border-blue-500/50 outline-none transition-all"
                                                        placeholder="Department"
                                                        aria-label="Profile Department"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LayoutGrid size={14} className="text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={user.company}
                                                    onChange={(e) => updateUserData({ ...user, company: e.target.value })}
                                                    className="text-xs bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-1 text-gray-500 focus:border-white/20 outline-none transition-all"
                                                    placeholder="Company"
                                                    aria-label="Profile Company"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Profile Settings" title="Settings">
                                                <Settings size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-8 text-sm text-gray-400 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin size={16} className="text-gray-500" />
                                            <input
                                                type="text"
                                                value={user.location}
                                                onChange={(e) => updateUserData({ ...user, location: e.target.value })}
                                                className="bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 outline-none focus:border-blue-500/50 flex-1 transition-all"
                                                aria-label="Profile Location"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Clock size={16} className="text-gray-500" />
                                            <select
                                                value={user.timezone}
                                                onChange={(e) => updateUserData({ ...user, timezone: e.target.value })}
                                                className="bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 outline-none focus:border-blue-500/50 flex-1 transition-all"
                                                aria-label="Profile Timezone"
                                            >
                                                <option>GMT+5 (Asia/Tashkent)</option>
                                                <option>GMT+0 (UTC)</option>
                                                <option>GMT-5 (America/New_York)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Mail size={16} className="text-gray-500" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                onChange={(e) => updateUserData({ ...user, email: e.target.value })}
                                                className="bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 outline-none focus:border-blue-500/50 flex-1 transition-all"
                                                aria-label="Profile Email"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Phone size={16} className="text-gray-500" />
                                            <input
                                                type="text"
                                                value={user.phone}
                                                onChange={(e) => updateUserData({ ...user, phone: e.target.value })}
                                                className="bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 outline-none focus:border-blue-500/50 flex-1 transition-all"
                                                aria-label="Profile Phone"
                                            />
                                        </div>
                                    </div>

                                    {/* Meta Footer */}
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 bg-[#0A0C10]/50 p-3 rounded-xl border border-white/5">
                                        <div className="flex gap-6">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Member since: <span className="text-gray-300">{user.joined}</span></span>
                                            <span className="flex items-center gap-1.5"><Activity size={14} /> Last login: <span className="text-gray-300">{user.lastLogin}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <span>Profile completion:</span>
                                            <div className="flex-1 sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[85%]" />
                                            </div>
                                            <span className="text-white font-bold">{user.completion}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-t border-white/5 bg-[#0A0C10]/30 px-8 overflow-x-auto custom-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- Overview Content --- */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column: Personal & Professional */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Personal Information */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><User size={20} className="text-blue-400" /> Personal Information</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={user.name}
                                                    onChange={(e) => updateUserData({ ...user, name: e.target.value })}
                                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-2 text-gray-200 outline-none focus:border-blue-500/50 transition-all"
                                                    aria-label="Full Name"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500 font-mono">@</span>
                                                    <input
                                                        type="text"
                                                        value={user.displayName}
                                                        onChange={(e) => updateUserData({ ...user, displayName: e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase() })}
                                                        className="w-full bg-[#0A0C10] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-gray-200 font-medium font-mono outline-none focus:border-blue-500/50 transition-all"
                                                        aria-label="Display Name"
                                                        placeholder="username"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    onChange={(e) => updateUserData({ ...user, email: e.target.value })}
                                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-2 text-gray-200 outline-none focus:border-blue-500/50 transition-all"
                                                    aria-label="Email Address"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={user.phone}
                                                    onChange={(e) => updateUserData({ ...user, phone: e.target.value })}
                                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-2 text-gray-200 outline-none focus:border-blue-500/50 transition-all"
                                                    aria-label="Phone Number"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Backup Email</label>
                                            <input
                                                type="email"
                                                value={user.backupEmail}
                                                onChange={(e) => updateUserData({ ...user, backupEmail: e.target.value })}
                                                className="w-full sm:w-1/2 bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-2 text-gray-200 outline-none focus:border-blue-500/50 transition-all"
                                                aria-label="Backup Email"
                                                placeholder="backup@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-purple-400" /> Professional Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Job Title</label>
                                            <input type="text" value={user.role} onChange={(e) => updateUserData({ ...user, role: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Job Title" placeholder="Security Lead" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Department</label>
                                            <input type="text" value={user.department} onChange={(e) => updateUserData({ ...user, department: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Department" placeholder="Security" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Organization</label>
                                            <input type="text" value={user.company} onChange={(e) => updateUserData({ ...user, company: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Organization" placeholder="Clevora AI" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Company Size</label>
                                            <input type="text" value={user.companySize} onChange={(e) => updateUserData({ ...user, companySize: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Company Size" placeholder="100-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Industry</label>
                                            <input type="text" value={user.industry} onChange={(e) => updateUserData({ ...user, industry: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Industry" placeholder="Technology" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Work Email</label>
                                            <input type="email" value={user.workEmail} onChange={(e) => updateUserData({ ...user, workEmail: e.target.value })} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Work Email" placeholder="admin@example.com" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio & About */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><User size={20} className="text-green-400" /> About Me</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                            <span>{user.bio.length} / 500 characters</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={user.bio}
                                        onChange={(e) => updateUserData({ ...user, bio: e.target.value.substring(0, 500) })}
                                        className="w-full h-32 bg-[#0A0C10] border border-white/10 rounded-xl p-4 text-sm text-gray-300 outline-none focus:border-blue-500/50 resize-none transition-all"
                                        placeholder="Write a brief bio about your role and experience..."
                                        aria-label="Profile Bio"
                                    />
                                    <div className="space-y-4 mt-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">Specialties</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(user.specialties || []).map((tag: string, index: number) => (
                                                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                                                    {tag}
                                                    <button
                                                        onClick={() => updateUserData({ ...user, specialties: (user.specialties || []).filter((_: string, i: number) => i !== index) })}
                                                        className="hover:text-red-400 transition-colors"
                                                        aria-label={`Remove specialty ${tag}`}
                                                        title={`Remove ${tag}`}
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder="+ Add specialty"
                                                className="bg-transparent border-none text-xs text-blue-400 outline-none w-24"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                        e.preventDefault();
                                                        const newVal = e.currentTarget.value.trim();
                                                        if (!(user.specialties || []).includes(newVal)) {
                                                            updateUserData({ ...user, specialties: [...(user.specialties || []), newVal] });
                                                        }
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                                aria-label="Add new specialty"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column: Skills, Location, Privacy */}
                            <div className="space-y-8">

                                {/* Skills */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles size={20} className="text-yellow-400" /> Skills</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(user.skills || []).map((skill: string, index: number) => (
                                            <div key={index} className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-medium">
                                                {skill}
                                                <button
                                                    onClick={() => updateUserData({ ...user, skills: (user.skills || []).filter((_: any, i: number) => i !== index) })}
                                                    className="ml-1 text-blue-500/50 hover:text-red-400 transition-colors"
                                                    aria-label={`Remove ${skill}`}
                                                    title={`Remove ${skill}`}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 w-full mt-4">
                                            <input
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newSkill.trim()) {
                                                        e.preventDefault();
                                                        if (!user.skills.includes(newSkill.trim())) {
                                                            updateUserData({ ...user, skills: [...user.skills, newSkill.trim()] });
                                                        }
                                                        setNewSkill('');
                                                    }
                                                }}
                                                placeholder="Add a skill..."
                                                className="flex-1 bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500/50"
                                                aria-label="New skill name"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newSkill.trim()) {
                                                        if (!user.skills.includes(newSkill.trim())) {
                                                            updateUserData({ ...user, skills: [...user.skills, newSkill.trim()] });
                                                        }
                                                        setNewSkill('');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/20 transition-all border border-white/5 font-bold"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Time */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><MapPin size={20} className="text-red-400" /> Location & Time</h3>
                                    </div>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <MapPin size={16} className="text-gray-500" />
                                            <input type="text" value={user.location} onChange={(e) => updateUserData({ ...user, location: e.target.value })} className="flex-1 bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Location" placeholder="Tashkent, Uzbekistan" />
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <Globe size={16} className="text-gray-500" />
                                            <input type="text" value={user.timezone} onChange={(e) => updateUserData({ ...user, timezone: e.target.value })} className="flex-1 bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-200 outline-none focus:border-blue-500/50" aria-label="Timezone" placeholder="GMT+5" />
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <Clock size={16} className="text-gray-500" />
                                            <span className="text-green-400 font-mono">14:32 PM</span> (Local Time)
                                        </div>
                                        {/* Availability Mocked for now */}
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <Briefcase size={16} className="text-gray-500" />
                                            9:00 AM - 6:00 PM
                                        </div>
                                    </div>
                                </div>

                                {/* Privacy Controls */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Lock size={20} className="text-gray-400" /> Privacy Controls</h3>

                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Who can see my profile?</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input type="radio" name="visibility" defaultChecked className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500" aria-label="Everyone in organization" />
                                                <span className="text-sm text-gray-300 flex items-center gap-2"><Globe size={14} /> Everyone in organization</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="radio" name="visibility" className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500" aria-label="My team only" />
                                                <span className="text-sm text-gray-300 flex items-center gap-2"><Users size={14} /> My team only</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="radio" name="visibility" className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500" aria-label="Only me (private)" />
                                                <span className="text-sm text-gray-300 flex items-center gap-2"><Lock size={14} /> Only me (private)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Field Visibility</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" aria-label="Email address" /><span className="text-xs text-gray-400">Email address</span></div>
                                            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" aria-label="Phone number" /><span className="text-xs text-gray-400">Phone number</span></div>
                                            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" aria-label="Job title & department" /><span className="text-xs text-gray-400">Job title & department</span></div>
                                            <div className="flex items-center gap-2"><input type="checkbox" className="rounded bg-white/5 border-white/10" aria-label="Social media links" /><span className="text-xs text-gray-400">Social media links</span></div>
                                            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" aria-label="Location & timezone" /><span className="text-xs text-gray-400">Location & timezone</span></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* --- Activity Content --- */}
                    {activeTab === 'activity' && (
                        <div className="space-y-8">

                            {/* Summary Stats */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Activity Summary <span className="text-gray-500 font-normal text-sm ml-2">Last 30 Days</span></h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Logins</div>
                                        <div className="text-2xl font-bold text-white">47</div>
                                    </div>
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Actions</div>
                                        <div className="text-2xl font-bold text-white">1,234</div>
                                    </div>
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Policies Created</div>
                                        <div className="text-2xl font-bold text-white">12</div>
                                    </div>
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Violations Reviewed</div>
                                        <div className="text-2xl font-bold text-white">28</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Feed (Left 2/3) */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">Recent Activity</h3>
                                            <div className="flex gap-2">
                                                <div className="flex bg-[#0A0C10] rounded-lg p-1 border border-white/5">
                                                    <button className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-md">All</button>
                                                    <button className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white transition-colors">Logins</button>
                                                    <button className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white transition-colors">Actions</button>
                                                </div>
                                                <button onClick={handleExportActivityCSV} className="text-xs font-bold text-gray-400 hover:text-white border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><Download size={12} /> Export</button>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                                            {(user.recentActivities || []).map((activity) => (
                                                <div key={activity.id} className="relative pl-14 group">
                                                    <div className={`absolute left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 
                                                    ${activity.type === 'login' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                                            activity.type === 'policy' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                                                activity.type === 'blocked' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                                                    activity.type === 'resolved' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                                                        'bg-purple-500/10 border border-purple-500/20 text-purple-400'}`}>
                                                        {activity.type === 'login' ? <Lock size={12} /> :
                                                            activity.type === 'policy' ? <Edit2 size={12} /> :
                                                                activity.type === 'blocked' ? <AlertTriangle size={12} /> :
                                                                    activity.type === 'resolved' ? <Shield size={12} /> :
                                                                        <Activity size={12} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <input
                                                                type="text"
                                                                value={activity.title}
                                                                onChange={(e) => updateUserData({
                                                                    ...user,
                                                                    recentActivities: user.recentActivities.map(a => a.id === activity.id ? { ...a, title: e.target.value } : a)
                                                                })}
                                                                className="bg-[#0A0C10] border border-white/10 rounded px-2 py-0.5 text-white font-medium text-sm outline-none focus:border-blue-500/50"
                                                                placeholder="Activity Title"
                                                                aria-label="Activity Title"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={activity.time}
                                                                    onChange={(e) => updateUserData({
                                                                        ...user,
                                                                        recentActivities: user.recentActivities.map(a => a.id === activity.id ? { ...a, time: e.target.value } : a)
                                                                    })}
                                                                    className="bg-[#0A0C10] border border-white/10 rounded px-2 py-0.5 text-gray-500 text-[10px] outline-none w-20"
                                                                    placeholder="Time"
                                                                    aria-label="Activity Time"
                                                                />
                                                                <button
                                                                    onClick={() => updateUserData({ ...user, recentActivities: user.recentActivities.filter(a => a.id !== activity.id) })}
                                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                                    aria-label="Delete activity"
                                                                    title="Delete activity"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={activity.details}
                                                            onChange={(e) => updateUserData({
                                                                ...user,
                                                                recentActivities: user.recentActivities.map(a => a.id === activity.id ? { ...a, details: e.target.value } : a)
                                                            })}
                                                            className="w-full mt-1 bg-[#0A0C10] border border-white/10 rounded px-2 py-0.5 text-gray-400 text-xs outline-none focus:border-blue-500/50"
                                                            placeholder="Activity Details"
                                                            aria-label="Activity Details"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-4">
                                            <button
                                                onClick={() => updateUserData({
                                                    ...user,
                                                    recentActivities: [
                                                        { id: Date.now().toString(), type: 'login', title: 'New Activity', details: 'Details here...', time: 'Just now' },
                                                        ...(user.recentActivities || [])
                                                    ]
                                                })}
                                                className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/20 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Add Activity Record
                                            </button>
                                            <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">Load more activity...</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column (Login History & Analytics) */}
                                <div className="space-y-8">
                                    {/* Login History */}
                                    <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-white">Login History</h3>
                                            <div className="flex gap-2">
                                                <button onClick={handleExportLoginCSV} className="text-xs text-blue-400 hover:text-blue-300">Export CSV</button>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-white/10 text-gray-500">
                                                        <th className="pb-2 font-bold">Date/Time</th>
                                                        <th className="pb-2 font-bold">Location</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {(user.loginHistory || []).map((login) => (
                                                        <tr key={login.id}>
                                                            <td className="py-2.5 text-gray-300">
                                                                <input
                                                                    type="text"
                                                                    value={login.date}
                                                                    onChange={(e) => updateUserData({
                                                                        ...user,
                                                                        loginHistory: user.loginHistory.map(l => l.id === login.id ? { ...l, date: e.target.value } : l)
                                                                    })}
                                                                    className="bg-[#0A0C10] border border-white/10 rounded px-2 py-0.5 text-xs text-white outline-none w-full"
                                                                    placeholder="Date"
                                                                    aria-label="Login Date"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={login.dev}
                                                                    onChange={(e) => updateUserData({
                                                                        ...user,
                                                                        loginHistory: user.loginHistory.map(l => l.id === login.id ? { ...l, dev: e.target.value } : l)
                                                                    })}
                                                                    className="mt-1 bg-[#0A0C10] border border-white/5 rounded px-2 py-0.5 text-[10px] text-gray-500 outline-none w-full"
                                                                    placeholder="Device"
                                                                    aria-label="Login Device"
                                                                />
                                                            </td>
                                                            <td className="py-2.5 text-gray-400">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={login.loc}
                                                                        onChange={(e) => updateUserData({
                                                                            ...user,
                                                                            loginHistory: user.loginHistory.map(l => l.id === login.id ? { ...l, loc: e.target.value } : l)
                                                                        })}
                                                                        className="bg-[#0A0C10] border border-white/5 rounded px-2 py-0.5 text-xs text-gray-400 outline-none w-full"
                                                                        placeholder="Location"
                                                                        aria-label="Login Location"
                                                                    />
                                                                    <button
                                                                        onClick={() => updateUserData({ ...user, loginHistory: user.loginHistory.filter(l => l.id !== login.id) })}
                                                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                                                        aria-label="Delete login record"
                                                                        title="Delete login record"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-4 flex flex-col items-center gap-4">
                                                <button
                                                    onClick={() => updateUserData({
                                                        ...user,
                                                        loginHistory: [
                                                            { id: Date.now().toString(), date: new Date().toLocaleString(), loc: 'Tashkent, UZ', dev: 'Chrome/macOS' },
                                                            ...(user.loginHistory || [])
                                                        ]
                                                    })}
                                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/20 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Plus size={14} /> Add Login Record
                                                </button>
                                                <button className="text-xs text-gray-500 hover:text-white">View all (47)</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analytics Placeholder (Heatmap) */}
                                    <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Activity Patterns</h3>
                                        <div className="h-32 bg-[#0A0C10] border border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-600 mb-4">
                                            [Chart: Heatmap]
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-gray-400"><span>Most active:</span> <span className="text-white">Weekdays 9-11 AM</span></div>
                                            <div className="flex justify-between text-gray-400"><span>Avg session:</span> <span className="text-white">3h 24m</span></div>
                                            <div className="flex justify-between text-gray-400"><span>Peak activity:</span> <span className="text-white">Tuesday, 10:30 AM</span></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}


                    {/* --- Security Content --- */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Security Overview</h3>
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-full md:w-1/3">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-gray-400 text-sm">Security Score</span>
                                            <span className="text-green-400 font-bold text-xl">{user.securityScore}/100 <span className="text-sm font-normal text-gray-500">{user.securityScore > 80 ? 'Strong' : 'Fair'}</span></span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500 w-[var(--score-width)]"
                                                style={{ '--score-width': `${Math.min(100, Math.max(0, user.securityScore))}%` } as React.CSSProperties}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-gray-300">Your account security is strong. Consider:</p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20 w-fit">
                                                <AlertTriangle size={14} /> Adding backup authentication method
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium bg-blue-400/10 px-3 py-2 rounded-lg border border-blue-400/20 w-fit">
                                                <Activity size={14} /> Reviewing active sessions
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Key size={20} className="text-yellow-400" /> Password Management</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400 text-xs uppercase font-bold">Current Password</span>
                                                <span className="text-gray-500 text-xs">Last changed: {user.passwordLastChanged}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl tracking-widest text-white">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</div>
                                                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 font-bold">Strong</span>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => setIsPasswordModalOpen(true)}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                                                >
                                                    Change password
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-yellow-100">Recommendation</h4>
                                                    <p className="text-xs text-yellow-400/80 mt-1">It's recommended to update your password every 90 days to maintain optimal security.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-xs uppercase font-bold block mb-3">Password History</span>
                                            <ul className="space-y-2 text-sm text-gray-500">
                                                {(user.passwordHistory || []).map(item => (
                                                    <li key={item.id} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-600" /> Changed on {item.date}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Smartphone size={20} className="text-blue-400" /> Two-Factor Authentication</h3>
                                        <button
                                            onClick={handleToggle2FA}
                                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${user.settings?.twoFactorEnabled ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
                                        >
                                            {user.settings?.twoFactorEnabled ? <><CheckCircle size={12} /> Enabled</> : <><XCircle size={12} /> Disabled</>}
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {user.settings?.twoFactorEnabled && (
                                            <div>
                                                <span className="text-gray-400 text-xs uppercase font-bold block mb-3 text-blue-400">Primary Method</span>
                                                <div className="flex items-center justify-between p-4 bg-[#0A0C10] border border-white/5 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                            <Lock size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium text-sm">
                                                                {user.settings?.twoFactorMethod === 'totp' && 'Authenticator App (TOTP)'}
                                                                {user.settings?.twoFactorMethod === 'sms' && 'SMS Authentication'}
                                                                {user.settings?.twoFactorMethod === 'email' && 'Email Authentication'}
                                                            </div>
                                                            <div className="text-gray-500 text-xs">Last used: 2 min ago</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="text-xs text-gray-400 hover:text-white underline">Reconfigure</button>
                                                        <button
                                                            onClick={() => updateUserData({ ...user, settings: { ...user.settings, twoFactorEnabled: false } })}
                                                            className="text-xs text-red-400 hover:text-red-300 underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-gray-400 text-xs uppercase font-bold">Backup Methods</span>
                                                {user.settings?.twoFactorEnabled && (
                                                    <button
                                                        onClick={handleAddBackupMethod}
                                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                                                    >
                                                        + Add Method
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(user.settings?.backupMethods || []).map(method => (
                                                    <div key={method.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-gray-400">
                                                                {method.type === 'sms' ? <Smartphone size={16} /> : <Mail size={16} />}
                                                            </div>
                                                            <div className="text-sm">
                                                                <div className="text-gray-200">{method.type === 'sms' ? 'SMS' : 'Email'}: {method.value}</div>
                                                                {method.verified && (
                                                                    <div className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={8} /> Verified</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRemoveBackupMethod(method.id)}
                                                                className="text-xs text-gray-400 hover:text-red-400"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {!user.settings?.twoFactorEnabled && (
                                                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                                                        <p className="text-xs text-blue-400/80">Enable Two-Factor Authentication to add backup methods.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Backup Codes</span>
                                                <span className="text-yellow-400 font-bold text-xs bg-yellow-400/10 px-2 py-0.5 rounded">
                                                    {user.settings?.remainingBackupCodes} remaining
                                                </span>
                                            </div>
                                            <div className="flex gap-3 mt-2">
                                                <button className="text-xs text-blue-400 hover:text-blue-300">View codes</button>
                                                <button
                                                    onClick={handleRegenerateCodes}
                                                    className="text-xs text-gray-400 hover:text-white"
                                                >
                                                    Regenerate codes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Sessions */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe size={20} className="text-purple-400" /> Active Sessions</h3>
                                        <button
                                            onClick={handleEndAllSessions}
                                            className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            End all sessions
                                        </button>
                                    </div>
                                    <div className="space-y-4">

                                        {/* Current Session */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-1.5 bg-green-500 text-black text-[10px] font-bold rounded-bl-lg">CURRENT</div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                                                    <Monitor size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm flex items-center gap-2">macOS â€¢ Chrome <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /></div>
                                                    <div className="text-gray-400 text-xs mt-0.5">Tashkent, UZ â€¢ 192.168.1.100</div>
                                                    <div className="text-green-400/70 text-[10px] mt-1 font-mono">Active now</div>
                                                </div>
                                            </div>
                                            <button className="mt-4 sm:mt-0 text-xs text-gray-500 cursor-not-allowed">Cannot end current session</button>
                                        </div>

                                        {/* Other Session 1 */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0A0C10] border border-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                                                    <Smartphone size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">iPhone â€¢ Safari</div>
                                                    <div className="text-gray-400 text-xs mt-0.5">Tashkent, UZ â€¢ 192.168.1.101</div>
                                                    <div className="text-gray-500 text-[10px] mt-1">Active: Yesterday</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to end this session?')) {
                                                        updateUserData({
                                                            ...user,
                                                            recentActivities: [{ id: Date.now().toString(), type: 'blocked', title: 'Session ended', details: 'Device: Remote Session', time: 'Just now' }, ...(user.recentActivities || [])]
                                                        });
                                                        showToast('Session terminated', 'success');
                                                    }
                                                }}
                                                className="mt-4 sm:mt-0 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-all"
                                            >
                                                End session
                                            </button>
                                        </div>

                                        {/* Other Session 2 */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0A0C10] border border-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                                                    <Laptop size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">Windows â€¢ Edge</div>
                                                    <div className="text-gray-400 text-xs mt-0.5">Tashkent, UZ â€¢ 192.168.1.102</div>
                                                    <div className="text-gray-500 text-[10px] mt-1">Active: 3 days ago</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to end this session?')) {
                                                        updateUserData({
                                                            ...user,
                                                            recentActivities: [{ id: Date.now().toString(), type: 'blocked', title: 'Session ended', details: 'Device: Remote Session', time: 'Just now' }, ...(user.recentActivities || [])]
                                                        });
                                                        showToast('Session terminated', 'success');
                                                    }
                                                }}
                                                className="mt-4 sm:mt-0 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-all"
                                            >
                                                End session
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                {/* Security Alerts */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><AlertCircle size={20} className="text-red-400" /> Security Alerts</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <CheckCircle size={16} className="text-green-400 mt-1 shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">Successful login from new device</div>
                                                <div className="text-xs text-gray-500">Jan 2, 17:45 â€¢ Safari on iPhone</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">You confirmed this was you</div>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-white/5" />
                                        <div className="flex gap-3">
                                            <Activity size={16} className="text-yellow-400 mt-1 shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">Password change requested</div>
                                                <div className="text-xs text-gray-500">Dec 19, 09:30 â€¢ Completed</div>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-white/5" />
                                        <div className="flex gap-3">
                                            <CheckCircle size={16} className="text-green-400 mt-1 shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">2FA enabled</div>
                                                <div className="text-xs text-gray-500">Dec 1, 14:20</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-2">
                                            <button className="text-xs font-bold text-gray-500 hover:text-white">View all security events</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Recovery */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><HelpCircle size={20} className="text-blue-400" /> Account Recovery</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2">
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">Backup Email</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">backup@example.com <AlertTriangle size={10} className="text-yellow-400" /> Pending verification</div>
                                            </div>
                                            <button onClick={handleResendVerification} className="text-xs text-blue-400 hover:text-blue-300">Resend verification</button>
                                        </div>
                                        <div className="w-full h-px bg-white/5" />
                                        <div className="flex justify-between items-center py-2">
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">Security Questions</div>
                                                <div className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Configured (3)</div>
                                            </div>
                                            <button onClick={handleUpdateSecurityQuestions} className="text-xs text-gray-400 hover:text-white">Update</button>
                                        </div>
                                        <div className="w-full h-px bg-white/5" />
                                        <div className="flex justify-between items-center py-2">
                                            <div>
                                                <div className="text-sm text-gray-200 font-medium">Recovery Codes</div>
                                                <div className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Generated</div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleRecoveryCodesAction('view')} className="text-xs text-gray-400 hover:text-white">View</button>
                                                <button onClick={() => handleRecoveryCodesAction('download')} className="text-xs text-gray-400 hover:text-white">Download</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced & Data Privacy (Full Width) */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-gray-400" /> Advanced Security</h3>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.emailOnNewDevice}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, emailOnNewDevice: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 transition-all text-blue-500"
                                                />
                                                <span className="text-sm text-gray-300">Email me on new device logins</span>
                                            </label>
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.alertSuspicious}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, alertSuspicious: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 transition-all text-blue-500"
                                                />
                                                <span className="text-sm text-gray-300">Alert on suspicious activity</span>
                                            </label>
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.notifyPasswordChange}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, notifyPasswordChange: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 transition-all text-blue-500"
                                                />
                                                <span className="text-sm text-gray-300">Notify on password changes</span>
                                            </label>
                                            <div className="pt-4 mt-2 border-t border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-400">Auto-logout after inactivity</span>
                                                    <select
                                                        value={user.settings?.autoLogout}
                                                        onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, autoLogout: e.target.value } })}
                                                        className="bg-[#0A0C10] border border-white/10 rounded-lg text-xs text-white px-2 py-1 outline-none focus:border-blue-500/50"
                                                        aria-label="Auto-logout duration"
                                                    >
                                                        <option>30 minutes</option>
                                                        <option>1 hour</option>
                                                        <option>4 hours</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><XOctagon size={20} className="text-red-400" /> Data & Privacy</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm text-gray-200 font-medium">Download Your Data</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3">Request a copy of all your data (policies, logs, profile).</p>
                                                <button
                                                    onClick={handleDataExport}
                                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Download size={14} /> Request data export
                                                </button>
                                            </div>
                                            <div className="pt-4 border-t border-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm text-red-400 font-medium">Delete Account</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all data. This action cannot be undone.</p>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete account...
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Preferences Content --- */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Appearance */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><LayoutGrid size={20} className="text-purple-400" /> Appearance</h3>
                                    <div className="space-y-6">

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    onClick={() => updateUserData({ ...user, settings: { ...user.settings, theme: 'light' } })}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${user.settings?.theme === 'light' ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    <Sun size={20} />
                                                    <span className={`text-xs ${user.settings?.theme === 'light' ? 'font-bold' : 'font-medium'}`}>Light</span>
                                                </button>
                                                <button
                                                    onClick={() => updateUserData({ ...user, settings: { ...user.settings, theme: 'dark' } })}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${user.settings?.theme === 'dark' ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    <Moon size={20} />
                                                    <span className={`text-xs ${user.settings?.theme === 'dark' ? 'font-bold' : 'font-medium'}`}>Dark</span>
                                                </button>
                                                <button
                                                    onClick={() => updateUserData({ ...user, settings: { ...user.settings, theme: 'auto' } })}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${user.settings?.theme === 'auto' ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    <Monitor size={20} />
                                                    <span className={`text-xs ${user.settings?.theme === 'auto' ? 'font-bold' : 'font-medium'}`}>Auto</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Accent Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {['blue', 'purple', 'green', 'red', 'orange', 'pink', 'teal'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => updateUserData({ ...user, settings: { ...user.settings, accentColor: color } })}
                                                        className={`w-8 h-8 rounded-full bg-${color}-500 border-2 ${user.settings?.accentColor === color ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent'} hover:scale-110 transition-transform`}
                                                        aria-label={`Select ${color} accent`}
                                                        title={`${color.charAt(0).toUpperCase() + color.slice(1)}`}
                                                    />
                                                ))}
                                                <button
                                                    onClick={() => updateUserData({ ...user, settings: { ...user.settings, accentColor: 'gradient' } })}
                                                    className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-2 ${user.settings?.accentColor === 'gradient' ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/20'} hover:scale-110 transition-transform`}
                                                    aria-label="Custom accent"
                                                    title="Custom Gradient"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Density</label>
                                                <div className="space-y-2">
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.density === 'comfortable' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="density"
                                                            checked={user.settings?.density === 'comfortable'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, density: 'comfortable' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
                                                        />
                                                        Comfortable
                                                    </label>
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.density === 'compact' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="density"
                                                            checked={user.settings?.density === 'compact'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, density: 'compact' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
                                                        />
                                                        Compact
                                                    </label>
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.density === 'spacious' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="density"
                                                            checked={user.settings?.density === 'spacious'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, density: 'spacious' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
                                                        />
                                                        Spacious
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Font Size</label>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Type size={14} />
                                                    <input
                                                        type="range"
                                                        min="12"
                                                        max="18"
                                                        step="2"
                                                        value={user.settings?.fontSize}
                                                        onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, fontSize: parseInt(e.target.value) } })}
                                                        className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                        aria-label="Font size"
                                                    />
                                                    <Type size={20} />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                                                    <span>Small</span><span>Default</span><span>Large</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-white/5">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.reduceAnimations}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, reduceAnimations: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 text-blue-500 transition-all"
                                                />
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Reduce animations</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.highContrast}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, highContrast: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 text-blue-500 transition-all"
                                                />
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">High contrast mode</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={user.settings?.colorblindMode}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, colorblindMode: e.target.checked } })}
                                                    className="rounded bg-white/5 border-white/10 text-blue-500 transition-all"
                                                />
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Colorblind mode (Deuteranopia)</span>
                                            </label>
                                        </div>

                                    </div>
                                </div>

                                {/* Language & Region */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Globe size={20} className="text-blue-400" /> Language & Region</h3>
                                    <div className="space-y-6">

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Language</label>
                                            <select
                                                value={user.settings?.language}
                                                onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, language: e.target.value } })}
                                                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                aria-label="Select Language"
                                            >
                                                <option>English (US)</option>
                                                <option>Uzbek (Latin)</option>
                                                <option>Russian</option>
                                                <option>Spanish</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Date Format</label>
                                                <div className="space-y-2">
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.dateFormat === 'MM/DD/YYYY' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="dateFormat"
                                                            checked={user.settings?.dateFormat === 'MM/DD/YYYY'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, dateFormat: 'MM/DD/YYYY' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500"
                                                        />
                                                        MM/DD/YYYY
                                                    </label>
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.dateFormat === 'DD/MM/YYYY' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="dateFormat"
                                                            checked={user.settings?.dateFormat === 'DD/MM/YYYY'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, dateFormat: 'DD/MM/YYYY' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500"
                                                        />
                                                        DD/MM/YYYY
                                                    </label>
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.dateFormat === 'YYYY-MM-DD' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="dateFormat"
                                                            checked={user.settings?.dateFormat === 'YYYY-MM-DD'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, dateFormat: 'YYYY-MM-DD' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500"
                                                        />
                                                        YYYY-MM-DD
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Time Format</label>
                                                <div className="space-y-2">
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.timeFormat === '12-hour (2:30 PM)' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="timeFormat"
                                                            checked={user.settings?.timeFormat === '12-hour (2:30 PM)'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, timeFormat: '12-hour (2:30 PM)' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500"
                                                        />
                                                        12-hour (2:30 PM)
                                                    </label>
                                                    <label className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${user.settings?.timeFormat === '24-hour (14:30)' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                                        <input
                                                            type="radio"
                                                            name="timeFormat"
                                                            checked={user.settings?.timeFormat === '24-hour (14:30)'}
                                                            onChange={() => updateUserData({ ...user, settings: { ...user.settings, timeFormat: '24-hour (14:30)' } })}
                                                            className="bg-white/5 border-white/10 text-blue-500"
                                                        />
                                                        24-hour (14:30)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Timezone</label>
                                            <select
                                                value={user.settings?.timezone}
                                                onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, timezone: e.target.value } })}
                                                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 mb-2"
                                                aria-label="Select Timezone"
                                            >
                                                <option>GMT+5 (Asia/Tashkent)</option>
                                                <option>GMT+0 (UTC)</option>
                                                <option>GMT-5 (America/New_York)</option>
                                            </select>
                                            <div className="flex items-center gap-2 text-xs text-blue-400 mb-3 font-medium">
                                                <Clock size={12} /> Local time: {formatShortTime(currentTime)}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.autoTimezone}
                                                        onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, autoTimezone: e.target.checked } })}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500"
                                                    /> Automatically detect timezone
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.adjustDST}
                                                        onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, adjustDST: e.target.checked } })}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500"
                                                    /> Adjust for daylight saving time
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Number Format</label>
                                                <select
                                                    value={user.settings?.numberFormat}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, numberFormat: e.target.value } })}
                                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-blue-500/50"
                                                    aria-label="Select Number Format"
                                                >
                                                    <option>1,234.56</option>
                                                    <option>1.234,56</option>
                                                    <option>1 234,56</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Measurement</label>
                                                <select
                                                    value={user.settings?.measurementUnit}
                                                    onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, measurementUnit: e.target.value } })}
                                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-blue-500/50"
                                                    aria-label="Select Measurement Unit"
                                                >
                                                    <option>Metric (km, kg)</option>
                                                    <option>Imperial (mi, lb)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Currency</label>
                                            <select
                                                value={user.settings?.currency}
                                                onChange={(e) => updateUserData({ ...user, settings: { ...user.settings, currency: e.target.value } })}
                                                className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                aria-label="Select Currency"
                                            >
                                                <option>USD ($)</option>
                                                <option>EUR (â‚¬)</option>
                                                <option>UZS (so'm)</option>
                                            </select>
                                        </div>

                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Bell size={20} className="text-yellow-400" /> Notification Preferences</h3>
                                    <div className="space-y-6">

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Email Notifications</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.policyViolations}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), policyViolations: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Policy violation alerts enabled' : 'Policy violation alerts disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Policy violations</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.agentStatus}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), agentStatus: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Agent status alerts enabled' : 'Agent status alerts disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Agent status changes</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.systemAlerts}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), systemAlerts: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'System alerts enabled' : 'System alerts disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">System alerts</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.weeklySummary}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), weeklySummary: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Weekly summary subscribed' : 'Weekly summary unsubscribed', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Weekly summary</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.productUpdates}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), productUpdates: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Product update notifications enabled' : 'Product update notifications disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Product updates</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.tipsTutorials}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), tipsTutorials: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Tips and tutorials enabled' : 'Tips and tutorials disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Tips & tutorials</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">In-App Notifications</label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.desktopNotifications}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), desktopNotifications: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Desktop notifications enabled' : 'Desktop notifications disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Desktop notifications</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.soundAlerts}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), soundAlerts: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Sound alerts enabled' : 'Sound alerts disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Sound alerts</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.notifications?.badgeCounters}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), badgeCounters: e.target.checked } as any } });
                                                            showToast(e.target.checked ? 'Badge counters enabled' : 'Badge counters disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="group-hover:text-white transition-colors">Badge counters</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className={`p-5 rounded-2xl border transition-all duration-300 ${user.settings?.notifications?.dndEnabled ? 'bg-[#0A0C10] border-blue-500/20' : 'bg-white/5 border-transparent opacity-60'}`}>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg transition-colors ${user.settings?.notifications?.dndEnabled ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-gray-500'}`}>
                                                            <Moon size={16} />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Do Not Disturb</label>
                                                            <p className="text-[10px] text-gray-500">Silence all notifications during specific hours</p>
                                                        </div>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            aria-label="Toggle Do Not Disturb mode"
                                                            checked={user.settings?.notifications?.dndEnabled}
                                                            onChange={(e) => {
                                                                const newState = e.target.checked;
                                                                updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), dndEnabled: newState } as any } });
                                                                showToast(newState ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled', newState ? 'info' : 'warning');
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                                    </div>
                                                </div>

                                                <div className={`flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-white/5 transition-all ${user.settings?.notifications?.dndEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-sm text-gray-300 min-w-[100px]">Quiet hours:</span>
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={user.settings?.notifications?.dndStart}
                                                                onChange={(e) => {
                                                                    updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), dndStart: e.target.value } as any } });
                                                                    showToast('DND start time updated', 'success');
                                                                }}
                                                                className="bg-[#0A0C10] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500/50 outline-none"
                                                                aria-label="Start time"
                                                                title="Select when Do Not Disturb mode should begin"
                                                            >
                                                                {['08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'].map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                            <span className="text-gray-600">to</span>
                                                            <select
                                                                value={user.settings?.notifications?.dndEnd}
                                                                onChange={(e) => {
                                                                    updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), dndEnd: e.target.value } as any } });
                                                                    showToast('DND end time updated', 'success');
                                                                }}
                                                                className="bg-[#0A0C10] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500/50 outline-none"
                                                                aria-label="End time"
                                                                title="Select when Do Not Disturb mode should end"
                                                            >
                                                                {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM'].map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <label className={`flex items-center gap-3 cursor-pointer group transition-all ${user.settings?.notifications?.dndEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                                    <div className="relative inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.settings?.notifications?.dndWeekends}
                                                            onChange={(e) => {
                                                                updateUserData({ ...user, settings: { ...user.settings, notifications: { ...(user.settings?.notifications || {}), dndWeekends: e.target.checked } as any } });
                                                                showToast(e.target.checked ? 'Weekend DND enabled' : 'Weekend DND disabled', 'info');
                                                            }}
                                                            className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-0 focus:ring-offset-0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Enable on weekends</span>
                                                        <p className="text-[10px] text-gray-500">Keep quiet hours active during Saturday and Sunday</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Dashboard Customization */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><LayoutGrid size={20} className="text-green-400" /> Dashboard Customization</h3>
                                    <div className="space-y-6">

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Default View</label>
                                            <select
                                                value={user.settings?.defaultView}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateUserData({ ...user, settings: { ...user.settings, defaultView: val } });
                                                    showToast(`Default view set to ${val}`, 'info');
                                                }}
                                                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50"
                                                aria-label="Select Default View"
                                                title="Select the page to show by default when you log in"
                                            >
                                                <option>Dashboard</option>
                                                <option>Policies</option>
                                                <option>Agents</option>
                                                <option>Violations</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Widgets to Display</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.kpiCards}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, kpiCards: e.target.checked } } });
                                                            showToast(e.target.checked ? 'KPI Cards enabled' : 'KPI Cards hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">KPI Cards</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.activityFeed}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, activityFeed: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Activity feed enabled' : 'Activity feed hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Live Activity Feed</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.performanceChart}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, performanceChart: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Performance chart enabled' : 'Performance chart hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Performance Chart</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.recentViolations}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, recentViolations: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Recent violations enabled' : 'Recent violations hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Recent Violations</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.agentStatusGrid}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, agentStatusGrid: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Agent status grid enabled' : 'Agent status grid hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Agent Status Grid</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.dashboardWidgets?.analyticsPreview}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, dashboardWidgets: { ...user.settings.dashboardWidgets, analyticsPreview: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Analytics preview enabled' : 'Analytics preview hidden', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Analytics Preview</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Table Preferences</label>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm text-gray-300">
                                                    <span>Rows per page</span>
                                                    <select
                                                        value={user.settings?.tablePreferences?.rowsPerPage}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            updateUserData({ ...user, settings: { ...user.settings, tablePreferences: { ...user.settings.tablePreferences, rowsPerPage: val } } });
                                                            showToast(`Tables will now show ${val} rows`, 'info');
                                                        }}
                                                        className="bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500/50 focus:ring-green-500/20"
                                                        aria-label="Rows per page"
                                                        title="Select how many records to show per page in tables"
                                                    >
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>
                                                </div>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.tablePreferences?.denseMode}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, tablePreferences: { ...user.settings.tablePreferences, denseMode: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Dense mode enabled' : 'Standard table spacing enabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Dense mode (compact rows)</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.settings?.tablePreferences?.stickyHeader}
                                                        onChange={(e) => {
                                                            updateUserData({ ...user, settings: { ...user.settings, tablePreferences: { ...user.settings.tablePreferences, stickyHeader: e.target.checked } } });
                                                            showToast(e.target.checked ? 'Sticky headers enabled' : 'Sticky headers disabled', 'info');
                                                        }}
                                                        className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                    /> <span className="group-hover:text-white transition-colors">Sticky header</span>
                                                </label>

                                                <div className="pt-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Chart Preferences</label>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center text-sm text-gray-300">
                                                            <span>Default timespan</span>
                                                            <select
                                                                value={user.settings?.chartPreferences?.timespan}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    updateUserData({ ...user, settings: { ...user.settings, chartPreferences: { ...user.settings.chartPreferences, timespan: val } } });
                                                                    showToast(`Chart timespan set to ${val}`, 'info');
                                                                }}
                                                                className="bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500/50 focus:ring-green-500/20"
                                                                aria-label="Default timespan"
                                                                title="Select the default time range for data charts"
                                                            >
                                                                <option>Last 6 hours</option>
                                                                <option>Last 24 hours</option>
                                                                <option>Last 7 days</option>
                                                            </select>
                                                        </div>
                                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={user.settings?.chartPreferences?.showPoints}
                                                                onChange={(e) => {
                                                                    updateUserData({ ...user, settings: { ...user.settings, chartPreferences: { ...user.settings.chartPreferences, showPoints: e.target.checked } } });
                                                                    showToast(e.target.checked ? 'Chart data points enabled' : 'Chart data points hidden', 'info');
                                                                }}
                                                                className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                            /> <span className="group-hover:text-white transition-colors">Show data points</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={user.settings?.chartPreferences?.enableZoom}
                                                                onChange={(e) => {
                                                                    updateUserData({ ...user, settings: { ...user.settings, chartPreferences: { ...user.settings.chartPreferences, enableZoom: e.target.checked } } });
                                                                    showToast(e.target.checked ? 'Chart zooming enabled' : 'Chart zooming disabled', 'info');
                                                                }}
                                                                className="rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500/20"
                                                            /> <span className="group-hover:text-white transition-colors">Enable zooming</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Keyboard Shortcuts */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Command size={20} className="text-gray-400" /> Keyboard Shortcuts</h3>
                                        <label className={`flex items-center gap-2 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors ${user.settings?.shortcutsEnabled ? 'text-green-400' : 'text-gray-500 opacity-50'}`}>
                                            <input
                                                type="checkbox"
                                                checked={user.settings?.shortcutsEnabled}
                                                onChange={(e) => {
                                                    const newState = e.target.checked;
                                                    updateUserData({ ...user, settings: { ...user.settings, shortcutsEnabled: newState } });
                                                    showToast(newState ? 'Keyboard shortcuts enabled' : 'Keyboard shortcuts disabled', newState ? 'success' : 'warning');
                                                }}
                                                className="rounded bg-green-500 border-green-500 text-green-500 focus:ring-green-500"
                                            />
                                            {user.settings?.shortcutsEnabled ? 'Enabled' : 'Disabled'}
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Global search</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">âŒ˜</kbd> <span className="text-gray-500">+</span> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-blue-400 font-bold font-mono uppercase">{user.settings?.shortcuts?.search}</kbd></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Create new policy</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">âŒ˜</kbd> <span className="text-gray-500">+</span> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-blue-400 font-bold font-mono uppercase">{user.settings?.shortcuts?.newPolicy}</kbd></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Filter current view</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">âŒ˜</kbd> <span className="text-gray-500">+</span> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-blue-400 font-bold font-mono uppercase">{user.settings?.shortcuts?.filter}</kbd></span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Open settings</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">âŒ˜</kbd> <span className="text-gray-500">+</span> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-blue-400 font-bold font-mono uppercase">{user.settings?.shortcuts?.settings}</kbd></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Show shortcuts help</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">âŒ˜</kbd> <span className="text-gray-500">+</span> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-blue-400 font-bold font-mono uppercase">{user.settings?.shortcuts?.help}</kbd></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Close modal/dialog</span>
                                                <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">Esc</kbd>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Navigate lists</span>
                                                <span className="flex items-center gap-1"><kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">â†‘</kbd> <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">â†“</kbd></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Select/activate</span>
                                                <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">Enter</kbd>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Toggle checkbox</span>
                                                <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 font-mono">Space</kbd>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-white/5 flex gap-4">
                                        <button
                                            onClick={() => setIsShortcutModalOpen(true)}
                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-colors"
                                        >
                                            Customize shortcuts
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateUserData({ ...user, settings: { ...user.settings, shortcuts: defaultUser.settings.shortcuts } });
                                                showToast('Shortcuts reset to defaults', 'success');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <RotateCcw size={14} /> Reset to defaults
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.print();
                                                showToast('Preparing cheat sheet for print...', 'info');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
                                        >
                                            <Printer size={14} /> Print cheat sheet
                                        </button>
                                    </div>
                                </div>

                                {/* Accessibility */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Accessibility size={20} className="text-blue-400" /> Accessibility Options</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">General</label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Screen reader optimization</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Focus indicators</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Reduce motion</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">High contrast mode</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Larger click targets</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Underline all links</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Text-to-Speech</label>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Enable text-to-speech</span>
                                                </label>
                                                <div>
                                                    <select
                                                        className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                                        aria-label="Select text-to-speech voice"
                                                        title="Choose the voice for system announcements"
                                                    >
                                                        <option>Default (System)</option>
                                                        <option>Natural (Female)</option>
                                                        <option>Natural (Male)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Speed: 1.0x</label>
                                                    <input
                                                        type="range"
                                                        min="0.5"
                                                        max="2"
                                                        step="0.1"
                                                        defaultValue="1"
                                                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                        aria-label="Speech speed"
                                                        title="Adjust the speed of text-to-speech"
                                                    />
                                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                        <span>0.5x</span>
                                                        <span>2.0x</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Color Blindness</label>
                                            <div className="space-y-4">
                                                <div>
                                                    <select
                                                        className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                                        aria-label="Color blindness mode"
                                                        title="Select a color filter to improve visibility"
                                                    >
                                                        <option>None</option>
                                                        <option>Protanopia (Red-Blind)</option>
                                                        <option>Deuteranopia (Green-Blind)</option>
                                                        <option>Tritanopia (Blue-Blind)</option>
                                                        <option>Monochromacy</option>
                                                    </select>
                                                </div>
                                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                                    <div className="flex h-4 gap-1 mb-2 rounded overflow-hidden">
                                                        <div className="flex-1 bg-red-500" />
                                                        <div className="flex-1 bg-green-500" />
                                                        <div className="flex-1 bg-blue-500" />
                                                        <div className="flex-1 bg-yellow-500" />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 text-center">Preview</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Data & Storage */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><HardDrive size={20} className="text-orange-400" /> Data Management</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Storage Usage</label>
                                                <span className="text-sm font-bold text-white">4.1 GB / 5 GB (82%)</span>
                                            </div>
                                            <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-6 flex">
                                                <div className="h-full bg-blue-500 w-[68%]" title="Tasks & Evaluations" />
                                                <div className="h-full bg-purple-500 w-[7%]" title="Policies" />
                                                <div className="h-full bg-orange-500 w-[20%]" title="Audit Logs" />
                                                <div className="h-full bg-green-500 w-[5%]" title="Media" />
                                            </div>

                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Breakdown</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                    <span className="text-gray-400 whitespace-nowrap">Tasks & Evaluations:</span>
                                                    <span className="text-white font-medium ml-auto">2.8 GB (68%)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                                    <span className="text-gray-400 whitespace-nowrap">Policies:</span>
                                                    <span className="text-white font-medium ml-auto">0.3 GB (7%)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                                    <span className="text-gray-400 whitespace-nowrap">Audit Logs:</span>
                                                    <span className="text-white font-medium ml-auto">0.8 GB (20%)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                    <span className="text-gray-400 whitespace-nowrap">Media:</span>
                                                    <span className="text-white font-medium ml-auto">0.2 GB (5%)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Data Retention</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Keep detailed data for:</label>
                                                        <select
                                                            className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                                            aria-label="Retention for detailed data"
                                                            title="Select how long to keep granular data logs"
                                                        >
                                                            <option>30 days</option>
                                                            <option>60 days</option>
                                                            <option>90 days</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Keep aggregated data for:</label>
                                                        <select
                                                            className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                                            aria-label="Retention for aggregated data"
                                                            title="Select how long to keep historical summary data"
                                                        >
                                                            <option>90 days</option>
                                                            <option>6 months</option>
                                                            <option>1 year</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Auto-delete old data</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Compress historical data</span>
                                                </label>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors">Clean up storage now</button>
                                                <button className="flex-1 px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors">Upgrade storage (50 GB)</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Advanced Settings */}
                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-purple-400" /> Advanced Settings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3 flex items-center gap-2"><Zap size={14} /> Performance</label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Enable hardware acceleration</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" defaultChecked className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Prefetch data for faster loading</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Limit background processes</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3 flex items-center gap-2"><Code size={14} /> Developer Options</label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Show debug information</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Enable verbose logging</span>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                    <span className="text-sm text-gray-300">Display API response times</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3 flex items-center gap-2"><FlaskConical size={14} /> Experimental Features</label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                            <span className="text-sm text-gray-300">AI-powered insights</span>
                                                            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 rounded border border-purple-500/20">BETA</span>
                                                        </div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                            <span className="text-sm text-gray-300">Advanced analytics</span>
                                                            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 rounded border border-purple-500/20">BETA</span>
                                                        </div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                                                            <span className="text-sm text-gray-300">Voice commands</span>
                                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 rounded border border-blue-500/20">ALPHA</span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors">
                                            <RotateCcw size={14} /> Reset all preferences to defaults
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Integrations Content --- */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Plug size={24} className="text-blue-400" /> Connected Integrations
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                    {/* Slack */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                                                <Slack size={32} className="text-[#4A154B]" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold">
                                                <CheckCircle size={10} /> CONNECTED
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">Slack</h4>
                                        <p className="text-xs text-gray-500 mb-4 flex-1">Send violation alerts and system notifications to #security channel.</p>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Channel:</span>
                                                <span className="text-blue-400 font-mono">#security</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Last sync:</span>
                                                <span className="text-gray-400">2 min ago</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors">Configure</button>
                                            <button className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors">Disconnect</button>
                                        </div>
                                    </div>

                                    {/* Jira */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                                                <Trello size={32} className="text-[#0052CC]" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold">
                                                <CheckCircle size={10} /> CONNECTED
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">Jira</h4>
                                        <p className="text-xs text-gray-500 mb-4 flex-1">Automatically create tracked tickets for high-priority policy violations.</p>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Project:</span>
                                                <span className="text-blue-400 font-mono">SEC-PROJECT</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Default Assignee:</span>
                                                <span className="text-gray-400">@security-on-call</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors">Configure</button>
                                            <button className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors">Disconnect</button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:bg-red-500/10 transition-colors">
                                                <Mail size={32} className="text-red-400" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold">
                                                <CheckCircle size={10} /> CONNECTED
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">Email</h4>
                                        <p className="text-xs text-gray-500 mb-4 flex-1">Configure SMTP relay for sending system-generated emails and reports.</p>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">SMTP Server:</span>
                                                <span className="text-gray-400 font-mono">smtp.gmail.com</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Port:</span>
                                                <span className="text-gray-400">587 (TLS)</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors">Configure</button>
                                            <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors">Test connection</button>
                                        </div>
                                    </div>

                                    {/* Add More */}
                                    <button className="border-2 border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                            <Plus size={24} className="text-gray-500 group-hover:text-blue-400" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Add Integration</div>
                                            <div className="text-[10px] text-gray-600">Browse marketplace</div>
                                        </div>
                                    </button>

                                </div>
                            </div>

                            {/* Available Integrations */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Sparkles size={24} className="text-yellow-400" /> Available Integrations
                                    </h3>
                                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">Browse all</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                    {/* PagerDuty */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:bg-red-500/10 transition-colors">
                                            <Radio size={24} className="text-red-500" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">PagerDuty</h4>
                                        <p className="text-[10px] text-gray-500 mb-6 flex-1">Incident management, alerting and on-call scheduling.</p>
                                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-white hover:bg-white/10 transition-colors">Connect</button>
                                    </div>

                                    {/* Splunk */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:bg-emerald-500/10 transition-colors">
                                            <BarChart3 size={24} className="text-emerald-500" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">Splunk</h4>
                                        <p className="text-[10px] text-gray-500 mb-6 flex-1">Export system logs and evaluation history to your SIEM.</p>
                                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-white hover:bg-white/10 transition-colors">Connect</button>
                                    </div>

                                    {/* Custom Webhooks */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:bg-blue-500/10 transition-colors">
                                            <Webhook size={24} className="text-blue-500" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">Custom Webhooks</h4>
                                        <p className="text-[10px] text-gray-500 mb-6 flex-1">Send event data to any external HTTPS endpoint.</p>
                                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-white hover:bg-white/10 transition-colors">Configure</button>
                                    </div>

                                    {/* REST API */}
                                    <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:bg-purple-500/10 transition-colors">
                                            <Terminal size={24} className="text-purple-500" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">REST API</h4>
                                        <p className="text-[10px] text-gray-500 mb-6 flex-1">Programmatic access to all system features and data.</p>
                                        <button className="w-full py-2 bg-purple-600 border border-purple-600 rounded-lg text-[11px] font-bold text-white hover:bg-purple-700 transition-colors">Generate API key</button>
                                    </div>

                                </div>
                            </div>

                            {/* API Access */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Key size={24} className="text-purple-400" /> API Access
                                    </h3>
                                    <button className="text-xs font-bold text-white px-4 py-2 bg-purple-600 rounded-lg border border-purple-500 hover:bg-purple-700 transition-all flex items-center gap-2">
                                        <Plus size={16} /> Generate new key
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Key List */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { name: 'Production Key', status: 'Active', key: 'sk_live_***************************xyz', created: 'Dec 1, 2025', lastUsed: '2 hours ago' },
                                            { name: 'Development Key', status: 'Active', key: 'sk_test_***************************abc', created: 'Jan 1, 2026', lastUsed: 'Yesterday' },
                                        ].map((apiKey, i) => (
                                            <div key={i} className="bg-[#0A0C10] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-white">{apiKey.name}</h4>
                                                            <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 rounded border border-green-500/20 font-bold uppercase tracking-wider">Active</span>
                                                        </div>
                                                        <code className="text-[11px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{apiKey.key}</code>
                                                        <div className="flex gap-4 text-[10px] text-gray-600 pt-1">
                                                            <span>Created: {apiKey.created}</span>
                                                            <span>Last used: {apiKey.lastUsed}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Reveal key"><Eye size={14} /></button>
                                                        <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Rotate key"><RefreshCw size={14} /></button>
                                                        <button className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors" title="Delete key"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Webhooks */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Webhook size={24} className="text-blue-400" /> Webhooks
                                    </h3>
                                    <button className="text-xs font-bold text-white px-4 py-2 bg-blue-600 rounded-lg border border-blue-500 hover:bg-blue-700 transition-all flex items-center gap-2">
                                        <Plus size={16} /> Add webhook
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { name: 'Production Webhook', status: 'Active', url: 'https://api.example.com/webhooks', events: 'violations, alerts', lastTriggered: '15 min ago (200 OK)', successRate: '99.8%', deliveries: '2,456 / 2,461' },
                                        { name: 'Staging Webhook', status: 'Paused', url: 'https://staging.example.com/hooks', events: 'all', lastTriggered: '-', successRate: '-', deliveries: '-' },
                                    ].map((webhook, i) => (
                                        <div key={i} className="bg-[#0A0C10] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-sm font-bold text-white">{webhook.name}</h4>
                                                        <span className={`text-[10px] px-1.5 rounded border font-bold uppercase tracking-wider flex items-center gap-1 ${webhook.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                            {webhook.status === 'Active' ? <CheckCircle size={10} /> : <Pause size={10} />}
                                                            {webhook.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded truncate">{webhook.url}</span>
                                                        <button className="text-gray-600 hover:text-white transition-colors" aria-label="Open URL" title="Open URL"><ExternalLink size={12} /></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] text-gray-600 uppercase font-bold">Events</div>
                                                            <div className="text-xs text-gray-300 font-mono">{webhook.events}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] text-gray-600 uppercase font-bold">Last Triggered</div>
                                                            <div className="text-xs text-gray-300">{webhook.lastTriggered}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Billing Content --- */}
                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-1">
                                            <Sparkles size={24} className="text-yellow-400" /> Professional Plan
                                        </h3>
                                        <p className="text-sm text-gray-400 font-medium">Advanced security features for proactive monitoring.</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white tracking-tight">{convertPrice(49)}<span className="text-sm text-gray-500 font-normal">/month</span></div>
                                        <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 mt-1">Next bill: {formatShortDate('Feb 1, 2026')}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-[#0A0C10]/50 p-6 rounded-2xl border border-white/5">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Highlights</h4>
                                        <ul className="space-y-3">
                                            {[
                                                'Unlimited policies & audit logs',
                                                'Up to 50 active agents per team',
                                                '90-day comprehensive retention',
                                                'Priority support & API access',
                                                'Advanced anomaly detection'
                                            ].map(feature => (
                                                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                                    <CheckCircle size={14} className="text-blue-500 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resource Usage</h4>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400">Agent Capacity</span>
                                                <span className="text-white">18 / 50 <span className="text-gray-500 font-normal ml-1">36%</span></span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[36%]" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400">Cloud Storage</span>
                                                <span className="text-white">4.1 GB / 50 GB <span className="text-gray-500 font-normal ml-1">8.2%</span></span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[8.2%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-6 py-2.5 bg-blue-600 border border-blue-500 rounded-lg text-xs font-bold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center gap-2">
                                        ðŸš€ Upgrade Plan
                                    </button>
                                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                                        View recent invoice
                                    </button>
                                    <button className="ml-auto text-xs font-bold text-gray-600 hover:text-red-400 transition-colors">
                                        Cancel platform subscription
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                    <CreditCard size={20} className="text-purple-400" /> Payment Method
                                </h3>

                                <div className="bg-gradient-to-br from-[#1c2128] to-[#0A0C10] border border-white/10 rounded-2xl p-6 relative overflow-hidden group mb-6">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                        <CreditCard size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-12 h-8 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                                                <span className="text-[10px] font-black text-white italic">VISA</span>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">Default</div>
                                        </div>
                                        <div className="text-lg font-mono text-white mb-1 tracking-wider">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 1234</div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Expires 12/2027</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Jamshid Muminov</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-blue-600/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-2">
                                        Update Details
                                    </button>
                                    <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-blue-600/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-2">
                                        <Plus size={14} /> Add New Method
                                    </button>
                                    <button className="w-full py-2 text-xs font-bold text-gray-600 hover:text-red-400 transition-colors">
                                        Remove Card
                                    </button>
                                </div>
                            </div>

                            {/* Billing History */}
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                        <History size={20} className="text-blue-400" /> Billing History
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2">
                                            <Download size={14} /> Download Bulk PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-hidden border border-white/5 rounded-xl bg-[#0A0C10]/30 shadow-2xl">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <th className="text-left px-6 py-4">Billing Date</th>
                                                <th className="text-left px-6 py-4">Plan Category</th>
                                                <th className="text-left px-6 py-4">Total Amount</th>
                                                <th className="text-left px-6 py-4">Payment Status</th>
                                                <th className="text-right px-6 py-4">Document</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                { date: 'Jan 1, 2026', plan: 'Professional Monthly', amount: '$49.00', status: 'Paid' },
                                                { date: 'Dec 1, 2025', plan: 'Professional Monthly', amount: '$49.00', status: 'Paid' },
                                                { date: 'Nov 1, 2025', plan: 'Professional Monthly', amount: '$49.00', status: 'Paid' },
                                                { date: 'Oct 1, 2025', plan: 'Professional Monthly', amount: '$49.00', status: 'Paid' },
                                            ].map((invoice, i) => (
                                                <tr key={i} className="hover:bg-white/[0.05] transition-all duration-300 group cursor-default">
                                                    <td className="px-6 py-5 text-sm font-medium text-gray-300">{invoice.date}</td>
                                                    <td className="px-6 py-5 text-xs text-gray-400">{invoice.plan}</td>
                                                    <td className="px-6 py-5 text-sm font-black text-white">{invoice.amount}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 text-[9px] font-black uppercase tracking-widest">
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all" title="Download Invoice">
                                                            <FileText size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button className="w-full mt-6 py-4 bg-white/2 border border-white/5 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                                    View Full Billing Records
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Password Change Modal */}
                    {isPasswordModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
                            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Key className="text-yellow-400" /> Change Password</h3>
                                    <button
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label="Close modal"
                                        title="Close"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.next}
                                            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                                            className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        className="flex-1 px-4 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main >
            </div >
        </>
    );
}
