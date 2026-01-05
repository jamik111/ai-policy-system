import { AgentRunner } from './agents/agentRunner';
import { Logger } from './audit/logger';

async function bootstrap() {
    console.log("=== AI Policy Management System (PMS) Bootstrap ===");

    const processingAgent = new AgentRunner("agent-001", "data-processing");
    const untrustedAgent = new AgentRunner("agent-002", "untrusted-type");

    // Case 1: Successful execution
    console.log("\n--- TEST CASE 1: Valid Request ---");
    await processingAgent.runTask("task-101", "Process user data", { id: 1, name: "John" });

    // Case 2: Blocked by Global Policy (Sensitive data)
    console.log("\n--- TEST CASE 2: Blocked by Global (Sensitive) ---");
    await processingAgent.runTask("task-102", "Access sensitive info", { id: 2 });

    // Case 3: Blocked by Agent Policy (Unauthorized type)
    console.log("\n--- TEST CASE 3: Blocked by Agent Type ---");
    await untrustedAgent.runTask("task-103", "Standard task", { id: 3 });

    // Case 4: Blocked by Task Policy (Missing data)
    console.log("\n--- TEST CASE 4: Blocked by Task (No Data) ---");
    await processingAgent.runTask("task-104", "Empty task", null);

    console.log("\n=== Bootstrap Complete ===");
}

bootstrap().catch(err => {
    Logger.warn(`Fatal error during bootstrap: ${err.message}`);
});
