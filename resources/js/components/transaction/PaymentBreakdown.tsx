import * as React from 'react';

interface PaymentBreakdownProps {
    subtotal: number;
    discount?: number;
    fee?: number;
    totalAmount: number;
    currencySymbol?: string;
    subtotalLabel?: string;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
    subtotal,
    discount = 0,
    fee = 0,
    totalAmount,
    currencySymbol = '₦',
    subtotalLabel = 'Service Price',
}) => {
    return (
        <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-text-secondary">
                <span>{subtotalLabel}</span>
                <span className="font-mono font-bold text-text-primary">
                    {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            {discount > 0 && (
                <div className="flex items-center justify-between text-text-secondary">
                    <span>Discount</span>
                    <span className="font-mono font-bold text-brand">
                        -{currencySymbol}{discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between text-text-secondary">
                <span>Service Fee</span>
                <span className="font-mono font-bold text-text-primary">
                    {fee > 0
                        ? `${currencySymbol}${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `${currencySymbol}0.00 (Free)`}
                </span>
            </div>

            <div className="border-t border-border-subtle pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">Total to Pay</span>
                <span className="text-base md:text-lg font-black font-mono text-text-primary">
                    {currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );
};
