import * as React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
    onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
    return (
        <div className="p-8 text-center bg-bg-surface border border-border-subtle rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
                <SearchX size={20} />
            </div>
            <div>
                <p className="text-xs md:text-sm font-bold text-text-primary">
                    No data plans found
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                    Try adjusting your search terms or category filter.
                </p>
            </div>
            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center text-xs font-bold text-brand hover:underline cursor-pointer pt-1"
                >
                    Reset Search & Filters
                </button>
            )}
        </div>
    );
};
