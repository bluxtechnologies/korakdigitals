export type TransactionStatus =
    | 'awaiting_confirmation'
    | 'processing'
    | 'completed'
    | 'pending'
    | 'failed'
    | 'refunded'
    | 'cancelled';

export type TransactionStep =
    | 'form'
    | 'review'
    | 'confirming'
    | 'processing'
    | 'result';

export interface TransactionItemDetail {
    label: string;
    value: string | number;
    isMono?: boolean;
    copyable?: boolean;
}

export interface UniversalTransactionData {
    // Service Identity
    serviceName: string;
    serviceCategory?: string;
    serviceType?: string; // e.g. 'airtime' | 'data' | 'numbers' | 'social_growth' | 'accounts' | 'vpn' | 'esim'
    serviceIcon?: React.ReactNode;
    providerName?: string; // e.g. 'MTN Nigeria', 'Instagram', 'United States'
    providerLogo?: string;

    // Target / Recipient / Product
    recipient?: string;
    recipientLabel?: string; // e.g. 'Recipient Phone Number', 'Instagram Handle', 'Selected Number'
    selectedItemName?: string; // e.g. '40MB + 5MB Night Bonus', '1,000 Followers', '+1 (202) 555-0192'
    selectedItemLabel?: string; // e.g. 'Data Plan', 'Package', 'Virtual Number'
    quantity?: number;
    duration?: string;
    allowance?: string;

    // Financial Breakdown
    subtotal: number;
    discount?: number;
    fee?: number;
    totalAmount: number;
    currencySymbol?: string;
    currencyCode?: string;
    paymentSource?: string; // Default: 'Korak Wallet'
    currentBalance: number;
    remainingBalance: number;

    // Execution & Tracking
    reference?: string;
    providerReference?: string;
    status: TransactionStatus;
    date?: string;
    timestamp?: string;
    failureReason?: string;
    refundAmount?: number;
    refundStatus?: string;
    notes?: string;

    // Dynamic additional rows
    additionalDetails?: TransactionItemDetail[];
}

export interface TransactionActionHandlers {
    onConfirmPay?: () => void | Promise<void>;
    onEditOrder?: () => void;
    onViewTransaction?: (reference: string) => void;
    onBuyAgain?: () => void;
    onTryAgain?: () => void;
    onCheckStatus?: (reference: string) => void;
    onContactSupport?: (reference?: string) => void;
    onClose?: () => void;
}
