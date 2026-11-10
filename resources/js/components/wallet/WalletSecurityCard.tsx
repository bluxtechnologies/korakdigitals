import * as React from 'react';
import { ShieldCheck } from 'lucide-react';

export const WalletSecurityCard: React.FC = () => {
    return (
        <div className="bg-brand/[0.04] border border-brand/20 rounded-2xl p-4.5 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} className="stroke-[2.2]" />
            </div>
            <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-text-primary">
                    Your Wallet is Secure
                </h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                    All transactions are protected with industry-standard security.
                </p>
            </div>
        </div>
    );
};
