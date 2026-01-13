'use client';

import React, { useState, useMemo } from 'react';
import {
    Crosshair,
    Play,
    Square,
    AlertTriangle,
    Activity,
    Shield,
    Zap,
    TrendingUp,
    Clock,
    Target,
    Skull,
    Ban,
    ChevronRight
} from 'lucide-react';
import { useAnalytics } from '@/app/contexts/AnalyticsContext';

interface AttackSimulationPanelProps {
    height?: number;
}

const ATTACK_TYPES = [
    {
        id: 'DDOS',
        label: 'DDoS Attack',
        description: 'Distributed denial of service simulation',
        icon: Zap,
        color: 'text-red-400',
        bg: 'bg-red-500/10'
    },
    {
        id: 'SQL_INJECTION',
        label: 'SQL Injection',
        description: 'Database attack vector simulation',
        icon: Target,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10'
    },
    {
        id: 'PII_EXFIL',
        label: 'PII Exfiltration',
        description: 'Personal data extraction attempt',
        icon: Skull,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10'
    },
    {
        id: 'RATE_ABUSE',
        label: 'Rate Limit Abuse',
        description: 'API rate limit evasion tactics',
        icon: TrendingUp,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10'
    },
    {
        id: 'PAYLOAD_BOMB',
        label: 'Payload Bomb',
        description: 'Oversized request payload attack',
        icon: AlertTriangle,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10'
    }
];

const INTENSITY_LEVELS = [
    { id: 'LOW', label: 'Low', multiplier: 1, color: 'bg-green-500' },
    { id: 'MEDIUM', label: 'Medium', multiplier: 2, color: 'bg-yellow-500' },
    { id: 'HIGH', label: 'High', multiplier: 5, color: 'bg-orange-500' },
    { id: 'EXTREME', label: 'Extreme', multiplier: 10, color: 'bg-red-500' }
];

export default function AttackSimulationPanel({ height = 400 }: AttackSimulationPanelProps) {
    const { attackVectors, injectAttackVector, stopAttack, systemHealth } = useAnalytics();
    const [selectedType, setSelectedType] = useState<string>(ATTACK_TYPES[0].id);
    const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('MEDIUM');
    const [showHistory, setShowHistory] = useState(false);

    const activeAttacks = attackVectors.active;
    const attackHistory = attackVectors.history;

    const handleStartAttack = () => {
        injectAttackVector(selectedType, intensity);
    };

    const handleStopAttack = (id: string) => {
        stopAttack(id);
    };

    const formatDuration = (startedAt: number) => {
        const duration = Math.floor((Date.now() - startedAt) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        return `${mins}m ${secs}s`;
    };

    const selectedAttack = ATTACK_TYPES.find(a => a.id === selectedType)!;
    const SelectedIcon = selectedAttack.icon;

    return (
        <div
            className="bg-slate-900/50 backdrop-blur-xl rounded-lg p-6 border border-slate-800 flex flex-col"
            style={{ minHeight: height }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-red-400" />
                        Attack Simulation
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Test your defenses with simulated attack patterns
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Active Attack Count */}
                    <div className={`px-3 py-1.5 rounded-lg font-mono text-sm flex items-center gap-2 ${activeAttacks.length > 0
                            ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                        <Activity className={`w-4 h-4 ${activeAttacks.length > 0 ? 'animate-pulse' : ''}`} />
                        {activeAttacks.length} Active
                    </div>

                    {/* System Health */}
                    <div className={`px-3 py-1.5 rounded-lg font-mono text-sm flex items-center gap-2 ${systemHealth.overallScore > 80 ? 'bg-green-500/20 text-green-400' :
                            systemHealth.overallScore > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        <Shield className="w-4 h-4" />
                        {systemHealth.overallScore}%
                    </div>
                </div>
            </div>

            {/* Attack Configuration */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Attack Type Selection */}
                <div>
                    <label className="text-xs text-slate-400 mb-2 block font-mono">Attack Type</label>
                    <div className="space-y-2">
                        {ATTACK_TYPES.map((attack) => {
                            const Icon = attack.icon;
                            return (
                                <button
                                    key={attack.id}
                                    onClick={() => setSelectedType(attack.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedType === attack.id
                                            ? `${attack.bg} border-white/20`
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${attack.color}`} />
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${selectedType === attack.id ? attack.color : 'text-white'
                                            }`}>
                                            {attack.label}
                                        </div>
                                        <div className="text-xs text-slate-500">{attack.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Intensity & Launch */}
                <div className="flex flex-col">
                    <label className="text-xs text-slate-400 mb-2 block font-mono">Intensity Level</label>

                    {/* Intensity Slider */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-3">
                            {INTENSITY_LEVELS.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => setIntensity(level.id as any)}
                                    className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${intensity === level.id
                                            ? `${level.color} text-white`
                                            : 'bg-slate-700 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>

                        {/* Visual Intensity Bar */}
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${INTENSITY_LEVELS.find(l => l.id === intensity)?.color
                                    }`}
                                style={{
                                    width: `${(INTENSITY_LEVELS.findIndex(l => l.id === intensity) + 1) * 25}%`
                                }}
                            />
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            Multiplier: {INTENSITY_LEVELS.find(l => l.id === intensity)?.multiplier}x base rate
                        </p>
                    </div>

                    {/* Launch Button */}
                    <button
                        onClick={handleStartAttack}
                        disabled={activeAttacks.length >= 3}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-mono font-bold text-sm transition-all ${activeAttacks.length >= 3
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
                            }`}
                    >
                        <Play className="w-5 h-5" />
                        Launch {selectedAttack.label}
                    </button>

                    {activeAttacks.length >= 3 && (
                        <p className="text-xs text-yellow-400 mt-2 text-center">
                            Maximum 3 concurrent attacks allowed
                        </p>
                    )}

                    {/* Preview */}
                    <div className={`mt-4 p-4 rounded-lg border ${selectedAttack.bg} border-white/10`}>
                        <div className="flex items-center gap-2 mb-2">
                            <SelectedIcon className={`w-4 h-4 ${selectedAttack.color}`} />
                            <span className="text-sm text-white font-mono">{selectedAttack.label}</span>
                        </div>
                        <p className="text-xs text-slate-400">{selectedAttack.description}</p>
                    </div>
                </div>
            </div>

            {/* Active Attacks */}
            {activeAttacks.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                        Active Attacks
                    </h4>
                    <div className="space-y-2">
                        {activeAttacks.map((attack) => {
                            const attackInfo = ATTACK_TYPES.find(a => a.id === attack.type);
                            const Icon = attackInfo?.icon || AlertTriangle;

                            return (
                                <div
                                    key={attack.id}
                                    className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-red-400 animate-pulse" />
                                        <div>
                                            <div className="text-sm font-bold text-white">{attackInfo?.label || attack.type}</div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {Math.round(attack.requestsGenerated).toLocaleString()} requests • {formatDuration(attack.startedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleStopAttack(attack.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono transition-colors"
                                    >
                                        <Square className="w-3 h-3" />
                                        Stop
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Attack History Toggle */}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                Attack History ({attackHistory.length})
            </button>

            {/* Attack History */}
            {showHistory && attackHistory.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {attackHistory.slice(-5).reverse().map((attack) => (
                        <div
                            key={attack.id}
                            className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <Ban className="w-3 h-3 text-green-400" />
                                <span className="text-white font-mono">{attack.type}</span>
                            </div>
                            <div className="text-slate-500 font-mono">
                                {attack.blocked.toLocaleString()} blocked • {attack.duration.toFixed(0)}s
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
