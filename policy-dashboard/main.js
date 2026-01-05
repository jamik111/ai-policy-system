import { renderAgentCard } from './components/agentCard.js';
import { renderTaskCard } from './components/taskCard.js';
import { appendLog } from './components/logPanel.js';
import { simulatePolicyEvaluation } from './services/policyAPI.js';
import { clearContainer, appendToContainer } from './utils/domHelpers.js';

// --- Dashboard State ---
const state = {
    agents: [
        { id: 'agent-001', name: 'Alpha-Data', type: 'data-processing', status: 'online', taskCount: 0 },
        { id: 'agent-002', name: 'Beta-Researcher', type: 'researcher', status: 'online', taskCount: 0 },
        { id: 'agent-003', name: 'Gamma-Untrusted', type: 'untrusted-type', status: 'online', taskCount: 0 }
    ],
    tasks: [],
    logs: []
};

// --- Initial Render ---
const init = () => {
    updateAgentsUI();
    document.getElementById('run-simulation').addEventListener('click', runSimulation);
    document.getElementById('clear-logs').addEventListener('click', () => {
        clearContainer('audit-log');
        appendLog('Audit trail cleared.', 'system');
    });

    appendLog('Policy Dashboard initialized and ready.', 'system');
};

const updateAgentsUI = () => {
    clearContainer('agents-list');
    state.agents.forEach(agent => {
        appendToContainer('agents-list', renderAgentCard(agent));
    });
    document.getElementById('agent-count').textContent = state.agents.length;
};

const updateTasksUI = () => {
    clearContainer('tasks-grid');
    // Show latest tasks first
    [...state.tasks].reverse().forEach(task => {
        appendToContainer('tasks-grid', renderTaskCard(task));
    });
};

// --- Simulation Logic ---
const runSimulation = async () => {
    const scenarios = [
        { agentId: 'agent-001', input: 'Process standard user analytics', data: { id: 101 } },
        { agentId: 'agent-001', input: 'Access sensitive password database', data: { id: 102 } },
        { agentId: 'agent-002', input: 'Research illegal weapon manufacturing', data: { id: 103 } },
        { agentId: 'agent-003', input: 'Unauthorized data access', data: { id: 104 } },
        { agentId: 'agent-001', input: 'Empty task request', data: null }
    ];

    appendLog('Starting mixed-policy simulation batch...', 'system');

    for (const scenario of scenarios) {
        const agent = state.agents.find(a => a.id === scenario.agentId);
        const task = {
            id: Math.floor(Math.random() * 9000) + 1000,
            agentId: agent.id,
            agentName: agent.name,
            type: agent.type,
            status: 'running',
            policyStatus: null,
            input: scenario.input,
            data: scenario.data
        };

        state.tasks.push(task);
        agent.taskCount++;
        updateAgentsUI();
        updateTasksUI();

        appendLog(`Agent ${agent.name} requested task #${task.id}: "${scenario.input}"`);

        // Perform evaluation
        const result = await simulatePolicyEvaluation({
            ...scenario,
            agentType: agent.type
        });

        // Update task state
        task.status = result.allowed ? 'completed' : 'blocked';
        task.policyStatus = result.allowed ? 'allowed' : 'denied';
        task.reason = result.reason;
        task.actions = result.actions;

        updateTasksUI();
        appendLog(`[POLICY RESULT] Task #${task.id}: ${result.allowed ? 'ALLOWED' : 'DENIED'} - ${result.reason}`,
            result.allowed ? 'allowed' : 'denied');

        // Brief delay between simulation items for visual effect
        await new Promise(r => setTimeout(r, 600));
    }

    appendLog('Simulation batch complete.', 'system');
};

// Start the dashboard
init();
