import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
}

interface ToastContextType {
    show: (message: string, type?: ToastType, title?: string) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
}

const noop = () => {};
const fallbackToastContext: ToastContextType = {
    show: noop,
    success: noop,
    error: noop,
    warning: noop,
    info: noop,
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = React.useContext(ToastContext);
    return context || fallbackToastContext;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = React.useState<ToastItem[]>([]);

    const show = React.useCallback((message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, title }]);
        
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const success = React.useCallback((message: string, title?: string) => show(message, 'success', title || 'Success'), [show]);
    const error = React.useCallback((message: string, title?: string) => show(message, 'error', title || 'Error'), [show]);
    const warning = React.useCallback((message: string, title?: string) => show(message, 'warning', title || 'Warning'), [show]);
    const info = React.useCallback((message: string, title?: string) => show(message, 'info', title || 'Notice'), [show]);

    return (
        <ToastContext.Provider value={{ show, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: ToastItem[];
    removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const styles: Record<ToastType, { border: string; progressBar: string; iconColor: string; icon: React.ReactNode }> = {
        success: {
            border: 'border-l-4 border-l-success border-success-border',
            progressBar: 'bg-success',
            iconColor: 'text-success',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14s1 2 3.5 2 3.5-2 3.5-2" />
                    <circle cx="9.5" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
                    <circle cx="14.5" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
            )
        },
        error: {
            border: 'border-l-4 border-l-error border-error-border',
            progressBar: 'bg-error',
            iconColor: 'text-error',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 16s1-2 3.5-2 3.5 2 3.5 2" />
                    <circle cx="9.5" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
                    <circle cx="14.5" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
            )
        },
        warning: {
            border: 'border-l-4 border-l-warning border-warning-border',
            progressBar: 'bg-warning',
            iconColor: 'text-warning',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            )
        },
        info: {
            border: 'border-l-4 border-l-brand border-brand/20',
            progressBar: 'bg-brand',
            iconColor: 'text-brand',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 011-18 9 9 0 011 18z" />
                </svg>
            )
        }
    };

    const container = (
        <div
            className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
            role="region"
            aria-label="Notification toasts"
        >
            {toasts.map((toast) => {
                const style = styles[toast.type];
                const toastRole = toast.type === 'error' ? 'alert' : 'status';
                return (
                    <div
                        key={toast.id}
                        role={toastRole}
                        className={cn(
                            "relative overflow-hidden bg-bg-surface border rounded-md shadow-sm text-xs pointer-events-auto flex items-start gap-3.5 p-4 animate-toastr-slide select-none transition-all hover:shadow-md",
                            style.border
                        )}
                    >
                        <div className={cn("shrink-0 mt-0.5", style.iconColor)}>
                            {style.icon}
                        </div>

                        <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-1">
                            {toast.title && (
                                <span className="font-black text-text-primary text-xs tracking-tight">
                                    {toast.title}
                                </span>
                            )}
                            <span className="text-text-secondary leading-relaxed font-medium break-words">
                                {toast.message}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-0.5 shrink-0 opacity-70 hover:opacity-100"
                            aria-label="Dismiss notification"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Toastr Shrinking Timer Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle/40 overflow-hidden">
                            <div className={cn("h-full animate-toastr-progress", style.progressBar)} />
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return createPortal(container, document.body);
};
