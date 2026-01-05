'use client';

import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
    isConnected: boolean;
    isLoading?: boolean;
}

export default function ConnectionStatus({
    isConnected,
    isLoading = false,
}: ConnectionStatusProps) {
    if (isLoading) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-medium text-yellow-400">
                <Loader2 size={12} className="animate-spin" />
                Connecting...
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-medium text-green-400">
                <Wifi size={12} />
                Connected
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-xs font-medium text-red-400">
            <WifiOff size={12} />
            Disconnected
        </div>
    );
}
