"use client";

import React from 'react';
import Link from 'next/link';
import { LogOut, Home, KeyRound, ShieldCheck } from 'lucide-react';

export default function LogoutPage() {
    return (
        <div className="min-h-screen bg-[#0A0C10] text-gray-200 font-sans flex items-center justify-center p-6 selection:bg-blue-500/30">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Visual Indicator */}
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-3xl border border-blue-500/20 flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-300">
                        <LogOut size={40} className="text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-4 border-[#0A0C10]">
                        <ShieldCheck size={14} />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Logged Out</h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Your session has ended securely. You have been disconnected from the Clevora AI Policy System.
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left flex items-start gap-4">
                    <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                        <ShieldCheck size={18} className="text-green-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Session Terminated</h4>
                        <p className="text-xs text-gray-500">Local credentials and cookies have been cleared from this browser.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Home size={18} />
                        Go to Home
                    </Link>
                    <button
                        onClick={() => window.location.href = '/?login=true'}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <KeyRound size={18} />
                        Login Again
                    </button>
                </div>

                {/* Footer Tip */}
                <p className="text-[11px] text-gray-600 italic">
                    For enhanced security, close all browser windows after logging out.
                </p>
            </div>
        </div>
    );
}
