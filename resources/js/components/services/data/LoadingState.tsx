import * as React from 'react';

interface LoadingStateProps {
    networkName?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ networkName }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3.5">
            {[1, 2, 3, 4].map(n => (
                <div
                    key={n}
                    className="p-3.5 rounded-xl border border-border-subtle bg-bg-surface flex flex-col justify-between min-h-[84px] animate-pulse space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-4 bg-border-subtle rounded w-3/5" />
                        <div className="h-4 bg-border-subtle rounded w-1/5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 bg-border-subtle rounded w-16" />
                        <div className="h-3 bg-border-subtle rounded w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
};
