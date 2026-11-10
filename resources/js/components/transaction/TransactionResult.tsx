import * as React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, RotateCcw, Home, Headphones, RefreshCw } from 'lucide-react';
import { StatusIcon } from './StatusIcon';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionReference } from './TransactionReference';
import { TransactionDetails } from './TransactionDetails';
import { TransactionTimeline } from './TransactionTimeline';
import { UniversalTransactionData, TransactionActionHandlers } from './types';

interface TransactionResultProps {
    data: UniversalTransactionData;
    handlers?: TransactionActionHandlers;
    isCheckingStatus?: boolean;
}

export const TransactionResult: React.FC<TransactionResultProps> = ({
    data,
    handlers = {},
    isCheckingStatus = false,
}) => {
    const symbol = data.currencySymbol || '₦';
    const status = data.status;
    const serviceType = data.serviceType || 'order';

    // Dynamic Title & Description
    const headerConfig = React.useMemo(() => {
        switch (status) {
            case 'completed':
                return {
                    title: `${data.serviceName} purchase successful`,
                    description: `Your ${serviceType} purchase has been completed.`,
                };
            case 'pending':
                return {
                    title: 'Purchase pending',
                    description: 'Your request has been received and is still being processed.',
                };
            case 'failed':
            case 'cancelled':
                return {
                    title: 'Purchase failed',
                    description: 'We could not complete this purchase.',
                };
            case 'refunded':
                return {
                    title: 'Payment refunded',
                    description: 'Your payment has been returned to your Korak Wallet.',
                };
            default:
                return {
                    title: 'Transaction Details',
                    description: 'Review your purchase summary below.',
                };
        }
    }, [status, data.serviceName, serviceType]);

    // Build items for TransactionDetails
    const detailItems = React.useMemo(() => {
        const items = [];

        if (data.providerName) {
            items.push({ label: 'Provider / Network', value: data.providerName });
        }

        if (data.recipient) {
            items.push({
                label: data.recipientLabel || 'Recipient',
                value: data.recipient,
                isMono: true,
                copyable: true,
            });
        }

        if (data.selectedItemName) {
            items.push({
                label: data.selectedItemLabel || 'Plan / Package',
                value: data.selectedItemName,
            });
        }

        if (data.quantity && data.quantity > 1) {
            items.push({ label: 'Quantity', value: data.quantity });
        }

        if (data.duration) {
            items.push({ label: 'Duration', value: data.duration });
        }

        // Amount paid row
        items.push({
            label: status === 'refunded' ? 'Original Amount' : 'Amount Paid',
            value: `${symbol}${data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            isMono: true,
        });

        if (status === 'refunded' && data.refundAmount !== undefined) {
            items.push({
                label: 'Refund Amount',
                value: `${symbol}${data.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                isMono: true,
            });
        }

        // Date & Time
        const formattedDate = data.date || data.timestamp || new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        items.push({ label: 'Date & Time', value: formattedDate });

        // Add custom details if passed
        if (data.additionalDetails && data.additionalDetails.length > 0) {
            items.push(...data.additionalDetails);
        }

        return items;
    }, [data, status, symbol]);

    return (
        <div className="py-6 px-4 max-w-lg mx-auto space-y-6 select-none animate-in fade-in-50">
            {/* Header Icon & Status Heading */}
            <div className="text-center space-y-3">
                <StatusIcon status={status} className="mx-auto" />

                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                        {headerConfig.title}
                    </h2>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                        {headerConfig.description}
                    </p>
                </div>

                <TransactionStatusBadge status={status} />
            </div>

            {/* Status Timeline */}
            <div className="px-2">
                <TransactionTimeline status={status} />
            </div>

            {/* Failure callout if failed */}
            {(status === 'failed' || status === 'cancelled') && (
                <div className="p-3.5 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error space-y-1">
                    <p className="font-bold">
                        {data.failureReason || 'The network operator could not fulfill this request at this time.'}
                    </p>
                    <p className="text-text-muted text-[11px]">
                        Your wallet was not charged. If funds were deducted, they have been automatically reversed.
                    </p>
                </div>
            )}

            {/* Refunded callout if refunded */}
            {status === 'refunded' && (
                <div className="p-3.5 rounded-xl bg-info-bg/30 border border-info/30 text-xs text-info space-y-1">
                    <p className="font-bold">
                        Full refund credited to your Korak Wallet.
                    </p>
                    <p className="text-text-muted text-[11px]">
                        Your current wallet balance reflects the returned funds.
                    </p>
                </div>
            )}

            {/* Details Card */}
            <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-1">
                {data.reference && (
                    <TransactionReference reference={data.reference} />
                )}
                <TransactionDetails items={detailItems} />
            </div>

            {/* Clear Action Button Hierarchy per state */}
            <div className="space-y-2.5 pt-2">
                {/* 1. Completed State Actions */}
                {status === 'completed' && (
                    <>
                        {data.reference && handlers.onViewTransaction ? (
                            <button
                                type="button"
                                onClick={() => handlers.onViewTransaction?.(data.reference!)}
                                className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.96] cursor-pointer"
                            >
                                <span>View Transaction</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <Link
                                href="/user/wallet/history"
                                className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.96] cursor-pointer"
                            >
                                <span>View in Transaction History</span>
                                <ArrowRight size={16} />
                            </Link>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                            {handlers.onBuyAgain && (
                                <button
                                    type="button"
                                    onClick={handlers.onBuyAgain}
                                    className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] cursor-pointer"
                                >
                                    <RotateCcw size={14} />
                                    <span>Buy Again</span>
                                </button>
                            )}

                            <Link
                                href="/user/dashboard"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] text-center"
                            >
                                <Home size={14} />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </>
                )}

                {/* 2. Pending State Actions */}
                {status === 'pending' && (
                    <>
                        <button
                            type="button"
                            onClick={() => handlers.onCheckStatus?.(data.reference || '')}
                            disabled={isCheckingStatus}
                            className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw size={15} className={isCheckingStatus ? 'animate-spin' : ''} />
                            <span>{isCheckingStatus ? 'Checking Status...' : 'Check Transaction Status'}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2.5">
                            <Link
                                href="/user/wallet/history"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                            >
                                <span>View History</span>
                            </Link>

                            <Link
                                href="/user/support"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] text-center"
                            >
                                <Headphones size={14} />
                                <span>Contact Support</span>
                            </Link>
                        </div>
                    </>
                )}

                {/* 3. Failed State Actions */}
                {(status === 'failed' || status === 'cancelled') && (
                    <>
                        {handlers.onTryAgain && (
                            <button
                                type="button"
                                onClick={handlers.onTryAgain}
                                className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.96] cursor-pointer"
                            >
                                <RotateCcw size={15} />
                                <span>Try Again</span>
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                            {handlers.onEditOrder && (
                                <button
                                    type="button"
                                    onClick={handlers.onEditOrder}
                                    className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Change Order
                                </button>
                            )}

                            <Link
                                href="/user/support"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] text-center"
                            >
                                <Headphones size={14} />
                                <span>Contact Support</span>
                            </Link>
                        </div>
                    </>
                )}

                {/* 4. Refunded State Actions */}
                {status === 'refunded' && (
                    <>
                        <Link
                            href="/user/wallet/history"
                            className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-center"
                        >
                            <span>View in Wallet History</span>
                            <ArrowRight size={16} />
                        </Link>

                        <div className="grid grid-cols-2 gap-2.5">
                            <Link
                                href="/user/dashboard"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                            >
                                <Home size={14} />
                                <span>Back to Home</span>
                            </Link>

                            <Link
                                href="/user/support"
                                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] text-center"
                            >
                                <Headphones size={14} />
                                <span>Contact Support</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
