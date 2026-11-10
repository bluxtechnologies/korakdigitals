import * as React from 'react';
import { CheckCircle2, Clock, AlertCircle, RotateCcw, Loader2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionStatus } from './types';

interface StatusIconProps {
    status: TransactionStatus;
    size?: number;
    className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
    status,
    size = 28,
    className,
}) => {
    switch (status) {
        case 'completed':
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-success-bg text-success border border-success-border/80 flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <CheckCircle2 size={size} className="stroke-[2.2]" />
                </div>
            );
        case 'processing':
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <Loader2 size={size} className="animate-spin stroke-[2.2]" />
                </div>
            );
        case 'pending':
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-warning-bg text-warning border border-warning-border/80 flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <Clock size={size} className="stroke-[2.2]" />
                </div>
            );
        case 'failed':
        case 'cancelled':
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-error-bg text-error border border-error-border/80 flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <AlertCircle size={size} className="stroke-[2.2]" />
                </div>
            );
        case 'refunded':
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-info-bg text-info border border-info-border/80 flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <RotateCcw size={size} className="stroke-[2.2]" />
                </div>
            );
        default:
            return (
                <div className={cn("w-14 h-14 rounded-2xl bg-bg-base text-text-muted border border-border-subtle flex items-center justify-center shrink-0 shadow-2xs", className)}>
                    <CreditCard size={size} className="stroke-[2.2]" />
                </div>
            );
    }
};
