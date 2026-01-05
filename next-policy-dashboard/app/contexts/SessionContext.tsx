"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, LogOut, ShieldAlert } from 'lucide-react';

interface SessionContextType {
    logout: () => void;
    extendSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Configuration
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD = 60 * 1000;    // 60 seconds

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const lastActivityRef = useRef<number>(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(() => {
        // Clear all timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        // Log to console for debugging
        console.log("Session expired. Logging out...");

        // Redirect to logout page
        router.push('/logout');
    }, [router]);

    const extendSession = useCallback(() => {
        lastActivityRef.current = Date.now();
        setIsWarningVisible(false);
        setTimeLeft(60);

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        // Restart the inactivity timer
        startInactivityTimer();
    }, []);

    const startInactivityTimer = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

        // Schedule the warning
        warningTimerRef.current = setTimeout(() => {
            setIsWarningVisible(true);

            // Start the countdown
            countdownRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        logout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, INACTIVITY_LIMIT - WARNING_THRESHOLD);
    }, [logout]);

    useEffect(() => {
        // Track activities
        const handleActivity = () => {
            // Only extend if we aren't already in warning state
            if (!isWarningVisible) {
                lastActivityRef.current = Date.now();
                startInactivityTimer();
            }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        // Initial timer start
        startInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [startInactivityTimer, isWarningVisible]);

    return (
        <SessionContext.Provider value={{ logout, extendSession }}>
            {children}

            {/* Inactivity Warning Modal */}
            {isWarningVisible && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0A0C10]/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm bg-[#161b22] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 animate-pulse" />

                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
                            <Clock size={32} />
                        </div>

                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-xl font-bold text-white tracking-tight">Session Expiring</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                You have been inactive for a while. For your security, you will be logged out in:
                            </p>
                            <div className="text-4xl font-black text-yellow-500 font-mono tracking-tighter">
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={extendSession}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ShieldAlert size={18} />
                                Stay Logged In
                            </button>
                            <button
                                onClick={logout}
                                className="w-full py-3.5 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Log Out Now
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <AlertTriangle size={12} className="text-yellow-500/50" />
                            Security Protocol Active
                        </div>
                    </div>
                </div>
            )}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
