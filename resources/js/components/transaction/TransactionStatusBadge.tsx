import * as React from 'react';
import { cn } from '@/lib/utils';
import { TransactionStatus } from './types';

interface TransactionStatusBadgeProps {
    status: TransactionStatus;
    className?: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
    status,
    className,
}) => {
    const config = React.useMemo(() => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Completed',
                    classes: 'bg-success-bg text-success border-success-border/60',
                };
            case 'processing':
                return {
                    label: 'Processing',
                    classes: 'bg-brand-subtle text-brand border-brand/30 animate-pulse',
                };
            case 'pending':
                return {
                    label: 'Pending',
                    classes: 'bg-warning-bg text-warning border-warning-border/60',
                };
            case 'failed':
                return {
                    label: 'Failed',
                    classes: 'bg-error-bg text-error border-error-border/60',
                };
            case 'refunded':
                return {
                    label: 'Refunded',
                    classes: 'bg-info-bg text-info border-info-border/60',
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    classes: 'bg-bg-base text-text-muted border-border-subtle',
                };
            default:
                return {
                    label: 'Awaiting Payment',
                    classes: 'bg-bg-base text-text-secondary border-border-subtle',
                };
        }
    }, [status]);

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize tracking-tight",
                config.classes,
                className
            )}
        >
            {config.label}
        </span>
    );
};
