import { createElement } from '../utils/domHelpers.js';

export const renderAgentCard = (agent) => {
    const card = createElement('div', 'agent-card');
    card.innerHTML = `
        <div class="agent-header">
            <h3>${agent.name}</h3>
            <span class="status">
                <span class="dot ${agent.status}"></span>
                ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
        </div>
        <p class="meta">ID: ${agent.id}</p>
        <p class="meta">Type: ${agent.type}</p>
        <div class="agent-stats">
            <small>Total Tasks: ${agent.taskCount}</small>
        </div>
    `;
    return card;
};
