import * as React from 'react';
import { cn } from '@/lib/utils';
import { BundleFilterCategory } from './types';

interface PlanFiltersProps {
    selectedCategory: BundleFilterCategory;
    onSelectCategory: (category: BundleFilterCategory) => void;
}

const CATEGORIES: { id: BundleFilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

export const PlanFilters: React.FC<PlanFiltersProps> = ({
    selectedCategory,
    onSelectCategory,
}) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                            isSelected
                                ? "bg-brand text-brand-foreground shadow-2xs"
                                : "bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-bg-surface-hover"
                        )}
                    >
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
};
