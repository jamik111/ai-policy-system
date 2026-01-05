'use client';

import { useDashboard } from '../context/DashboardContext';
import TaskCard from '../components/TaskCard';
import AgentCard from '../components/AgentCard';
import AnalyticsChart from '../components/AnalyticsChart';
import AuditLogComponent from '../components/AuditLog';

export default function DashboardPage() {
  const dashboard = useDashboard();

  // 🔐 Safety check (VERY IMPORTANT)
  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Dashboard provider not found
      </div>
    );
  }

  const {
    stats = {
      totalTasks: 0,
      violations: 0,
      successRate: 0,
    },
    logs = [],
    agents = [],
    selectedLog,
  } = dashboard;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ===== Header ===== */}
        <header>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            AI Policy Management Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time policy enforcement and monitoring for AI agents
          </p>
        </header>

        {/* ===== Metrics ===== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsChart title="Total Tasks" value={stats.totalTasks} trend="up" />
          <AnalyticsChart
            title="Policy Violations"
            value={stats.violations}
            trend={stats.violations > 5 ? 'up' : 'stable'}
            color="red"
          />
          <AnalyticsChart
            title="Active Agents"
            value={agents.length}
            trend="stable"
            color="green"
          />
          <AnalyticsChart
            title="Success Rate"
            value={`${stats.successRate}%`}
            trend={stats.successRate > 80 ? 'up' : 'down'}
            color="purple"
          />
        </section>

        {/* ===== Agents ===== */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Agent Status
          </h2>

          {agents.length === 0 ? (
            <div className="text-gray-500">No agents available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard key={agent.id} {...agent} />
              ))}
            </div>
          )}
        </section>

        {/* ===== Tasks + Details ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Recent Tasks
            </h2>

            {logs.length === 0 ? (
              <div className="text-gray-500">No tasks yet</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.slice(0, 5).map((log) => (
                  <TaskCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>

          {/* Task Details */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Task Details
            </h2>

            {!selectedLog ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500">
                Select a task to view details
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  {selectedLog.taskName}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Agent:</strong> {selectedLog.agentId}</p>
                  <p>
                    <strong>Action:</strong>{' '}
                    <span
                      className={
                        selectedLog.action === 'allow'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {selectedLog.action.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Duration:</strong> {selectedLog.duration} ms</p>
                  <p>
                    <strong>Timestamp:</strong>{' '}
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>

                  {selectedLog.triggeredRules?.length > 0 && (
                    <div>
                      <p className="font-semibold mt-3 mb-2">
                        Triggered Rules
                      </p>
                      <ul className="space-y-1">
                        {selectedLog.triggeredRules.map((rule, idx) => (
                          <li
                            key={idx}
                            className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded"
                          >
                            {rule.ruleName} (Priority {rule.priority})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== Audit Log ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Audit Log
          </h2>
          <AuditLogComponent logs={logs} />
        </section>
      </div>
    </main>
  );
}
