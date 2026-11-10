import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { CopyButton } from './CopyButton';
import { CheckIcon } from './Icons';
import { cn } from '@/lib/utils';

export interface TransactionReceiptData {
    reference: string;
    providerReference?: string;
    serviceName: string;
    category?: string;
    recipient?: string;
    recipientLabel?: string;
    amount: number | string;
    currencySymbol?: string;
    currencyCode?: string;
    status: 'completed' | 'successful' | 'processing' | 'pending' | 'failed' | 'refunded' | 'reversed' | string;
    date: string;
    deliveredData?: string | string[];
    deliveredDataLabel?: string;
    notes?: string;
}

export interface TransactionReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    receipt: TransactionReceiptData | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
    isOpen,
    onClose,
    receipt,
}) => {
    if (!receipt) return null;

    const symbol = receipt.currencySymbol || '₦';
    const isSuccess = receipt.status === 'completed' || receipt.status === 'successful';
    const isPending = receipt.status === 'pending' || receipt.status === 'processing';
    const isFailed = receipt.status === 'failed';

    const handlePrint = () => {
        window.print();
    };

    const formattedAmount = typeof receipt.amount === 'number'
        ? receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : receipt.amount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Transaction Receipt"
            size="md"
        >
            <div className="receipt-container space-y-5 py-2">
                {/* Header Status Banner */}
                <div className="text-center p-5 bg-bg-base border border-border-subtle rounded-md flex flex-col items-center gap-2">
                    <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        isSuccess && 'bg-success-bg text-success',
                        isPending && 'bg-warning-bg text-warning animate-pulse',
                        isFailed && 'bg-error-bg text-error'
                    )}>
                        {isSuccess ? (
                            <CheckIcon size={24} />
                        ) : isPending ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 animate-spin">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <span className="text-sm font-black text-text-primary tracking-tight">
                        {isSuccess ? 'Transaction Successful' : isPending ? 'Transaction Processing' : 'Transaction Failed'}
                    </span>
                    <span className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight">
                        {symbol}{formattedAmount}
                    </span>
                    <Badge
                        variant={isSuccess ? 'success' : isPending ? 'warning' : 'error'}
                        className="capitalize text-[10px] font-bold mt-0.5"
                    >
                        {receipt.status}
                    </Badge>
                </div>

                {/* Receipt Details Table */}
                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                        <span className="text-text-secondary font-medium">Reference ID</span>
                        <div className="flex items-center gap-1.5 font-mono tabular-nums font-bold text-text-primary">
                            <span>{receipt.reference}</span>
                            <CopyButton text={receipt.reference} size="xs" />
                        </div>
                    </div>

                    {receipt.providerReference && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">Provider Ref</span>
                            <div className="flex items-center gap-1.5 font-mono tabular-nums text-text-muted text-[11px]">
                                <span>{receipt.providerReference}</span>
                                <CopyButton text={receipt.providerReference} size="xs" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                        <span className="text-text-secondary font-medium">Service</span>
                        <span className="font-bold text-text-primary text-right">{receipt.serviceName}</span>
                    </div>

                    {receipt.recipient && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                            <span className="text-text-secondary font-medium">
                                {receipt.recipientLabel || 'Recipient / Target'}
                            </span>
                            <span className="font-mono tabular-nums font-bold text-text-primary">{receipt.recipient}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/60">
                        <span className="text-text-secondary font-medium">Date & Time</span>
                        <span className="text-text-primary">{receipt.date}</span>
                    </div>
                </div>

                {/* Delivered Credentials / Output Data if present */}
                {receipt.deliveredData && (
                    <div className="p-3.5 bg-brand-subtle/50 border border-brand/20 rounded-md space-y-1.5">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                            {receipt.deliveredDataLabel || 'Delivered Item / Code'}
                        </span>
                        <div className="font-mono text-xs font-bold text-text-primary bg-bg-surface p-2.5 rounded border border-border-subtle flex items-center justify-between gap-2 overflow-x-auto select-all">
                            <span>{Array.isArray(receipt.deliveredData) ? receipt.deliveredData.join('\n') : receipt.deliveredData}</span>
                            <CopyButton text={Array.isArray(receipt.deliveredData) ? receipt.deliveredData.join('\n') : receipt.deliveredData} size="xs" />
                        </div>
                    </div>
                )}

                {/* Footer Controls (Hidden during print) */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle print:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="text-xs font-bold flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-3.323 2.41-6.079 5.28-6.079 2.87 0 5.52 2.756 5.28 6.079M6.75 6.75h10.5M6.75 19.5h10.5M4.5 9.75h15a2.25 2.25 0 012.25 2.25v5.25a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-5.25A2.25 2.25 0 014.5 9.75z" />
                        </svg>
                        <span>Print Receipt</span>
                    </Button>

                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={onClose}
                        className="text-xs font-bold px-5"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
