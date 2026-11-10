import * as React from 'react';
import { Link } from '@inertiajs/react';
import { Eye, EyeOff, Wallet, ChevronDown, Info } from 'lucide-react';
import { CurrencyItem } from './types';
import { cn } from '@/lib/utils';

interface WalletBalanceCardProps {
    availableBalance: number;
    primaryCurrency: CurrencyItem;
    availableCurrencies: CurrencyItem[];
    selectedSecondaryCurrency: CurrencyItem;
    convertedBalance: number;
    hideBalance: boolean;
    onToggleHideBalance: () => void;
    onSelectSecondaryCurrency: (currency: CurrencyItem) => void;
    onViewAccountDetails: () => void;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
    availableBalance,
    primaryCurrency,
    availableCurrencies,
    selectedSecondaryCurrency,
    convertedBalance,
    hideBalance,
    onToggleHideBalance,
    onSelectSecondaryCurrency,
    onViewAccountDetails,
}) => {
    const [currencyMenuOpen, setCurrencyMenuOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCurrencyMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currencySymbol = primaryCurrency.symbol || '₦';
    const secondarySymbol = selectedSecondaryCurrency.symbol || '$';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-brand-active text-brand-foreground p-6 sm:p-7 shadow-md border border-brand/40">
            {/* Subtle aesthetic wave background lines */}
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 800 400"
                preserveAspectRatio="none"
            >
                <path
                    d="M 0,220 C 150,180 250,280 400,240 C 550,200 650,260 800,220 L 800,400 L 0,400 Z"
                    fill="currentColor"
                    className="text-rose-400/20"
                />
                <path
                    d="M 0,160 C 200,220 350,140 500,180 C 650,220 720,170 800,190"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-rose-300/30"
                />
                <path
                    d="M 0,190 C 220,250 380,170 540,210 C 680,240 750,200 800,220"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-rose-200/25"
                />
            </svg>

            {/* Top row: Available balance label + eye toggle + watermark wallet icon */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-rose-100/90 tracking-tight">
                        Available Balance
                    </span>
                    <button
                        type="button"
                        onClick={onToggleHideBalance}
                        className="p-1 rounded-md text-rose-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={hideBalance ? 'Show balance' : 'Hide balance'}
                        aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                    >
                        {hideBalance ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    </button>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-rose-200/90 shadow-2xs backdrop-blur-xs">
                    <Wallet size={20} className="stroke-[1.8]" aria-hidden="true" />
                </div>
            </div>

            {/* Main Balance Display */}
            <div className="relative z-10 mt-3 sm:mt-4 space-y-1.5">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono tabular-nums flex items-baseline gap-1">
                    {hideBalance ? (
                        <span>{currencySymbol}••••••</span>
                    ) : (
                        <span>
                            {currencySymbol}
                            {availableBalance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    )}
                </div>

                {/* Converted USD Equivalent */}
                <div className="flex items-center gap-1.5 text-xs text-rose-200/85">
                    <span className="font-mono tabular-nums">
                        ≈ {hideBalance ? '••••' : `${secondarySymbol}${convertedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} {selectedSecondaryCurrency.code}
                    </span>
                    <span className="text-[11px] text-rose-300/70">(Estimated)</span>
                    <span
                        className="inline-flex cursor-help text-rose-300/80 hover:text-white"
                        title="Estimated conversion based on live platform exchange rates."
                    >
                        <Info size={12} aria-hidden="true" />
                    </span>
                </div>
            </div>

            {/* Bottom Row: Currency Selector Pill + Actions */}
            <div className="relative z-10 mt-6 sm:mt-7 flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Currency selector pill button with dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                        aria-haspopup="menu"
                        aria-expanded={currencyMenuOpen}
                        aria-label="Select secondary display currency"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/35 border border-brand/30 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                    >
                        <span>{primaryCurrency.code}</span>
                        <ChevronDown size={13} className={cn('transition-transform duration-200', currencyMenuOpen && 'rotate-180')} aria-hidden="true" />
                    </button>

                    {currencyMenuOpen && (
                        <div
                            role="menu"
                            aria-label="Secondary currencies"
                            onKeyDown={(e) => { if (e.key === 'Escape') setCurrencyMenuOpen(false); }}
                            className="absolute left-0 bottom-full mb-2 w-36 rounded-xl bg-bg-surface text-text-primary shadow-lg border border-border-subtle p-1 z-50 animate-fadeIn"
                            style={{ overscrollBehavior: 'contain' }}
                        >
                            <div className="text-[10px] uppercase font-bold text-text-muted px-2.5 py-1">
                                Display Rate
                            </div>
                            {availableCurrencies.map(curr => (
                                <button
                                    key={curr.id}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onSelectSecondaryCurrency(curr);
                                        setCurrencyMenuOpen(false);
                                    }}
                                    className={cn(
                                        'w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between font-medium hover:bg-bg-surface-hover transition-colors cursor-pointer',
                                        selectedSecondaryCurrency.code === curr.code && 'text-brand font-bold bg-brand/10'
                                    )}
                                >
                                    <span>{curr.code} ({curr.symbol})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action buttons on right */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onViewAccountDetails}
                        className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition-colors cursor-pointer active:scale-[0.96]"
                    >
                        View Account Details
                    </button>

                    <Link
                        href="/user/wallet/fund"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-xs font-bold text-brand-foreground transition-colors shadow-xs cursor-pointer active:scale-[0.96]"
                    >
                        + Add Money
                    </Link>
                </div>
            </div>
        </div>
    );
};
