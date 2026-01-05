"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEvaluator = void 0;
class RuleEvaluator {
    static evaluate(policies, context) {
        const start = process.hrtime();
        // Sort by priority (descending)
        const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);
        for (const policy of sortedPolicies) {
            // 1. Check Scope & Target
            if (!this.matchesScope(policy, context)) {
                continue;
            }
            // 2. Evaluate Rules
            try {
                const matchScore = this.evaluateGroup(policy.rules, context);
                if (matchScore > 0) {
                    const end = process.hrtime(start);
                    const latencyMs = (end[0] * 1000 + end[1] / 1e6);
                    return {
                        allowed: policy.effect !== 'deny', // warn is allowed
                        status: policy.effect,
                        reason: `Matched policy: ${policy.name} (${policy.id})`,
                        policyId: policy.id,
                        actions: policy.actions,
                        latencyMs: parseFloat(latencyMs.toFixed(3)),
                        confidence: matchScore
                    };
                }
            }
            catch (error) {
                console.error(`Error evaluating policy ${policy.id}:`, error);
            }
        }
        const end = process.hrtime(start);
        const latencyMs = (end[0] * 1000 + end[1] / 1e6);
        // Default Deny
        return {
            allowed: false,
            status: 'deny',
            reason: "Implicit Deny: No matching policy with 'allow' or 'warn' effect found",
            actions: [],
            latencyMs: parseFloat(latencyMs.toFixed(3)),
            confidence: 1.0 // Certainty of default deny
        };
    }
    static matchesScope(policy, context) {
        if (policy.scope === 'global')
            return true;
        if (policy.scope === 'agent' && policy.target) {
            return context.agentId === policy.target;
        }
        if (policy.scope === 'task' && policy.target) {
            return context.taskType === policy.target;
        }
        return false;
    }
    // Returns a confidence score 0.0 - 1.0 (0 = no match, 1 = full match)
    static evaluateGroup(group, context) {
        if (!group.conditions || group.conditions.length === 0)
            return 1.0;
        if (group.logic === 'AND') {
            let totalConfidence = 0;
            for (const item of group.conditions) {
                const score = this.evaluateItem(item, context);
                if (score === 0)
                    return 0; // Short circuit
                totalConfidence += score;
            }
            return totalConfidence / group.conditions.length; // Average confidence
        }
        else { // OR
            for (const item of group.conditions) {
                const score = this.evaluateItem(item, context);
                if (score > 0)
                    return score; // Return first match confidence
            }
            return 0;
        }
    }
    static evaluateItem(item, context) {
        if ('logic' in item) {
            return this.evaluateGroup(item, context);
        }
        return this.evaluateCondition(item, context);
    }
    static evaluateCondition(condition, context) {
        const actualValue = this.getValueFromContext(context, condition.field);
        // Handle missing values
        if (actualValue === undefined || actualValue === null) {
            return condition.operator === 'not_equals' ? 1.0 : 0;
        }
        switch (condition.operator) {
            case 'equals': return actualValue == condition.value ? 1.0 : 0;
            case 'not_equals': return actualValue != condition.value ? 1.0 : 0;
            case 'contains':
                return (typeof actualValue === 'string' && actualValue.includes(condition.value)) ? 1.0 : 0;
            case 'not_contains':
                return (typeof actualValue === 'string' && !actualValue.includes(condition.value)) ? 1.0 : 0;
            case 'regex':
                return new RegExp(condition.value, 'i').test(String(actualValue)) ? 1.0 : 0;
            case 'gt': return Number(actualValue) > Number(condition.value) ? 1.0 : 0;
            case 'lt': return Number(actualValue) < Number(condition.value) ? 1.0 : 0;
            case 'in_list':
                return (Array.isArray(condition.value) && condition.value.includes(actualValue)) ? 1.0 : 0;
            default: return 0;
        }
    }
    static getValueFromContext(context, fieldPath) {
        return fieldPath.split('.').reduce((obj, key) => obj?.[key], context);
    }
}
exports.RuleEvaluator = RuleEvaluator;
