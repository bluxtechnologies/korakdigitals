import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Link } from '@inertiajs/react';
import { WalletIcon } from './Icons';
import { cn } from '@/lib/utils';

export interface TransactionConfirmDetails {
    serviceName: string;
    category?: string;
    recipient?: string;
    recipientLabel?: string;
    quantity?: number;
    unitPrice?: number;
    subtotal: number;
    fee?: number;
    totalAmount: number;
    currencySymbol?: string;
    currencyCode?: string;
    currentBalance: number;
    additionalDetails?: { label: string; value: string | number }[];
}

export interface TransactionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    details: TransactionConfirmDetails | null;
    isProcessing?: boolean;
}

export const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    details,
    isProcessing = false,
}) => {
    if (!details) return null;

    const symbol = details.currencySymbol || '₦';
    const hasEnoughBalance = details.currentBalance >= details.totalAmount;
    const projectedBalance = details.currentBalance - details.totalAmount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isProcessing) onClose();
            }}
            title="Confirm Purchase"
            size="md"
        >
            <div className="space-y-5 py-1">
                {/* Summary Banner */}
                <div className="p-4 bg-bg-base border border-border-subtle rounded-md flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            {details.category || 'Digital Service'}
                        </span>
                        <h4 className="text-sm font-extrabold text-text-primary">
                            {details.serviceName}
                        </h4>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            Total Cost
                        </span>
                        <span className="text-base font-black text-brand">
                            {symbol}{details.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Line Items Breakdown */}
                <div className="space-y-2.5 text-xs">
                    {details.recipient && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">
                                {details.recipientLabel || 'Recipient / Target'}
                            </span>
                            <span className="font-bold text-text-primary font-mono select-all">
                                {details.recipient}
                            </span>
                        </div>
                    )}

                    {details.quantity && details.quantity > 1 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">Quantity</span>
                            <span className="font-bold text-text-primary">
                                {details.quantity}
                            </span>
                        </div>
                    )}

                    {details.unitPrice !== undefined && details.quantity && details.quantity > 1 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">Unit Price</span>
                            <span className="text-text-primary">
                                {symbol}{details.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {details.additionalDetails?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">{item.label}</span>
                            <span className="font-bold text-text-primary">{item.value}</span>
                        </div>
                    ))}

                    {details.fee !== undefined && details.fee > 0 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">Service / Processing Fee</span>
                            <span className="text-text-primary">
                                {symbol}{details.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Wallet Balance Calculation */}
                <div className="p-3.5 bg-bg-surface border border-border-subtle rounded-md space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                            <WalletIcon size={14} className="text-text-muted" />
                            <span>Current Available Balance</span>
                        </div>
                        <span className="font-bold text-text-primary">
                            {symbol}{details.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                        <span className="text-text-secondary font-medium">Balance After Purchase</span>
                        <span className={cn(
                            'font-black',
                            hasEnoughBalance ? 'text-success' : 'text-error'
                        )}>
                            {symbol}{projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Warning if insufficient balance */}
                {!hasEnoughBalance && (
                    <div className="p-3 bg-error-bg border border-error-border rounded-md text-xs space-y-2 animate-shake">
                        <div className="flex items-center gap-2 text-error font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>Insufficient Wallet Balance</span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                            You need an additional <strong>{symbol}{(details.totalAmount - details.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> to complete this purchase.
                        </p>
                        <Link href="/user/wallet/fund" className="inline-block">
                            <Button size="sm" variant="primary" className="text-xs font-bold mt-1">
                                Fund Wallet Now
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-xs font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={onConfirm}
                        isLoading={isProcessing}
                        disabled={!hasEnoughBalance || isProcessing}
                        className="text-xs font-bold px-5"
                    >
                        Confirm & Pay {symbol}{details.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
