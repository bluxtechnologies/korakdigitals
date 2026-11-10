import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { UniversalTransactionData } from './types';

interface TransactionProcessingProps {
    data: UniversalTransactionData;
    message?: string;
}

export const TransactionProcessing: React.FC<TransactionProcessingProps> = ({
    data,
    message = 'Your payment has been received. We are completing your request.',
}) => {
    const serviceType = data.serviceType || 'order';
    const dynamicTitle = `Processing your ${serviceType} purchase`;

    return (
        <div className="py-10 px-4 text-center max-w-md mx-auto space-y-6 select-none animate-in fade-in-50">
            {/* Subtle spinner */}
            <div className="w-16 h-16 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center mx-auto shadow-xs">
                <Loader2 size={32} className="animate-spin stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
                <h2 className="text-lg md:text-xl font-black text-text-primary tracking-tight">
                    {dynamicTitle}
                </h2>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                    {message}
                </p>
            </div>

            {/* Transaction Reference & Destination */}
            <div className="p-4 rounded-xl bg-bg-base border border-border-subtle/80 text-xs space-y-2.5 text-left">
                <div className="flex items-center justify-between text-text-secondary">
                    <span>Service</span>
                    <span className="font-bold text-text-primary">{data.serviceName}</span>
                </div>

                {data.recipient && (
                    <div className="flex items-center justify-between text-text-secondary">
                        <span>{data.recipientLabel || 'Destination'}</span>
                        <span className="font-bold font-mono tabular-nums text-text-primary">{data.recipient}</span>
                    </div>
                )}

                {data.reference && (
                    <div className="flex items-center justify-between text-text-secondary border-t border-border-subtle/60 pt-2 font-mono tabular-nums">
                        <span>Transaction Reference</span>
                        <span className="font-bold text-text-primary select-all">{data.reference}</span>
                    </div>
                )}
            </div>

            <p className="text-[11px] text-text-muted">
                This usually takes a few seconds. Please do not close this window.
            </p>
        </div>
    );
};
