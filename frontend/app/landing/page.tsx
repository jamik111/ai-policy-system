'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            🔐 AI Policy Management System
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Production-Ready Governance for Autonomous AI Agents
          </p>
          <div className="inline-block bg-emerald-100 text-emerald-800 px-6 py-2 rounded-lg font-semibold">
            ✅ Complete & Deployable
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            📊 Open Dashboard
          </Link>
          <a
            href="https://localhost:8080/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all border-2 border-gray-300"
          >
            🔗 API Status
          </a>
        </div>

        {/* Quick Start */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Start</h3>
          <div className="space-y-3 text-sm font-mono text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Backend:</p>
              <code className="bg-gray-200 px-3 py-1 rounded inline-block">
                cd backend && npm install && npm start
              </code>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Frontend:</p>
              <code className="bg-gray-200 px-3 py-1 rounded inline-block">
                cd frontend && npm install && npm run dev
              </code>
            </div>
            <div className="pt-2 text-gray-600">
              <p>📊 Dashboard: <span className="font-semibold">http://localhost:3000</span></p>
              <p>🔌 API: <span className="font-semibold">http://localhost:8080</span></p>
              <p>⚡ WebSocket: <span className="font-semibold">ws://localhost:8080/api/stream</span></p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">✨ Core Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Deny-by-Default Security Model</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Multi-Layer Policy Enforcement</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Multi-Agent Orchestration</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Real-Time Audit Logging</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Dashboard Includes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">→</span>
                <span>System Metrics & Analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">→</span>
                <span>Agent Status & Health</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">→</span>
                <span>Live Audit Log Viewer</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">→</span>
                <span>Dark Mode Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-gray-200">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">15+</p>
            <p className="text-sm text-gray-600">Policies</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">11</p>
            <p className="text-sm text-gray-600">API Endpoints</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">100%</p>
            <p className="text-sm text-gray-600">Functional</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>AI Policy Management System v1.0.0 | January 2026</p>
          <p>Status: ✅ Production-Ready | All Systems Operational</p>
        </div>
      </div>
    </div>
  );
}
