import * as React from 'react';
import { Search, X } from 'lucide-react';

interface TransactionSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

export const TransactionSearch: React.FC<TransactionSearchProps> = ({
    searchQuery,
    onSearchChange,
    placeholder = 'Search transactions...',
}) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
            </div>

            <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs transition-colors"
            />

            {searchQuery && (
                <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                    title="Clear search"
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};
