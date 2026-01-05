import { createElement } from '../utils/domHelpers.js';

export const renderTaskCard = (task) => {
    const card = createElement('div', `task-card ${task.policyStatus || 'running'}`);
    card.innerHTML = `
        <div class="task-info">
            <h4>#${task.id}</h4>
            <p class="meta">Agent: ${task.agentName}</p>
            <p class="meta">Type: ${task.type}</p>
        </div>
        <div class="task-status">
            <strong>${task.policyStatus ? task.policyStatus.toUpperCase() : 'PROCESSING...'}</strong>
            <p class="reason">${task.reason || 'Evaluating policies...'}</p>
        </div>
        ${task.actions ? `
            <div class="task-actions">
                ${task.actions.map(a => `<span class="action-badge">${Object.keys(a)[0]}: ${Object.values(a)[0]}</span>`).join('')}
            </div>
        ` : ''}
    `;
    return card;
};
