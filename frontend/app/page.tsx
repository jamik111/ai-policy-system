'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing after a brief delay to show loading
    const timer = setTimeout(() => {
      router.push('/landing');
    }, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin mb-4 inline-block">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
        <p className="text-xl">Initializing AI Policy Management System...</p>
        <p className="text-sm mt-4 opacity-75">
          Redirecting to <Link href="/landing" className="underline hover:opacity-75">landing page</Link>
        </p>
      </div>
    </div>
  );
}
