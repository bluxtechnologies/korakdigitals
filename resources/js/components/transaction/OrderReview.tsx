import * as React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PaymentBreakdown } from './PaymentBreakdown';
import { WalletBalanceSummary } from './WalletBalanceSummary';
import { TransactionDetails } from './TransactionDetails';
import { UniversalTransactionData, TransactionActionHandlers } from './types';

interface OrderReviewProps {
    data: UniversalTransactionData;
    handlers?: TransactionActionHandlers;
    isProcessing?: boolean;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
    data,
    handlers = {},
    isProcessing = false,
}) => {
    const symbol = data.currencySymbol || '₦';
    const isInsufficient = data.currentBalance < data.totalAmount;

    // Compile dynamic review rows
    const reviewRows = React.useMemo(() => {
        const rows = [];

        if (data.providerName) {
            rows.push({ label: 'Provider / Network', value: data.providerName });
        }

        if (data.recipient) {
            rows.push({
                label: data.recipientLabel || 'Recipient',
                value: data.recipient,
                isMono: true,
            });
        }

        if (data.selectedItemName) {
            rows.push({
                label: data.selectedItemLabel || 'Plan / Product',
                value: data.selectedItemName,
            });
        }

        if (data.quantity && data.quantity > 1) {
            rows.push({ label: 'Quantity', value: data.quantity });
        }

        if (data.duration) {
            rows.push({ label: 'Duration', value: data.duration });
        }

        if (data.allowance) {
            rows.push({ label: 'Data Allowance', value: data.allowance });
        }

        rows.push({ label: 'Payment Source', value: data.paymentSource || 'Korak Wallet' });

        if (data.additionalDetails && data.additionalDetails.length > 0) {
            rows.push(...data.additionalDetails);
        }

        return rows;
    }, [data]);

    return (
        <div className="py-6 px-4 max-w-lg mx-auto space-y-6 select-none animate-in fade-in-50">
            {/* Header */}
            <div>
                {handlers.onEditOrder && (
                    <button
                        type="button"
                        onClick={handlers.onEditOrder}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors mb-3 cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>Edit Order</span>
                    </button>
                )}
                <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                    Review Order
                </h1>
                <p className="text-xs md:text-sm text-text-secondary mt-0.5">
                    Please verify your transaction details before payment.
                </p>
            </div>

            {/* Service Title Strip */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-between shadow-2xs">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                        {data.serviceCategory || 'Service'}
                    </span>
                    <span className="text-sm font-bold text-text-primary block leading-tight">
                        {data.serviceName}
                    </span>
                </div>
                {data.providerLogo && (
                    <div className="w-10 h-10 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center shrink-0">
                        <img src={data.providerLogo} alt={data.providerName || ''} className="w-full h-full object-contain" />
                    </div>
                )}
            </div>

            {/* Dynamic Attributes */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle shadow-2xs">
                <TransactionDetails items={reviewRows} />
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle shadow-2xs">
                <PaymentBreakdown
                    subtotal={data.subtotal}
                    discount={data.discount}
                    fee={data.fee}
                    totalAmount={data.totalAmount}
                    currencySymbol={symbol}
                    subtotalLabel="Service Price"
                />
            </div>

            {/* Wallet Balance Projection */}
            <WalletBalanceSummary
                currentBalance={data.currentBalance}
                remainingBalance={data.remainingBalance}
                currencySymbol={symbol}
                isInsufficient={isInsufficient}
            />

            {/* Actions */}
            <div className="space-y-2 pt-2">
                <button
                    type="button"
                    onClick={handlers.onConfirmPay}
                    disabled={isInsufficient || isProcessing}
                    className="w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <span>Confirm and Pay</span>
                    <ArrowRight size={16} />
                </button>

                {handlers.onEditOrder && (
                    <button
                        type="button"
                        onClick={handlers.onEditOrder}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-bold text-xs transition-colors cursor-pointer"
                    >
                        Edit Order
                    </button>
                )}
            </div>
        </div>
    );
};
