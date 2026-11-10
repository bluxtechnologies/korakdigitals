import * as React from 'react';
import { Copy, Check } from 'lucide-react';

interface TransactionReferenceProps {
    reference: string;
    label?: string;
}

export const TransactionReference: React.FC<TransactionReferenceProps> = ({
    reference,
    label = 'Transaction Reference',
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!reference) return;
        navigator.clipboard.writeText(reference).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex items-center justify-between py-2 border-b border-border-subtle/60 text-xs">
            <span className="text-text-secondary font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums font-bold text-text-primary select-all">
                    {reference}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy reference"
                    title={copied ? 'Copied to clipboard' : 'Copy reference'}
                    className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors cursor-pointer"
                >
                    {copied ? (
                        <Check size={13} className="text-brand stroke-[3]" />
                    ) : (
                        <Copy size={13} />
                    )}
                </button>
            </div>
        </div>
    );
};
