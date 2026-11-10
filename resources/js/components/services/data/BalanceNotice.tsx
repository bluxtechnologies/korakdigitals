import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface BalanceNoticeProps {
    onChangePlan?: () => void;
}

export const BalanceNotice: React.FC<BalanceNoticeProps> = ({ onChangePlan }) => {
    return (
        <div className="p-3 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-error" />
                <span>Your wallet balance is insufficient for this purchase.</span>
            </div>
            <div className="flex items-center gap-3">
                {onChangePlan && (
                    <button
                        type="button"
                        onClick={onChangePlan}
                        className="font-bold underline text-xs cursor-pointer"
                    >
                        Change Plan
                    </button>
                )}
                <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                    Add Money
                </Link>
            </div>
        </div>
    );
};
