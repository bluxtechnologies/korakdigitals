import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CurrencyItem } from './types';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
    currencies: CurrencyItem[];
    activeCurrency: CurrencyItem;
    onSelectCurrency: (currency: CurrencyItem) => void;
    isSwitching?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
    currencies,
    activeCurrency,
    onSelectCurrency,
    isSwitching = false,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                        Display Currency
                    </span>
                    <span className="text-xs font-medium text-text-secondary mt-0.5 block">
                        {activeCurrency.name || activeCurrency.code} ({activeCurrency.symbol})
                    </span>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isSwitching}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-base hover:bg-bg-surface-hover border border-border-subtle text-xs font-bold text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Select currency"
                    >
                        <span>{activeCurrency.code}</span>
                        <ChevronDown size={14} className={cn('transition-transform duration-200 text-text-muted', isOpen && 'rotate-180')} />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-bg-surface border border-border-subtle shadow-lg p-1.5 z-50 animate-fadeIn">
                            {currencies.map(curr => {
                                const isSelected = curr.id === activeCurrency.id || curr.code === activeCurrency.code;
                                return (
                                    <button
                                        key={curr.id}
                                        type="button"
                                        onClick={() => {
                                            onSelectCurrency(curr);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer',
                                            isSelected
                                                ? 'bg-brand/10 text-brand font-bold'
                                                : 'text-text-primary hover:bg-bg-surface-hover font-medium'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-text-muted">{curr.symbol}</span>
                                            <span>{curr.code}</span>
                                        </div>
                                        {isSelected && <Check size={14} className="text-brand shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
