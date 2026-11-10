import * as React from 'react';
import { Wallet, Zap, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { NetworkItem, ParsedDataBundle } from './types';

interface OrderSummaryProps {
    network: NetworkItem;
    selectedBundle: ParsedDataBundle | null;
    recipientPhone: string;
    currentBalance: number;
    currencySymbol?: string;
    isUsd?: boolean;
    rate?: number;
    isBalanceInsufficient: boolean;
    onEdit?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    network,
    selectedBundle,
    recipientPhone,
    currentBalance,
    currencySymbol = '₦',
    isUsd = false,
    rate = 1500,
    isBalanceInsufficient,
}) => {
    const rawPrice = selectedBundle?.price_ngn || 0;
    const totalNgn = rawPrice;

    const payableAmount = isUsd
        ? Number((totalNgn / Math.max(rate, 1)).toFixed(2))
        : totalNgn;

    const remainingBalance = Math.max(0, currentBalance - payableAmount);

    return (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-text-primary">
                Order Summary
            </h3>

            {/* Selected Network Preview Box */}
            <div className="bg-bg-base rounded-xl p-3.5 flex items-center gap-3.5 border border-border-subtle/60">
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
                <div>
                    <h4 className="text-sm font-bold text-text-primary leading-tight">
                        {network.name}
                    </h4>
                    <span className="text-xs text-text-muted mt-0.5 block">
                        Selected Network
                    </span>
                </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3.5 text-xs md:text-sm">
                <div className="flex items-center justify-between text-text-secondary">
                    <span>Data Plan</span>
                    <span className="font-bold text-text-primary text-right max-w-[200px] truncate">
                        {selectedBundle?.display_name || '—'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-text-secondary">
                    <span>Validity</span>
                    <span className="font-bold text-text-primary">
                        {selectedBundle?.validity || '—'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-text-secondary">
                    <span>Recipient</span>
                    <span className="font-bold font-mono text-text-primary">
                        {recipientPhone || '08012345678'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-text-secondary">
                    <span>Plan Price</span>
                    <span className="font-bold font-mono text-text-primary">
                        ₦{rawPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="border-t border-border-subtle pt-3.5 flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">
                        Total
                    </span>
                    <div className="text-right">
                        <span className="text-lg font-black text-text-primary font-mono block leading-tight">
                            ₦{totalNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {isUsd && (
                            <span className="text-[11px] text-text-muted font-mono block mt-0.5">
                                ≈ {currencySymbol}{payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Embedded Wallet Balance Card */}
            <div className="rounded-xl p-3.5 bg-brand/[0.04] border border-brand/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-bg-surface border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-2xs">
                        <Wallet size={18} />
                    </div>
                    <div>
                        <span className="text-[11px] text-text-secondary font-medium block leading-tight">
                            Wallet Balance
                        </span>
                        <span className="text-xs font-bold text-text-primary font-mono block mt-0.5">
                            {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[11px] text-text-secondary font-medium block leading-tight">
                        After purchase
                    </span>
                    <span className="text-xs font-bold text-text-primary font-mono block mt-0.5">
                        {currencySymbol}{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Insufficient Balance Alert */}
            {isBalanceInsufficient && (
                <div className="p-3 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Insufficient balance</span>
                    </div>
                    <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                        Add Money →
                    </Link>
                </div>
            )}

            {/* Reassurance line */}
            <div className="pt-1 flex items-center gap-2 text-xs text-text-muted">
                <Zap size={14} className="text-brand shrink-0" />
                <span>Usually delivered within a few seconds.</span>
            </div>
        </div>
    );
};

export const MobileOrderSummary: React.FC<OrderSummaryProps> = ({
    network,
    selectedBundle,
    recipientPhone,
    currentBalance,
    currencySymbol = '₦',
    isUsd = false,
    rate = 1500,
    isBalanceInsufficient,
    onEdit,
}) => {
    const rawPrice = selectedBundle?.price_ngn || 0;
    const discount = rawPrice > 0 ? (selectedBundle?.discount_ngn || 1) : 0;
    const totalNgn = Math.max(0, rawPrice - discount);

    return (
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-bold text-text-primary">
                    Order Summary
                </span>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center shrink-0">
                        {network.logo ? (
                            <img
                                src={network.logo}
                                alt={network.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: network.color }}
                            />
                        )}
                    </div>
                    <div>
                        <span className="text-xs font-bold text-text-primary block leading-tight">
                            {network.name}
                        </span>
                        <span className="text-[11px] text-text-muted block mt-0.5">
                            {selectedBundle?.validity || '1 day'} • {selectedBundle?.total_allowance || '45MB total'}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-xs font-mono text-text-muted line-through block">
                        ₦{rawPrice}
                    </span>
                    <span className="text-sm font-black text-text-primary font-mono block leading-tight">
                        ₦{totalNgn}
                    </span>
                </div>
            </div>

            {isBalanceInsufficient && (
                <div className="p-2.5 rounded-lg bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Insufficient balance</span>
                    </div>
                    <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                        Add Money
                    </Link>
                </div>
            )}
        </div>
    );
};
