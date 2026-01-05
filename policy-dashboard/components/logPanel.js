import { createElement, scrollToBottom } from '../utils/domHelpers.js';

export const appendLog = (message, type = 'system') => {
    const logContainer = document.getElementById('audit-log');
    const entry = createElement('div', `log-entry ${type}`);
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    logContainer.appendChild(entry);
    scrollToBottom('audit-log');
};
