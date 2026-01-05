"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enforcer = void 0;
class Enforcer {
    /**
     * Final runtime enforcement check before execution.
     * Can be used for immediate kill-switches or hardware-level blocks.
     */
    static enforce(context, result) {
        if (!result.allowed) {
            console.warn(`[ENFORCEMENT] Blocked task for Agent ${context.agentId}: ${result.reason}`);
            return false;
        }
        return true;
    }
}
exports.Enforcer = Enforcer;
