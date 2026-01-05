export interface Agent {
    id: string;
    name: string;
    type: string;
    status: 'idle' | 'running' | 'error';
    taskCount: number;
}

export interface Task {
    id: string;
    agentId: string;
    agentName: string;
    type: string;
    status: 'running' | 'completed' | 'blocked';
    policyResult?: 'allow' | 'deny' | 'warn';
    input: string;
    data: any;
    reason?: string;
    actions?: any[];
}

export interface LogEntry {
    message: string;
    status: 'allow' | 'deny' | 'pending' | 'system';
    timestamp: string;
}

export const policyAPI = {
    runTask: async (task: Task, agentType: string) => {
        // Simulate policy engine evaluation
        await new Promise(r => setTimeout(r, 1200));

        // Simple evaluation logic for simulation
        if (task.input.toLowerCase().includes('sensitive')) {
            return {
                allowed: false,
                reason: "Policy safety-guardrail matched with effect: deny",
                actions: [{ block: "Sensitive data input detected" }]
            };
        }

        if (task.input.toLowerCase().includes('illegal')) {
            return {
                allowed: false,
                reason: "Policy global-ethics matched with effect: deny",
                actions: [{ block: "Prohibited content detected" }]
            };
        }

        if (!['data-processing', 'researcher'].includes(agentType)) {
            return {
                allowed: false,
                reason: "Deny by default: Unauthorized agent type",
                actions: []
            };
        }

        if (task.data === null) {
            return {
                allowed: false,
                reason: "Policy task-validation matched with effect: deny",
                actions: [{ block: "Input data validation failed" }]
            };
        }

        return {
            allowed: true,
            reason: "Policy authorized successfully",
            actions: [{ notify: "Execution permitted" }]
        };
    }
};
