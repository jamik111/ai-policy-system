"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- Interfaces (from User Spec) ---

export interface AnalyticsState {
    timeSeriesData: {
        timestamps: number[];
        taskVolume: number[];
        latencyP50: number[];
        latencyP95: number[];
        latencyP99: number[];
        tokenUsage: number[];
        errorRate: number[];
        violationRate: number[];
        memoryUsage: number[];
        cpuUtilization: number[];
    };
    baselines: {
        taskVolumeMean: number;
        taskVolumeStdDev: number;
        latencyMean: number;
        latencyStdDev: number;
        normalViolationRate: number;
        calculatedAt: number;
        sampleSize: number;
    };
    anomalies: Array<{
        id: string;
        type: 'LATENCY_SPIKE' | 'VOLUME_SURGE' | 'ERROR_BURST' | 'DRIFT_DETECTED' | 'PATTERN_BREAK';
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        detectedAt: number;
        metric: string;
        currentValue: number;
        expectedValue: number;
        zScore: number;
        confidence: number;
        description: string;
        affectedAgents: string[];
        acknowledged: boolean;
    }>;
    attackVectors: {
        active: Array<{
            id: string;
            type: 'DDOS' | 'SQL_INJECTION' | 'PII_EXFIL' | 'RATE_ABUSE' | 'PAYLOAD_BOMB';
            startedAt: number;
            requestsGenerated: number;
            successRate: number;
            detectionTime: number;
            mitigated: boolean;
        }>;
        history: Array<{
            id: string;
            type: string;
            startedAt: number;
            endedAt: number;
            totalRequests: number;
            blocked: number;
            duration: number;
        }>;
    };
    agentIntelligence: Map<string, {
        behaviorProfile: {
            typicalTaskRate: number;
            typicalTaskTypes: string[];
            activeHours: number[];
            riskTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
            trustScore: number;
        };
        recentPatterns: Array<{
            pattern: string;
            detectedAt: number;
            frequency: number;
        }>;
        predictions: {
            nextViolationProbability: number;
            estimatedNextViolation: number;
            riskFactors: string[];
        };
    }>;
    policyIntelligence: Map<string, {
        effectiveness: {
            truePositives: number;
            falsePositives: number;
            trueNegatives: number;
            falseNegatives: number;
            precision: number;
            recall: number;
            f1Score: number;
        };
        performance: {
            avgEvaluationTime: number;
            timeoutRate: number;
            cacheHitRate: number;
        };
        optimization: {
            recommendedPriority: number;
            recommendedThreshold: number;
            confidenceInterval: [number, number];
        };
    }>;
    systemHealth: {
        overallScore: number;
        components: {
            policyEngine: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
            database: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
            simulation: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        };
        alerts: Array<{
            id: string;
            component: string;
            message: string;
            severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
            timestamp: number;
        }>;
    };
    policyCorrelations: Map<string, Map<string, number>>;
    viewMode: 'CISO' | 'SECURITY_ENGINEER' | 'COMPLIANCE_OFFICER' | 'DATA_SCIENTIST';
    activeDashboard: 'OVERVIEW' | 'FORENSICS' | 'PREDICTIONS' | 'COMPLIANCE';
    selectedTimeRange: '5m' | '1h' | '6h' | '24h' | '7d' | '30d';
    comparisonMode: boolean;
    forensicSession: {
        active: boolean;
        focusedAgentId: string | null;
        focusedPolicyId: string | null;
        timeRange: [number, number];
        filters: {
            decision: ('ALLOW' | 'WARN' | 'DENY')[];
            severity: string[];
            minScore: number;
            maxScore: number;
        };
        selectedEvaluationIds: string[];
        notes: Array<{
            id: string;
            evaluationId: string;
            text: string;
            author: string;
            timestamp: number;
        }>;
    };
}

