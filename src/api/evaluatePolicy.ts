import { PolicyEngine } from '../engine/policyEngine';
import { EvaluationResult } from '../engine/ruleEvaluator';

const engine = new PolicyEngine();

/**
 * Public interface for agents to check their policies.
 * Realistic API-first look.
 */
export const evaluate = (context: any): EvaluationResult => {
    return engine.evaluate({
        ...context,
        timestamp: new Date().toISOString(),
        requestId: context.requestId || `req_${Math.random().toString(36).substr(2, 9)}`
    });
};
