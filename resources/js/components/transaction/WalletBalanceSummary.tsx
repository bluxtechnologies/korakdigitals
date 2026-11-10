import * as React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface WalletBalanceSummaryProps {
    currentBalance: number;
    remainingBalance: number;
    currencySymbol?: string;
    isInsufficient?: boolean;
}

export const WalletBalanceSummary: React.FC<WalletBalanceSummaryProps> = ({
    currentBalance,
    remainingBalance,
    currencySymbol = '₦',
    isInsufficient = false,
}) => {
    return (
        <div className="space-y-2">
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
                        {currencySymbol}{Math.max(0, remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {isInsufficient && (
                <div className="p-3 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between animate-in fade-in-50">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Insufficient wallet balance</span>
                    </div>
                    <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                        Add Money →
                    </Link>
                </div>
            )}
        </div>
    );
};
