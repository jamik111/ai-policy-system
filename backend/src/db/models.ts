export interface Policy {
    id: string;
    name: string;
    type: 'access_control' | 'data_protection' | 'rate_limit' | 'content_safety';
    rules: PolicyRule[];
    priority: number;
    status: 'active' | 'inactive' | 'draft';
    createdAt: string;
    triggers: number;
    successRate: number;
}

export interface PolicyRule {
    type: 'keyword' | 'regex' | 'semantic' | 'rate_limit';
    value: any;
    action: 'allow' | 'deny' | 'warn';
    field?: string;
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'active' | 'idle' | 'blocked' | 'offline';
    capabilities: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    taskCount: number;
    lastActive: string;
    assignedPolicies?: string[];
}

export interface Task {
    id: string;
    agentId: string;
    type: string;
    payload: any;
    timestamp: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
}

export interface Evaluation {
    id: string;
    taskId: string;
    policyId: string;
    decision: 'allow' | 'deny' | 'warn';
    reason: string;
    confidence: number;
    latency: number;
    timestamp: string;
}

export interface Violation {
    id: string;
    taskId: string;
    agentId: string;
    policyId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    timestamp: string;
    resolutionStatus?: 'open' | 'reviewed' | 'ignored';
    resolutionComment?: string;
}
