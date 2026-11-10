import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import { UniversalTransactionData } from './types';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: UniversalTransactionData | null;
    isProcessing?: boolean;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    data,
    isProcessing = false,
}) => {
    if (!data) return null;

    const symbol = data.currencySymbol || '₦';

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isProcessing) onClose();
            }}
            title="Confirm this purchase?"
            size="md"
        >
            <div className="space-y-4 py-1 select-none">
                <p className="text-xs text-text-secondary leading-relaxed">
                    You are about to pay from your Korak Wallet.
                </p>

                {/* Essential Summary Card */}
                <div className="p-4 rounded-xl bg-bg-base border border-border-subtle/80 space-y-3">
                    {/* Service & Provider */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                                {data.serviceCategory || 'Service'}
                            </span>
                            <span className="text-sm font-bold text-text-primary block leading-tight">
                                {data.serviceName}
                            </span>
                        </div>
                        {data.providerLogo && (
                            <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center shrink-0">
                                <img src={data.providerLogo} alt={data.providerName || ''} className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border-subtle/60 pt-2.5 space-y-2 text-xs">
                        {/* Target / Recipient */}
                        {data.recipient && (
                            <div className="flex items-center justify-between text-text-secondary">
                                <span>{data.recipientLabel || 'Recipient'}</span>
                                <span className="font-bold font-mono text-text-primary select-all">
                                    {data.recipient}
                                </span>
                            </div>
                        )}

                        {/* Selected Plan or Product */}
                        {data.selectedItemName && (
                            <div className="flex items-center justify-between text-text-secondary">
                                <span>{data.selectedItemLabel || 'Plan'}</span>
                                <span className="font-bold text-text-primary text-right max-w-[200px] truncate">
                                    {data.selectedItemName}
                                </span>
                            </div>
                        )}

                        {/* Payment Source */}
                        <div className="flex items-center justify-between text-text-secondary">
                            <span>Payment Source</span>
                            <span className="font-bold text-text-primary flex items-center gap-1">
                                <Wallet size={13} className="text-brand" />
                                <span>{data.paymentSource || 'Korak Wallet'}</span>
                            </span>
                        </div>

                        {/* Total Amount */}
                        <div className="border-t border-border-subtle/60 pt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-text-primary">Total</span>
                            <span className="text-base font-black font-mono text-brand">
                                {symbol}{data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm Payment</span>
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
