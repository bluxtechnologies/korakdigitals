import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
    className,
    variant = 'info',
    title,
    onClose,
    children,
    ...props
}) => {
    const variants = {
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-error',
        info: 'alert-info'
    };

    const icons = {
        success: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 011-18 9 9 0 011 18z" />
            </svg>
        ),
        warning: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        ),
        error: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 011-18 9 9 0 011 18z" />
            </svg>
        ),
        info: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 011-18 9 9 0 011 18z" />
            </svg>
        )
    };

    const alertRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

    return (
        <div
            role={alertRole}
            className={cn(
                "animate-fadeIn",
                variants[variant],
                className
            )}
            {...props}
        >
            {icons[variant]}
            <div className="flex-1 flex flex-col gap-0.5">
                {title && <span className="font-semibold text-text-primary">{title}</span>}
                <div className="text-text-secondary">{children}</div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss alert"
                    className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer w-4 h-4 flex items-center justify-center self-start"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export { Alert };
