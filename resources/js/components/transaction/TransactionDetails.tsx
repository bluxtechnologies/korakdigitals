import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { TransactionItemDetail } from './types';

interface TransactionDetailsProps {
    items: TransactionItemDetail[];
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ items }) => {
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

    const handleCopy = (val: string, index: number) => {
        navigator.clipboard.writeText(val).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-0 divide-y divide-border-subtle/60 text-xs">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                    <span className="text-text-secondary font-medium shrink-0 pr-2">
                        {item.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-right min-w-0">
                        <span className={`font-bold text-text-primary ${item.isMono ? 'font-mono tabular-nums select-all' : ''} truncate`}>
                            {item.value}
                        </span>
                        {item.copyable && (
                            <button
                                type="button"
                                onClick={() => handleCopy(String(item.value), idx)}
                                aria-label={`Copy ${item.label}`}
                                className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                                {copiedIndex === idx ? (
                                    <Check size={12} className="text-brand stroke-[3]" />
                                ) : (
                                    <Copy size={12} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
