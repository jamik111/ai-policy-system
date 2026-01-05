/**
 * Mocking the Policy Engine for Browser Environment
 * In a real-world scenario, this would be a REST API call to a backend.
 */
export const simulatePolicyEvaluation = async (context) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Global Ethics Policy (Priority 100)
    if (context.user === 'banned_user' || (context.input && context.input.toLowerCase().includes('illegal'))) {
        return {
            allowed: false,
            reason: "Policy global-ethics matched with effect: deny",
            actions: [{ block: "Prohibited content detected" }]
        };
    }

    // Safety Guardrail (Priority 110)
    if (context.input && context.input.toLowerCase().includes('sensitive')) {
        return {
            allowed: false,
            reason: "Policy safety-guardrail matched with effect: deny",
            actions: [{ block: "Sensitive data input detected at global level" }]
        };
    }

    // Agent Policy (Priority 90)
    const allowedAgentTypes = ['data-processing', 'researcher'];
    if (allowedAgentTypes.includes(context.agentType)) {
        // Task Policy (Priority 80)
        if (!context.data) {
            return {
                allowed: false,
                reason: "Policy task-validation matched with effect: deny",
                actions: [{ block: "Input data validation failed" }]
            };
        }

        return {
            allowed: true,
            reason: "Policy agent-permissions matched with effect: allow",
            actions: [{ notify: "Agent task authorized" }]
        };
    }

    return {
        allowed: false,
        reason: "Deny by default: No matching policy found",
        actions: []
    };
};
