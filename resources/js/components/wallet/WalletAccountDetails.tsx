import * as React from 'react';
import { CreditCard, Copy, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { FundingAccountData, WalletAccount } from './types';
import { cn } from '@/lib/utils';

interface WalletAccountDetailsProps {
    account?: WalletAccount | null;
    fundingAccount?: FundingAccountData | null;
    userName?: string;
}

export const WalletAccountDetails: React.FC<WalletAccountDetailsProps> = ({
    account,
    fundingAccount,
    userName,
}) => {
    const toast = useToast();
    const [copied, setCopied] = React.useState(false);

    // Prioritize funding account (virtual account), fallback to public reference / wallet defaults
    const accountName = fundingAccount?.account_name || (userName ? `${userName} (Korak Wallet)` : 'Korak Wallet');
    const hasAccountNum = Boolean(fundingAccount?.account_number || account?.public_reference);
    const rawAccountNumber = fundingAccount?.account_number || account?.public_reference || 'Awaiting Allocation';
    const bankName = fundingAccount?.bank_name || 'Korak Digitals';

    const handleCopy = () => {
        if (!hasAccountNum) {
            toast.error('Virtual account is currently being provisioned. Please check back shortly.');
            return;
        }
        navigator.clipboard.writeText(rawAccountNumber);
        setCopied(true);
        toast.success(`Account number ${rawAccountNumber} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id="wallet-account-details" className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
            {/* Card Header with Icon */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <CreditCard size={17} className="stroke-[2.2]" />
                </div>
                <h2 className="text-sm font-bold text-text-primary tracking-tight">
                    Wallet Account Details
                </h2>
            </div>

            {/* Account Details Rows */}
            <div className="space-y-3 divide-y divide-border-subtle/60 pt-1">
                {/* Account Name */}
                <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-text-muted block">
                        Account Name
                    </span>
                    <span className="text-xs font-bold text-text-primary block">
                        {accountName}
                    </span>
                </div>

                {/* Account Number with Copy Button */}
                <div className="pt-2.5 space-y-0.5">
                    <span className="text-[11px] font-medium text-text-muted block">
                        Account Number
                    </span>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold font-mono text-text-primary tracking-wide">
                            {rawAccountNumber}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!hasAccountNum}
                            className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-brand hover:bg-brand/10 transition-colors cursor-pointer",
                                !hasAccountNum && "opacity-40 cursor-not-allowed hover:bg-transparent"
                            )}
                            title={hasAccountNum ? "Copy account number" : "Account awaiting allocation"}
                        >
                            {copied ? (
                                <>
                                    <Check size={12} className="text-brand" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={12} />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Bank */}
                <div className="pt-2.5 space-y-0.5">
                    <span className="text-[11px] font-medium text-text-muted block">
                        Bank
                    </span>
                    <span className="text-xs font-bold text-text-primary block">
                        {bankName}
                    </span>
                </div>
            </div>

            {/* Mint Info Callout */}
            <div className="p-3 rounded-xl bg-brand/[0.06] border border-brand/20 flex items-start gap-2 text-xs text-brand">
                <Info size={15} className="shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-medium">
                    Use this account details to fund your wallet via bank transfer.
                </span>
            </div>
        </div>
    );
};
