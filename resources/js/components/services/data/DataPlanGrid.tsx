import * as React from 'react';
import { ParsedDataBundle } from './types';
import { DataPlanCard } from './DataPlanCard';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

interface DataPlanGridProps {
    bundles: ParsedDataBundle[];
    selectedBundle: ParsedDataBundle | null;
    onSelectBundle: (bundle: ParsedDataBundle) => void;
    isLoading: boolean;
    networkName: string;
    onResetFilters?: () => void;
    currencySymbol?: string;
    isUsd?: boolean;
    rate?: number;
}

export const DataPlanGrid: React.FC<DataPlanGridProps> = ({
    bundles,
    selectedBundle,
    onSelectBundle,
    isLoading,
    networkName,
    onResetFilters,
    currencySymbol,
    isUsd,
    rate,
}) => {
    if (isLoading) {
        return <LoadingState networkName={networkName} />;
    }

    if (bundles.length === 0) {
        return <EmptyState onReset={onResetFilters} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {bundles.map(bundle => (
                <DataPlanCard
                    key={bundle.package_code}
                    bundle={bundle}
                    isSelected={selectedBundle?.package_code === bundle.package_code}
                    onSelect={onSelectBundle}
                    currencySymbol={currencySymbol}
                    isUsd={isUsd}
                    rate={rate}
                />
            ))}
        </div>
    );
};
