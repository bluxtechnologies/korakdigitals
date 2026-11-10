import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-5xl'
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-fadeIn"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Box */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                className={cn(
                    "relative w-full bg-bg-surface border border-border-subtle rounded-md shadow-lg overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn z-10",
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                    {title ? (
                        <h3 id="modal-title" className="text-base font-semibold text-text-primary">
                            {title}
                        </h3>
                    ) : (
                        <div />
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer w-6 h-6 flex items-center justify-center rounded-xs hover:bg-bg-surface-hover"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex-1 p-5 overflow-y-auto text-sm text-text-secondary"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border-subtle bg-bg-base">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export { Modal };
