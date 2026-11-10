import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetworkItem } from './types';

interface NetworkCardProps {
    network: NetworkItem;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({
    network,
    isSelected,
    onSelect,
}) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(network.id)}
            className={cn(
                "p-3.5 md:p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[105px] cursor-pointer bg-bg-surface",
                isSelected
                    ? "border-brand ring-1 ring-brand bg-brand/[0.02]"
                    : "border-border-subtle hover:border-border-strong hover:bg-bg-surface-hover"
            )}
        >
            <div className="flex items-start justify-between w-full">
                <div className="w-11 h-11 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {network.logo ? (
                        <img
                            src={network.logo}
                            alt={network.name}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <span
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: network.color }}
                        />
                    )}
                </div>

                {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs animate-in zoom-in-75">
                        <Check size={12} strokeWidth={3} />
                    </div>
                )}
            </div>

            <div className="mt-3">
                <span className="text-xs md:text-sm font-bold text-text-primary block leading-tight">
                    {network.name}
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                    Data Bundles
                </span>
            </div>
        </button>
    );
};
