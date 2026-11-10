import * as React from 'react';
import { Link } from '@inertiajs/react';
import { Wallet, FileText, ChevronRight } from 'lucide-react';

export const QuickActionsCard: React.FC = () => {
    return (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-3.5">
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Quick Actions
            </h2>

            <div className="space-y-2.5">
                {/* Fund Wallet CTA */}
                <Link
                    href="/user/wallet/fund"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand hover:bg-brand-hover text-brand-foreground transition-colors shadow-xs group active:scale-[0.96]"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                            <Wallet size={15} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold">Fund Wallet</span>
                    </div>
                    <ChevronRight size={16} className="text-white/80 group-hover:translate-x-0.5 transition-transform duration-150" aria-hidden="true" />
                </Link>

                {/* View Statement CTA */}
                <Link
                    href="/user/wallet/history"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-bg-base hover:bg-bg-surface-hover border border-border-subtle text-text-primary transition-colors group active:scale-[0.96]"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-subtle flex items-center justify-center text-brand shrink-0">
                            <FileText size={15} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold">View Statement</span>
                    </div>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all duration-150" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
};
