export interface PolicyCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'gt' | 'lt' | 'in_list';
    value: any;
}

export interface PolicyGroup {
    logic: 'AND' | 'OR';
    conditions: (PolicyCondition | PolicyGroup)[];
}

export interface Policy {
    id: string;
    name: string;
    type: 'content_filter' | 'rate_limit' | 'access_control' | 'task_restriction' | 'compliance';
    scope: 'global' | 'agent' | 'task';
    target?: string; // Specific agent ID or Task Type
    effect: 'allow' | 'deny';
    priority: number;
    rules: PolicyGroup; // Root level is always a group
    actions: string[];
}

export interface EvaluationResult {
    allowed: boolean;
    reason?: string;
    policyId?: string;
    actions: string[];
}

export class RuleEvaluator {
    static evaluate(policies: Policy[], context: any): EvaluationResult {
        // Sort by priority (descending)
        const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);

        for (const policy of sortedPolicies) {
            // 1. Check Scope & Target
            if (!this.matchesScope(policy, context)) {
                continue;
            }

            // 2. Evaluate Rules
            try {
                const match = this.evaluateGroup(policy.rules, context);
                if (match) {
                    return {
                        allowed: policy.effect === 'allow',
                        reason: `Matched policy: ${policy.name} (${policy.id})`,
                        policyId: policy.id,
                        actions: policy.actions
                    };
                }
            } catch (error) {
                console.error(`Error evaluating policy ${policy.id}:`, error);
            }
        }

        // Default Deny
        return {
            allowed: false,
            reason: "Implicit Deny: No matching policy with 'allow' effect found",
            actions: []
        };
    }

    private static matchesScope(policy: Policy, context: any): boolean {
        if (policy.scope === 'global') return true;
        if (policy.scope === 'agent' && policy.target) {
            return context.agentId === policy.target;
        }
        if (policy.scope === 'task' && policy.target) {
            return context.taskType === policy.target;
        }
        return false;
    }

    private static evaluateGroup(group: PolicyGroup, context: any): boolean {
        if (!group.conditions || group.conditions.length === 0) return true;

        if (group.logic === 'AND') {
            return group.conditions.every(item => this.evaluateItem(item, context));
        } else { // OR
            return group.conditions.some(item => this.evaluateItem(item, context));
        }
    }

    private static evaluateItem(item: PolicyCondition | PolicyGroup, context: any): boolean {
        if ('logic' in item) {
            return this.evaluateGroup(item as PolicyGroup, context);
        }
        return this.evaluateCondition(item as PolicyCondition, context);
    }

    private static evaluateCondition(condition: PolicyCondition, context: any): boolean {
        const actualValue = this.getValueFromContext(context, condition.field);

        // Handle missing values
        if (actualValue === undefined || actualValue === null) {
            return condition.operator === 'not_equals';
        }

        switch (condition.operator) {
            case 'equals': return actualValue == condition.value;
            case 'not_equals': return actualValue != condition.value;
            case 'contains':
                return typeof actualValue === 'string' && actualValue.includes(condition.value);
            case 'not_contains':
                return typeof actualValue === 'string' && !actualValue.includes(condition.value);
            case 'regex':
                return new RegExp(condition.value, 'i').test(String(actualValue));
            case 'gt': return Number(actualValue) > Number(condition.value);
            case 'lt': return Number(actualValue) < Number(condition.value);
            case 'in_list':
                return Array.isArray(condition.value) && condition.value.includes(actualValue);
            default: return false;
        }
    }

    private static getValueFromContext(context: any, fieldPath: string): any {
        return fieldPath.split('.').reduce((obj, key) => obj?.[key], context);
    }
}

