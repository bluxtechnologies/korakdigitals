import * as React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { TransactionStatus } from './types';

interface TransactionTimelineProps {
    status: TransactionStatus;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ status }) => {
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';
    const isRefunded = status === 'refunded';

    const steps = [
        { label: 'Order Placed', state: 'done' },
        { label: 'Wallet Debited', state: isFailed ? 'failed' : 'done' },
        {
            label: isRefunded ? 'Refunded' : isFailed ? 'Failed' : isCompleted ? 'Completed' : 'Processing',
            state: isCompleted || isRefunded ? 'done' : isFailed ? 'failed' : 'current',
        },
    ];

    return (
        <div className="py-2">
            <div className="flex items-center justify-between relative">
                {/* Connecting bar */}
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-border-subtle z-0" />

                {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center relative z-10 space-y-1.5">
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                step.state === 'done'
                                    ? 'bg-brand text-white shadow-2xs'
                                    : step.state === 'failed'
                                    ? 'bg-error text-white'
                                    : 'bg-brand-subtle text-brand border border-brand/30 animate-pulse'
                            }`}
                        >
                            {step.state === 'done' ? (
                                <Check size={12} strokeWidth={3} />
                            ) : step.state === 'failed' ? (
                                <AlertCircle size={12} />
                            ) : (
                                <Clock size={12} />
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-text-secondary whitespace-nowrap">
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
