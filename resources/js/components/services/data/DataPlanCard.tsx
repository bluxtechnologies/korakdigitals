import * as React from 'react';
import { Clock, Check, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParsedDataBundle } from './types';

interface DataPlanCardProps {
    bundle: ParsedDataBundle;
    isSelected: boolean;
    onSelect: (bundle: ParsedDataBundle) => void;
    currencySymbol?: string;
    isUsd?: boolean;
    rate?: number;
}

export const DataPlanCard: React.FC<DataPlanCardProps> = ({
    bundle,
    isSelected,
    onSelect,
    currencySymbol = '₦',
    isUsd = false,
    rate = 1500,
}) => {
    const formattedPrice = isUsd
        ? `$${(bundle.price_ngn / Math.max(rate, 1)).toFixed(2)}`
        : `₦${bundle.price_ngn.toLocaleString()}`;

    return (
        <button
            type="button"
            onClick={() => onSelect(bundle)}
            className={cn(
                "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none bg-bg-surface min-h-[84px]",
                isSelected
                    ? "border-brand ring-1 ring-brand bg-brand/[0.02]"
                    : "border-border-subtle hover:border-border-strong hover:bg-bg-surface-hover"
            )}
        >
            <div className="flex items-start justify-between w-full gap-2">
                <div className="min-w-0 flex-1">
                    <span className="text-xs md:text-sm font-bold text-text-primary block leading-snug">
                        {bundle.display_name}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs md:text-sm font-black font-mono text-text-primary">
                        {formattedPrice}
                    </span>
                    {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs animate-in zoom-in-75">
                            <Check size={12} strokeWidth={3} />
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata (Validity + Total Allowance) */}
            <div className="flex items-center gap-3 text-[11px] text-text-muted mt-2">
                <div className="flex items-center gap-1">
                    <Clock size={12} className="shrink-0 text-text-muted" />
                    <span>{bundle.validity}</span>
                </div>
                <span className="text-border-strong">•</span>
                <div className="flex items-center gap-1">
                    <Layers size={12} className="shrink-0 text-text-muted" />
                    <span>{bundle.total_allowance}</span>
                </div>
            </div>
        </button>
    );
};
