import React from 'react';
import { User, Bell, LogOut } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

import AuthModal from './AuthModal';

interface HeaderProps {
    stats: any;
}

export default function Header({ stats }: HeaderProps) {
    const { showToast } = useToast();
    const activeAgents = stats?.active_agents || 0;
    const router = require('next/navigation').useRouter();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [hasUnread, setHasUnread] = React.useState(true);
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    // Mock notifications for now (or could pull from context)
    const notifications = [
        { id: 1, text: 'System Update Completed', time: '2m ago', type: 'info' },
        { id: 2, text: 'High Traffic Warning', time: '15m ago', type: 'warning' },
        { id: 3, text: 'Agent Alpha started', time: '1h ago', type: 'success' }
    ];

    const handleNotificationClick = (n: any) => {
        showToast(`Clicked: ${n.text}`, 'info');
        setShowNotifications(false);
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            // Simulated state clearing
            setShowLogoutConfirm(false);
            setIsLoggingOut(false);
            router.push('/logout');
        }, 1000);
    };

    return (
        <>
            <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#0A0C10]/50 backdrop-blur-md sticky top-0 z-20">
                {/* Breadcrumb / Context */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-gray-400 border border-white/5">PROD-ENV-01</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => router.push('/')}
                            className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            Dashboard
                        </button>
                    </nav>

                    {activeAgents > 0 && (
                        <span className="px-2 py-1 rounded bg-green-500/10 text-[10px] font-mono text-green-400 border border-green-500/20 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {activeAgents} AGENTS ACTIVE
                        </span>
                    )}
                </div>

                {/* User / Settings */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Notifications"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0A0C10]" />}
                        </button>

                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-[#0A0C10] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-white uppercase">Notifications</h3>
                                    <button onClick={() => setHasUnread(false)} className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors">Mark all read</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    n.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>{n.type}</span>
                                                <span className="text-[10px] text-gray-500">{n.time}</span>
                                            </div>
                                            <div className="text-sm text-gray-300">{n.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="relative z-40">
                        <div
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-colors ${showUserMenu ? 'bg-white/5' : 'hover:bg-white/5'}`}
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white">Admin User</div>
                                <div className="text-[10px] text-gray-500">Security Lead</div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-[#0A0C10] rounded-[7px] flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                            </div>
                        </div>

                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#0A0C10] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button onClick={() => { setShowUserMenu(false); router.push('/profile'); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Profile</button>
                                    <button onClick={() => { setShowUserMenu(false); router.push('/settings'); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Settings</button>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-bold">Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm bg-[#0A0C10] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                            <LogOut size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">End Session?</h3>
                        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                            Are you sure you want to log out? Any unsaved changes may be lost.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-white/5 text-gray-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
