import * as React from 'react';

export const WalletSkeleton: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-4 w-28 bg-border-subtle rounded-md" />
                <div className="h-7 w-36 bg-border-subtle rounded-md" />
                <div className="h-4 w-72 bg-border-subtle rounded-md" />
            </div>

            {/* 2-Column Layout Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Balance Card Skeleton */}
                    <div className="h-52 rounded-2xl bg-border-subtle/80 p-6 space-y-4" />

                    {/* Filter & Search Skeleton */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="h-8 w-16 bg-border-subtle rounded-full" />
                            <div className="h-8 w-24 bg-border-subtle rounded-full" />
                            <div className="h-8 w-24 bg-border-subtle rounded-full" />
                        </div>
                        <div className="h-10 w-full bg-border-subtle rounded-xl" />
                    </div>

                    {/* Transaction Rows Skeleton */}
                    <div className="rounded-2xl border border-border-subtle p-4 space-y-3 bg-bg-surface">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-border-subtle" />
                                    <div className="space-y-1.5">
                                        <div className="h-3.5 w-32 bg-border-subtle rounded-md" />
                                        <div className="h-2.5 w-44 bg-border-subtle rounded-md" />
                                    </div>
                                </div>
                                <div className="h-4 w-20 bg-border-subtle rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column (4 cols) */}
                <div className="lg:col-span-4 space-y-5">
                    <div className="h-16 rounded-2xl bg-border-subtle/80" />
                    <div className="h-48 rounded-2xl bg-border-subtle/80" />
                    <div className="h-32 rounded-2xl bg-border-subtle/80" />
                    <div className="h-20 rounded-2xl bg-border-subtle/80" />
                </div>
            </div>
        </div>
    );
};
