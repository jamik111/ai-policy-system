export const createElement = (tag, className, content) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.innerHTML = content;
    return el;
};

export const clearContainer = (id) => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
};

export const appendToContainer = (id, element) => {
    const container = document.getElementById(id);
    if (container) container.appendChild(element);
};

export const scrollToBottom = (id) => {
    const container = document.getElementById(id);
    if (container) container.scrollTop = container.scrollHeight;
};
