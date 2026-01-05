import type { Metadata } from 'next';
import { DashboardProvider } from './context/DashboardContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'AI Policy Management Dashboard',
  description: 'Real-time policy enforcement and monitoring system for AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        <DashboardProvider>{children}</DashboardProvider>
      </body>
    </html>
  );
}
