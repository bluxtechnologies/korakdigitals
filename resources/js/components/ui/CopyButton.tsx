import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    label?: string;
    copiedLabel?: string;
    variant?: 'icon' | 'button' | 'pill';
    size?: 'xs' | 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
    text,
    label = 'Copy',
    copiedLabel = 'Copied!',
    variant = 'icon',
    size = 'sm',
    className,
    ...props
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard', err);
        }
    };

    const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : 16;

    if (variant === 'pill') {
        return (
            <button
                type="button"
                onClick={handleCopy}
                title={copied ? copiedLabel : `Copy: ${text}`}
                className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none',
                    copied
                        ? 'bg-success-bg text-success border border-success-border scale-95'
                        : 'bg-bg-base text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle active:scale-[0.96]',
                    className
                )}
                aria-label={copied ? copiedLabel : (props['aria-label'] || label || `Copy ${text}`)}
                {...props}
            >
                {copied ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width={iconSize} height={iconSize}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{copiedLabel}</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width={iconSize} height={iconSize}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        <span>{label}</span>
                    </>
                )}
            </button>
        );
    }

    if (variant === 'button') {
        return (
            <button
                type="button"
                onClick={handleCopy}
                className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer border select-none',
                    copied
                        ? 'bg-success-bg text-success border-success-border'
                        : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border-border-subtle active:scale-[0.96]',
                    className
                )}
                aria-label={copied ? copiedLabel : (props['aria-label'] || label || `Copy ${text}`)}
                {...props}
            >
                {copied ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width={iconSize} height={iconSize}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{copiedLabel}</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width={iconSize} height={iconSize}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        <span>{label}</span>
                    </>
                )}
            </button>
        );
    }

    // Default icon variant
    return (
        <button
            type="button"
            onClick={handleCopy}
            title={copied ? copiedLabel : `Copy: ${text}`}
            className={cn(
                'p-1.5 rounded transition-all cursor-pointer inline-flex items-center justify-center shrink-0',
                copied
                    ? 'bg-success-bg text-success scale-105'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-surface-hover active:scale-[0.96]',
                className
            )}
            aria-label={copied ? copiedLabel : (props['aria-label'] || `Copy ${text}`)}
            {...props}
        >
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width={iconSize} height={iconSize}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width={iconSize} height={iconSize}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
            )}
        </button>
    );
};
