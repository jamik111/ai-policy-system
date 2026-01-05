import type { Metadata } from 'next'
import { ToastProvider } from './contexts/ToastContext';
import { SessionProvider } from './contexts/SessionContext';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: 'AI Policy Governance Dashboard',
    description: 'Real-time AI agent monitoring and policy enforcement system.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <SessionProvider>
                        {children}
                    </SessionProvider>
                </ToastProvider>
            </body>
        </html>
    )
}
