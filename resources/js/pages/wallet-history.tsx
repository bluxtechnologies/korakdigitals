import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SearchIcon, FolderIcon } from '@/components/ui/Icons';
import { CopyButton } from '@/components/ui/CopyButton';
import { TransactionReceiptModal, TransactionReceiptData } from '@/components/ui/TransactionReceiptModal';
import { cn } from '@/lib/utils';

interface LedgerTransaction {
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
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedTransactions {
    data: LedgerTransaction[];
    links?: PaginationLink[];
    current_page?: number;
    last_page?: number;
    total?: number;
}

interface WalletHistoryProps {
    transactions?: PaginatedTransactions | LedgerTransaction[];
    auth?: {
        currency?: {
            id: number;
            code: string;
            name: string;
            symbol: string;
            rate: number | string;
        };
    };
    [key: string]: any;
}

export default function WalletHistory() {
    const { props } = usePage<WalletHistoryProps>();
    const paginationData = (props.transactions && 'data' in props.transactions) ? props.transactions : null;
    const dbTxns: LedgerTransaction[] = paginationData ? paginationData.data : (Array.isArray(props.transactions) ? props.transactions : []);
    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$' } : { code: 'NGN', symbol: '₦' });

    const [search, setSearch] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState<'all' | 'credit' | 'debit'>('all');
    const [selectedReceipt, setSelectedReceipt] = React.useState<TransactionReceiptData | null>(null);

    const filteredTransactions = dbTxns.filter((txn) => {
        const matchesType = typeFilter === 'all' || txn.type === typeFilter;
        const matchesSearch = 
            (txn.reference || '').toLowerCase().includes(search.toLowerCase()) ||
            (txn.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (txn.category || '').toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getTxnSymbol = (currencyCode?: string) => {
        const code = (currencyCode || '').toUpperCase();
        if (code === 'USD') return '$';
        if (code === 'NGN') return '₦';
        if (code === 'EUR') return '€';
        if (code === 'GBP') return '£';
        return code ? `${code} ` : (authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦'));
    };

    const openReceipt = (txn: LedgerTransaction) => {
        const isCredit = txn.type === 'credit';
        const symbol = getTxnSymbol(txn.currency_code);
        setSelectedReceipt({
            reference: txn.reference || `TXN-${txn.id}`,
            serviceName: txn.description || (txn.category ? txn.category.replace(/_/g, ' ').toUpperCase() : (isCredit ? 'Wallet Credit' : 'Wallet Purchase')),
            category: txn.category ? txn.category.replace(/_/g, ' ').toUpperCase() : 'WALLET LEDGER',
            amount: Number(txn.amount),
            currencySymbol: symbol,
            currencyCode: txn.currency_code || authCurrency.code,
            status: 'completed',
            date: new Date(txn.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            deliveredData: `Balance After: ${symbol}${Number(txn.balance_after || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            deliveredDataLabel: 'Ledger Audit Summary',
        });
    };

    return (
        <>
            <Head title="Transaction History" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                
                {/* Standardized Wallet Overview Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Transaction History</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Comprehensive double-entry audit history of all deposits, service purchases, and refunds.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/user/wallet">
                            <Button variant="outline" className="text-xs font-bold shadow-2xs">
                                &larr; Overview
                            </Button>
                        </Link>
                        <Link href="/user/wallet/fund">
                            <Button className="text-xs font-bold shadow-sm">
                                + Fund Wallet Account
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Field */}
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Search by reference, description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<SearchIcon className="text-text-muted" />}
                            className="bg-bg-base"
                        />
                    </div>

                    {/* Filter Type Pills */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        {(['all', 'credit', 'debit'] as const).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setTypeFilter(filter)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer border shrink-0",
                                    typeFilter === filter
                                        ? "bg-brand text-brand-foreground border-brand shadow-2xs"
                                        : "bg-bg-base border-border-subtle text-text-secondary hover:text-text-primary"
                                )}
                            >
                                {filter === 'all' ? 'All Transactions' : filter === 'credit' ? 'Deposits / Credits' : 'Purchases / Debits'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Full Transactions History Ledger Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-text-secondary">
                            <div className="flex flex-col items-center justify-center gap-3 py-6">
                                <div className="w-12 h-12 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted">
                                    <FolderIcon size={24} />
                                </div>
                                <span className="text-sm font-bold text-text-primary">No Matching Records</span>
                                <span className="text-xs text-text-muted max-w-xs leading-relaxed mx-auto">
                                    No ledger entries match your filter or search criteria.
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-bold border-b border-border-subtle select-none">
                                        <th className="p-3.5">Reference ID</th>
                                        <th className="p-3.5">Activity Type</th>
                                        <th className="p-3.5">Description</th>
                                        <th className="p-3.5 text-right font-mono">Amount</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5">Date & Time</th>
                                        <th className="p-3.5 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {filteredTransactions.map((txn) => {
                                        const isCredit = txn.type === 'credit';
                                        const ref = txn.reference || `TXN-${txn.id}`;
                                        const symbol = getTxnSymbol(txn.currency_code);
                                        const description = txn.description || (txn.category ? txn.category.replace(/_/g, ' ').toUpperCase() : (isCredit ? 'Wallet Credit' : 'Wallet Purchase'));
                                        
                                        return (
                                            <tr 
                                                key={txn.id} 
                                                onClick={() => openReceipt(txn)}
                                                className="hover:bg-bg-surface-hover/60 transition-colors cursor-pointer select-none"
                                            >
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-1.5 font-mono font-bold text-brand" onClick={(e) => e.stopPropagation()}>
                                                        <span>{ref}</span>
                                                        <CopyButton text={ref} size="xs" />
                                                    </div>
                                                </td>
                                                <td className="p-3.5 text-text-secondary capitalize">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                                                        isCredit ? "bg-success-bg text-success" : "bg-bg-base text-text-secondary border border-border-subtle"
                                                    )}>
                                                        {isCredit ? 'CREDIT' : 'DEBIT'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-semibold text-text-primary max-w-xs truncate">
                                                    {description}
                                                </td>
                                                <td className={cn(
                                                    "p-3.5 text-right font-mono font-extrabold",
                                                    isCredit ? "text-success" : "text-text-primary"
                                                )}>
                                                    {isCredit ? '+' : '-'}{symbol}{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3.5">
                                                    <Badge variant="success" statusIcon="check" className="font-bold text-[10px]">
                                                        COMPLETED
                                                    </Badge>
                                                </td>
                                                <td className="p-3.5 text-text-muted font-mono whitespace-nowrap">
                                                    {new Date(txn.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <Button size="sm" variant="outline" className="text-xs font-bold pointer-events-none">
                                                        Receipt
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Bar if Paginated */}
                    {paginationData && paginationData.links && paginationData.links.length > 3 && (
                        <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                            <div>
                                Showing <span className="font-bold text-text-primary">{filteredTransactions.length}</span> of <span className="font-bold text-text-primary">{paginationData.total ?? filteredTransactions.length}</span> records
                            </div>
                            <div className="flex items-center gap-1">
                                {paginationData.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span 
                                                key={idx} 
                                                dangerouslySetInnerHTML={{ __html: link.label }} 
                                                className="px-3 py-1.5 text-text-muted border border-border-subtle rounded text-xs opacity-50 cursor-not-allowed select-none"
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={cn(
                                                "px-3 py-1.5 rounded text-xs font-bold border transition-colors select-none",
                                                link.active 
                                                    ? "bg-brand text-brand-foreground border-brand shadow-2xs" 
                                                    : "bg-bg-base border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                                            )}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Receipt Modal */}
            <TransactionReceiptModal
                isOpen={Boolean(selectedReceipt)}
                onClose={() => setSelectedReceipt(null)}
                receipt={selectedReceipt}
            />
        </>
    );
}

WalletHistory.layout = (page: React.ReactNode) => (
    <AppShell title="Transaction History" backUrl="/user/wallet">
        {page}
    </AppShell>
);