export interface AnalyticsActions {
    captureDataPoint: () => void;
    calculateBaselines: () => void;
    detectAnomalies: () => void;
    injectAttackVector: (type: string, intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') => void;
    stopAttack: (attackId: string) => void;
    analyzeAgentBehavior: (agentId: string) => void;
    predictAgentRisk: (agentId: string) => number;
    optimizePolicy: (policyId: string) => void;
    calculatePolicyEffectiveness: (policyId: string) => void;
    startForensicSession: (agentId?: string, policyId?: string) => void;
    endForensicSession: () => void;
    addForensicNote: (evaluationId: string, text: string) => void;
    exportForensicReport: () => void;
    switchViewMode: (mode: string) => void;
    setTimeRange: (range: string) => void;
    toggleComparisonMode: () => void;
    calculatePolicyCorrelations: () => void;
    findRelatedViolations: (evaluationId: string) => string[];
    forecastTaskVolume: (hoursAhead: number) => number[];
    predictNextAnomaly: () => { type: string; probability: number; estimatedTime: number };
    getAggregatedMetrics: (timeRange: [number, number]) => {
        totalTasks: number;
        successRate: number;
        avgLatency: number;
        p95Latency: number;
        violationCount: number;
        topViolatingAgents: Array<{ agentId: string; count: number }>;
        topTriggeredPolicies: Array<{ policyId: string; count: number }>;
    };
}

const AnalyticsContext = createContext<(AnalyticsState & AnalyticsActions) | undefined>(undefined);

// --- Initialization Helpers ---

const INITIAL_WINDOW_SIZE = 300; // 5 minutes @ 1s

const generateInitialTimeSeries = (): AnalyticsState['timeSeriesData'] => {
    const data: AnalyticsState['timeSeriesData'] = {
        timestamps: [], taskVolume: [], latencyP50: [], latencyP95: [], latencyP99: [],
        tokenUsage: [], errorRate: [], violationRate: [], memoryUsage: [], cpuUtilization: []
    };
    const now = Date.now();
    for (let i = INITIAL_WINDOW_SIZE; i > 0; i--) {
        data.timestamps.push(now - i * 1000);
        // Simulate typical baseline
        data.taskVolume.push(Math.max(0, 50 + Math.random() * 20)); // ~50-70 TPS
        data.latencyP50.push(20 + Math.random() * 10);
        data.latencyP95.push(50 + Math.random() * 30);
        data.latencyP99.push(100 + Math.random() * 100);
        data.tokenUsage.push(Math.max(0, 1000 + Math.random() * 500));
        data.errorRate.push(Math.random() * 0.02); // 0-2%
        data.violationRate.push(Math.random() * 0.05); // 0-5%
        data.memoryUsage.push(40 + Math.random() * 10);
        data.cpuUtilization.push(30 + Math.random() * 20);
    }
    return data;
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- State ---
    const [timeSeriesData, setTimeSeriesData] = useState(generateInitialTimeSeries());
    const [anomalies, setAnomalies] = useState<AnalyticsState['anomalies']>([]);
    const [attackVectors, setAttackVectors] = useState<AnalyticsState['attackVectors']>({ active: [], history: [] });
    const [systemHealth, setSystemHealth] = useState<AnalyticsState['systemHealth']>({
        overallScore: 95,
        components: { policyEngine: 'HEALTHY', database: 'HEALTHY', simulation: 'HEALTHY' },
        alerts: []
    });

    // View State
    const [viewMode, setViewMode] = useState<AnalyticsState['viewMode']>('CISO');
    const [activeDashboard, setActiveDashboard] = useState<AnalyticsState['activeDashboard']>('OVERVIEW');
    const [selectedTimeRange, setSelectedTimeRange] = useState<AnalyticsState['selectedTimeRange']>('5m');
    const [comparisonMode, setComparisonMode] = useState(false);

    // Forensics State
    const [forensicSession, setForensicSession] = useState<AnalyticsState['forensicSession']>({
        active: false, focusedAgentId: null, focusedPolicyId: null, timeRange: [0, 0],
        filters: { decision: [], severity: [], minScore: 0, maxScore: 100 },
        selectedEvaluationIds: [], notes: []
    });

    // Intelligence Maps (Empty initial)
    const [agentIntelligence] = useState<AnalyticsState['agentIntelligence']>(new Map());
    const [policyIntelligence] = useState<AnalyticsState['policyIntelligence']>(new Map());
    const [policyCorrelations] = useState<AnalyticsState['policyCorrelations']>(new Map());

    // Mock Baseline
    const baselines = {
        taskVolumeMean: 60, taskVolumeStdDev: 10,
        latencyMean: 25, latencyStdDev: 5,
        normalViolationRate: 0.03, calculatedAt: Date.now(), sampleSize: 300
    };

    // --- Actions ---

    const detectAnomalies = useCallback(() => {
        const i = timeSeriesData.timestamps.length - 1;
        if (i < 0) return;

        const volume = timeSeriesData.taskVolume[i];
        const latency = timeSeriesData.latencyP95[i];
        const errRate = timeSeriesData.errorRate[i];

        const volumeZ = (volume - baselines.taskVolumeMean) / baselines.taskVolumeStdDev;
        const latencyZ = (latency - baselines.latencyMean) / baselines.latencyStdDev;

        const newAnomalies: Array<any> = [];

        if (volumeZ > 2.5) {
            newAnomalies.push({
                id: uuidv4(),
                type: 'VOLUME_SURGE',
                severity: volumeZ > 4 ? 'CRITICAL' : 'HIGH',
                detectedAt: Date.now(),
                metric: 'taskVolume',
                currentValue: volume,
                expectedValue: baselines.taskVolumeMean,
                zScore: volumeZ,
                confidence: 0.95,
                description: `Significant volume increase detected: ${volume.toFixed(0)} tasks/s`,
                affectedAgents: [],
                acknowledged: false
            });
        }

        if (latencyZ > 3) {
            newAnomalies.push({
                id: uuidv4(),
                type: 'LATENCY_SPIKE',
                severity: latencyZ > 5 ? 'CRITICAL' : 'HIGH',
                detectedAt: Date.now(),
                metric: 'latencyP95',
                currentValue: latency,
                expectedValue: baselines.latencyMean,
                zScore: latencyZ,
                confidence: 0.92,
                description: `Critical latency spike: ${latency.toFixed(0)}ms (P95)`,
                affectedAgents: [],
                acknowledged: false
            });
        }

        if (errRate > 0.04) {
            newAnomalies.push({
                id: uuidv4(),
                type: 'ERROR_BURST',
                severity: errRate > 0.1 ? 'CRITICAL' : 'MEDIUM',
                detectedAt: Date.now(),
                metric: 'errorRate',
                currentValue: errRate,
                expectedValue: 0.01,
                zScore: 4,
                confidence: 0.88,
                description: `Elevated error rate detected: ${(errRate * 100).toFixed(1)}%`,
                affectedAgents: [],
                acknowledged: false
            });
        }

        if (newAnomalies.length > 0) {
            setAnomalies(prev => {
                const recent = prev.filter(a => Date.now() - a.detectedAt < 30000);
                const filteredNew = newAnomalies.filter(n => !recent.some(r => r.type === n.type));
                return [...prev, ...filteredNew].slice(-50);
            });
        }
    }, [timeSeriesData.taskVolume, timeSeriesData.latencyP95, timeSeriesData.errorRate, baselines]);

    // --- Simulation Engine ---

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSeriesData(prev => {
                const next = { ...prev };
                const now = Date.now();

                // Rolling Window
                next.timestamps = [...prev.timestamps.slice(1), now];

                // Attack Multipliers
                const isAttack = attackVectors.active.length > 0;
                const volumeMult = isAttack ? 5 : 1;
                const latencyMult = isAttack ? 3 : 1;

                // Generate next data point with baseline + random spikes
                const randomSpike = Math.random() > 0.98 ? 3 : 1; // 2% chance of a small surge

                next.taskVolume = [...prev.taskVolume.slice(1), (Math.max(0, 50 + Math.random() * 20) * volumeMult * randomSpike)];
                next.latencyP50 = [...prev.latencyP50.slice(1), (20 + Math.random() * 10) * latencyMult];
                next.latencyP95 = [...prev.latencyP95.slice(1), (50 + Math.random() * 30 + (Math.random() > 0.95 ? 100 : 0)) * latencyMult];
                next.latencyP99 = [...prev.latencyP99.slice(1), (100 + Math.random() * 100) * latencyMult];
                next.tokenUsage = [...prev.tokenUsage.slice(1), Math.max(0, 1000 + Math.random() * 500) * volumeMult];
                next.errorRate = [...prev.errorRate.slice(1), Math.random() * (isAttack ? 0.15 : 0.03)]; // increased noise
                next.violationRate = [...prev.violationRate.slice(1), Math.random() * (isAttack ? 0.25 : 0.06)]; // increased noise
                next.memoryUsage = [...prev.memoryUsage.slice(1), Math.min(100, 40 + Math.random() * 10 + (isAttack ? 30 : 0))];
                next.cpuUtilization = [...prev.cpuUtilization.slice(1), Math.min(100, 30 + Math.random() * 20 + (isAttack ? 40 : 0))];

                return next;
            });

            // Run Anomaly Detection
            detectAnomalies();

            // Update Attack Stats
            if (attackVectors.active.length > 0) {
                setAttackVectors(prev => ({
                    ...prev,
                    active: prev.active.map(a => ({
                        ...a,
                        requestsGenerated: a.requestsGenerated + (100 * (1 + Math.random())),
                        detectionTime: a.detectionTime + 1
                    }))
                }));

                // Degrade Health during attack
                setSystemHealth(prev => ({
                    ...prev,
                    overallScore: Math.max(20, prev.overallScore - 1),
                    components: { ...prev.components, policyEngine: 'DEGRADED' }
                }));
            } else {
                // Heal
                setSystemHealth(prev => ({
                    ...prev,
                    overallScore: Math.min(100, prev.overallScore + 1),
                    components: { ...prev.components, policyEngine: 'HEALTHY' }
                }));
            }

        }, 1000);
        return () => clearInterval(interval);
    }, [attackVectors.active.length]);

    // --- Actions ---

    const injectAttackVector = (type: string, intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') => {
        const id = uuidv4();
        const newAttack = {
            id, type: type as any, startedAt: Date.now(), requestsGenerated: 0,
            successRate: 0, detectionTime: 0, mitigated: false
        };
        setAttackVectors(prev => ({ ...prev, active: [...prev.active, newAttack] }));

        // Add anomaly
        setAnomalies(prev => [...prev, {
            id: uuidv4(), type: 'VOLUME_SURGE', severity: 'CRITICAL', detectedAt: Date.now(),
            metric: 'taskVolume', currentValue: 500, expectedValue: 60, zScore: 8.5,
            confidence: 0.99, description: `Simulated ${type} Attack detected`, affectedAgents: [], acknowledged: false
        }]);
    };

    const stopAttack = (attackId: string) => {
        setAttackVectors(prev => {
            const attack = prev.active.find(a => a.id === attackId);
            if (!attack) return prev;
            return {
                active: prev.active.filter(a => a.id !== attackId),
                history: [
                    ...prev.history,
                    { ...attack, type: String(attack.type), endedAt: Date.now(), blocked: attack.requestsGenerated, duration: (Date.now() - attack.startedAt) / 1000, totalRequests: attack.requestsGenerated }
                ]
            };
        });
    };

    const startForensicSession = (agentId?: string, policyId?: string) => {
        setForensicSession({
            active: true,
            focusedAgentId: agentId || null,
            focusedPolicyId: policyId || null,
            timeRange: [Date.now() - 3600000, Date.now()],
            filters: { decision: [], severity: [], minScore: 0, maxScore: 100 },
            selectedEvaluationIds: [], notes: []
        });
        setActiveDashboard('FORENSICS');
    };

    const endForensicSession = () => {
        setForensicSession(prev => ({ ...prev, active: false }));
        setActiveDashboard('OVERVIEW');
    };

    // Placeholders
    const captureDataPoint = () => { };
    const calculateBaselines = () => { };
    const analyzeAgentBehavior = () => { };
    const predictAgentRisk = () => 0.5;
    const optimizePolicy = () => { };
    const calculatePolicyEffectiveness = () => { };
    const addForensicNote = () => { };
    const exportForensicReport = () => { };
    const switchViewMode = (mode: string) => setViewMode(mode as any);
    const setTimeRange = (range: string) => setSelectedTimeRange(range as any);
    const toggleComparisonMode = () => setComparisonMode(!comparisonMode);
    const calculatePolicyCorrelations = () => { };
    const findRelatedViolations = () => [];
    const forecastTaskVolume = () => [];
    const predictNextAnomaly = () => ({ type: 'NONE', probability: 0, estimatedTime: 0 });
    const getAggregatedMetrics = () => ({ totalTasks: 0, successRate: 0, avgLatency: 0, p95Latency: 0, violationCount: 0, topViolatingAgents: [], topTriggeredPolicies: [] });

    const value = {
        // State
        timeSeriesData, baselines, anomalies, attackVectors, agentIntelligence,
        policyIntelligence, systemHealth, policyCorrelations, viewMode, activeDashboard,
        selectedTimeRange, comparisonMode, forensicSession,

        // Actions
        captureDataPoint, calculateBaselines, detectAnomalies, injectAttackVector, stopAttack,
        analyzeAgentBehavior, predictAgentRisk, optimizePolicy, calculatePolicyEffectiveness,
        startForensicSession, endForensicSession, addForensicNote, exportForensicReport,
        switchViewMode, setTimeRange, toggleComparisonMode, calculatePolicyCorrelations,
        findRelatedViolations, forecastTaskVolume, predictNextAnomaly, getAggregatedMetrics
    };

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};
