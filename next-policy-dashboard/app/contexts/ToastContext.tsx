'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            min-w-[300px] p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-up
                            ${toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' :
                                toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' :
                                    toast.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500 text-white' :
                                        'bg-blue-900/90 border-blue-500 text-white'}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
                        {toast.type === 'warning' && <AlertTriangle size={20} className="text-yellow-400" />}
                        {toast.type === 'info' && <Info size={20} className="text-blue-400" />}

                        <p className="flex-1 text-sm font-medium">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="hover:bg-white/10 p-1 rounded"
                            title="Close Notification"
                            aria-label="Close Notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
