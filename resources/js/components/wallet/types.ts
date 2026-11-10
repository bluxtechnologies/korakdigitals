export interface CurrencyItem {
    id: number;
    code: string;
    name: string;
    symbol: string;
    rate: string | number;
    is_default?: boolean;
    is_active?: boolean;
    decimal_places?: number;
}

export interface WalletAccount {
    id: number;
    public_reference: string;
    available_balance: string | number;
    ledger_balance: string | number;
    total_deposit: string | number;
    status: string;
}

export interface FundingAccountData {
    account_number?: string;
    account_name?: string;
    bank_name?: string;
    provider?: string;
    status?: string;
}

export interface LedgerTransaction {
    id: number;
    account_id: number;
    reference: string;
    type: 'credit' | 'debit';
    category: string;
    amount: string | number;
    balance_after: string | number;
    currency_code: string;
    description?: string;
    created_at: string;
    status?: 'completed' | 'pending' | 'failed' | 'reversed';
}

export type TransactionFilterType = 'all' | 'credit' | 'debit';
