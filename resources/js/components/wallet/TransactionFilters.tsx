import * as React from 'react';
import { TransactionFilterType } from './types';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
    activeFilter: TransactionFilterType;
    onSelectFilter: (filter: TransactionFilterType) => void;
    counts?: {
        all: number;
        credit: number;
        debit: number;
    };
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    activeFilter,
    onSelectFilter,
    counts,
}) => {
    const filters: Array<{ id: TransactionFilterType; label: string; count?: number }> = [
        { id: 'all', label: 'All', count: counts?.all },
        { id: 'credit', label: 'Money In', count: counts?.credit },
        { id: 'debit', label: 'Money Out', count: counts?.debit },
    ];

    return (
        <div className="flex items-center gap-2" role="tablist" aria-label="Transaction type filter">
            {filters.map(filter => {
                const isActive = activeFilter === filter.id;
                return (
                    <button
                        key={filter.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onSelectFilter(filter.id)}
                        className={cn(
                            'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none active:scale-[0.96]',
                            isActive
                                ? 'bg-brand text-brand-foreground shadow-2xs font-bold'
                                : 'bg-bg-base hover:bg-bg-surface-hover text-text-secondary border border-border-subtle/70'
                        )}
                    >
                        <span>{filter.label}</span>
                        {typeof filter.count === 'number' && (
                            <span
                                className={cn(
                                    'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums',
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-border-subtle text-text-muted'
                                )}
                            >
                                {filter.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
