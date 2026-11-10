import * as React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, ChevronRight } from 'lucide-react';
import { LedgerTransaction } from './types';
import { cn } from '@/lib/utils';

interface TransactionListItemProps {
    transaction: LedgerTransaction;
    displaySymbol: string;
    onSelect: (transaction: LedgerTransaction) => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
    transaction,
    displaySymbol,
    onSelect,
}) => {
    const isCredit = transaction.type === 'credit';
    const isPending = transaction.status === 'pending';

    // Format title
    const title = transaction.description
        || (isCredit ? 'Wallet Funded' : (transaction.category ? transaction.category.replace(/_/g, ' ').toUpperCase() : 'Wallet Payment'));

    // Format date string
    const dateFormatted = new Date(transaction.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const subtitle = `${transaction.category ? transaction.category.replace(/_/g, ' ') : (isCredit ? 'Deposit' : 'Purchase')} • ${dateFormatted}`;

    const rawAmount = Number(transaction.amount);

    return (
        <div
            onClick={() => onSelect(transaction)}
            className="px-4 py-3.5 sm:py-4 flex items-center justify-between gap-3 hover:bg-bg-surface-hover/60 transition-colors cursor-pointer group"
            role="button"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(transaction);
                }
            }}
        >
            {/* Left: Type Icon + Title / Subtitle */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                    className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                        isPending
                            ? 'bg-warning-bg text-warning border-warning-border'
                            : isCredit
                            ? 'bg-success-bg text-success border-success-border'
                            : 'bg-bg-surface-hover text-text-secondary border-border-subtle'
                    )}
                >
                    {isPending ? (
                        <Clock size={16} className="stroke-[2.2]" aria-hidden="true" />
                    ) : isCredit ? (
                        <ArrowDownLeft size={16} className="stroke-[2.2]" aria-hidden="true" />
                    ) : (
                        <ArrowUpRight size={16} className="stroke-[2.2]" aria-hidden="true" />
                    )}
                </div>

                <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-text-primary truncate block capitalize">
                        {title}
                    </span>
                    <span className="text-[11px] text-text-muted truncate block mt-0.5 font-medium">
                        {subtitle}
                    </span>
                </div>
            </div>

            {/* Middle & Right: Status Badge + Amount + Chevron */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Status Badge */}
                <div className="hidden sm:block">
                    {isPending ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-warning-bg text-warning border border-warning-border/60">
                            Pending
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success-bg text-success border border-success-border/60">
                            Completed
                        </span>
                    )}
                </div>

                {/* Amount */}
                <div className="text-right">
                    <span
                        className={cn(
                            'text-xs sm:text-sm font-black font-mono tabular-nums block',
                            isCredit ? 'text-success' : 'text-text-primary'
                        )}
                    >
                        {isCredit ? '+' : '-'}{displaySymbol}
                        {rawAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                </div>

                {/* Chevron */}
                <ChevronRight size={15} className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" aria-hidden="true" />
            </div>
        </div>
    );
};
