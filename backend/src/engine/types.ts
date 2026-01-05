/**
 * Core type definitions for the Policy Management System
 */

export interface PolicyRule {
  id: string;
  name: string;
  scope: 'global' | 'agent' | 'task';
  priority: number; // Higher = evaluated first
  effect: 'allow' | 'deny';
  condition: string; // JavaScript expression
  actions: string[]; // ['log', 'notify', 'override']
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  rules: PolicyRule[];
  version: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationContext {
  agentId: string;
  taskId: string;
  taskName: string;
  payload: Record<string, any>;
  metadata?: {
    priority?: number;
    timeout?: number;
    retryCount?: number;
    userId?: string;
    role?: 'admin' | 'user';
  };
  timestamp: number;
  simulationMode?: boolean;
}

export interface ConditionVariable {
  // Agent properties
  'agent.id': string;
  'agent.role'?: string;
  'agent.maxParallelTasks'?: number;
  'agent.allowedScopes'?: string[];

  // Task properties
  'task.id': string;
  'task.name': string;
  'task.resource'?: string;
  'task.action'?: string;
  'task.confidential'?: boolean;
  'task.externalCall'?: boolean;

  // Payload properties
  'payload.*': any;

  // Context
  'context.timestamp': number;
  'context.userRole'?: string;
  'context.simulationMode'?: boolean;
}

export interface EvaluationResult {
  allowed: boolean;
  reason: string;
  triggeredRules: PolicyRule[];
  appliedActions: string[];
  simulationMode: boolean;
  timestamp: number;
  conflictDetected?: boolean;
}

export interface ConflictInfo {
  rule1: PolicyRule;
  rule2: PolicyRule;
  type: 'opposing-effects' | 'overlapping-conditions' | 'priority-inversion';
  severity: 'warning' | 'critical';
  message: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  agentId: string;
  taskId: string;
  taskName: string;
  action: 'allowed' | 'denied' | 'overridden';
  triggeredRules: string[];
  appliedActions: string[];
  payload?: Record<string, any>;
  result?: any;
  error?: string;
  duration: number;
  userId?: string;
  simulationMode?: boolean;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: string;
  rules: PolicyRule[];
  createdAt: string;
  createdBy?: string;
  description?: string;
}

export interface SystemState {
  activePolicies: Policy[];
  policyVersions: Map<string, PolicyVersion[]>;
  auditLogs: AuditLogEntry[];
  conflicts: ConflictInfo[];
  statistics: SystemStatistics;
}

export interface SystemStatistics {
  totalTasksEvaluated: number;
  totalAllowed: number;
  totalDenied: number;
  totalErrors: number;
  violationsByRule: Record<string, number>;
  violationsByAgent: Record<string, number>;
  avgEvaluationTime: number;
}
