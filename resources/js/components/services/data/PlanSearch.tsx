import * as React from 'react';
import { Search, X } from 'lucide-react';

interface PlanSearchProps {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
}

export const PlanSearch: React.FC<PlanSearchProps> = ({
    value,
    onChange,
    onClear,
}) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
            </div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Search data plans..."
                aria-label="Search data plans"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            {value.length > 0 && (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
};
