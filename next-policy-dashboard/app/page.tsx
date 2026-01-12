'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Redirect to the main dashboard
    window.location.href = '/dashboard';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading Dashboard...</p>
      </div>
    </div>
  );
}
