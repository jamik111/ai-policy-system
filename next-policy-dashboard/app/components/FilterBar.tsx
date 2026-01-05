'use client';

import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Search } from 'lucide-react';

export default function FilterBar() {
    const { filter, setFilter } = useDashboard();

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <Search size={16} />
            </div>
            <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by agent, task ID, or result..."
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
        </div>
    );
}
