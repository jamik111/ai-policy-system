export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'gt' | 'lt' | 'in_list' | 'matches_pii' | 'is_toxic' | 'rate_limit_exceeded';
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
  effect: 'allow' | 'deny' | 'warn';
  priority: number;
  rules: PolicyGroup; // Root level is always a group
  actions: string[];
}

export interface EvaluationResult {
  allowed: boolean;
  status: 'allow' | 'deny' | 'warn';
  reason?: string;
  policyId?: string;
  actions: string[];
  latencyMs: number;
  confidence: number;
}

export class RuleEvaluator {
  static evaluate(policies: Policy[], context: any): EvaluationResult {
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
      } catch (error) {
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

  // Returns a confidence score 0.0 - 1.0 (0 = no match, 1 = full match)
  private static evaluateGroup(group: PolicyGroup, context: any): number {
    if (!group.conditions || group.conditions.length === 0) return 1.0;

    if (group.logic === 'AND') {
      let totalConfidence = 0;
      for (const item of group.conditions) {
        const score = this.evaluateItem(item, context);
        if (score === 0) return 0; // Short circuit
        totalConfidence += score;
      }
      return totalConfidence / group.conditions.length; // Average confidence
    } else { // OR
      for (const item of group.conditions) {
        const score = this.evaluateItem(item, context);
        if (score > 0) return score; // Return first match confidence
      }
      return 0;
    }
  }

  private static evaluateItem(item: PolicyCondition | PolicyGroup, context: any): number {
    if ('logic' in item) {
      return this.evaluateGroup(item as PolicyGroup, context);
    }
    return this.evaluateCondition(item as PolicyCondition, context);
  }

  private static evaluateCondition(condition: PolicyCondition, context: any): number {
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
      case 'matches_pii':
        // Basic PII detection (Mock/Simplified)
        const piiRegexes = {
          email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
          phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
          ssn: /\d{3}-\d{2}-\d{4}/
        };
        const piiType = condition.value as keyof typeof piiRegexes;
        if (piiRegexes[piiType]) {
          return piiRegexes[piiType].test(String(actualValue)) ? 1.0 : 0;
        }
        return 0;
      case 'is_toxic':
        // Mock content moderation
        const toxicWords = ['bad', 'evil', 'harm', 'kill'];
        return toxicWords.some(w => String(actualValue).toLowerCase().includes(w)) ? 1.0 : 0;
      case 'rate_limit_exceeded':
        // Checks if value (usage count) > threshold
        return Number(actualValue) > Number(condition.value) ? 1.0 : 0;

      case 'gt': return Number(actualValue) > Number(condition.value) ? 1.0 : 0;
      case 'lt': return Number(actualValue) < Number(condition.value) ? 1.0 : 0;
      case 'in_list':
        return (Array.isArray(condition.value) && condition.value.includes(actualValue)) ? 1.0 : 0;
      default: return 0;
    }
  }

  private static getValueFromContext(context: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], context);
  }
}
