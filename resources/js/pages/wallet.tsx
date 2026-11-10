import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft } from 'lucide-react';
import {
    CurrencyItem,
    WalletAccount,
    FundingAccountData,
    LedgerTransaction,
    TransactionFilterType,
    WalletBalanceCard,
    CurrencySelector,
    WalletAccountDetails,
    TransactionFilters,
    TransactionSearch,
    TransactionList,
    QuickActionsCard,
    WalletSecurityCard,
} from '@/components/wallet';
import {
    TransactionFlowModal,
    UniversalTransactionData,
    TransactionStatus,
} from '@/components/transaction';

interface WalletPageProps {
    account?: WalletAccount;
    transactions?: LedgerTransaction[];
    currencies?: CurrencyItem[];
    fundingAccount?: FundingAccountData | null;
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            user_currency_id?: number;
        };
        account?: WalletAccount;
        currency?: CurrencyItem;
    };
    [key: string]: any;
}

export default function WalletPage() {
    const { props } = usePage<WalletPageProps>();
    const toast = useToast();

    const account = props.account || props.auth?.account;
    const availableCurrencies: CurrencyItem[] = props.currencies && props.currencies.length > 0
        ? props.currencies
        : [
            { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
            { id: 2, code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1500.0 },
            { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78 },
            { id: 4, code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
        ];

    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 2);
    const primaryCurrency = props.auth?.currency
        || availableCurrencies.find(c => Number(c.id) === userCurrencyId)
        || availableCurrencies.find(c => c.code === 'NGN')
        || availableCurrencies[0];

    const allTransactions = props.transactions || [];

    // Secondary currency for live estimation preview (defaults to USD if primary is NGN)
    const defaultSecondary = availableCurrencies.find(c => c.code !== primaryCurrency.code) || availableCurrencies[0];
    const [selectedSecondaryCurrency, setSelectedSecondaryCurrency] = React.useState<CurrencyItem>(defaultSecondary);

    // Visibility & UI state
    const [hideBalance, setHideBalance] = React.useState(false);
    const [isSwitchingCurrency, setIsSwitchingCurrency] = React.useState(false);
    const [activeFilter, setActiveFilter] = React.useState<TransactionFilterType>('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Selected transaction receipt for Universal modal
    const [selectedTxData, setSelectedTxData] = React.useState<UniversalTransactionData | null>(null);

    const availableBalance = Number(account?.available_balance || 0);

    // Live currency conversion calculation:
    // (availableBalance / userRate) * targetRate
    const userRate = Number(primaryCurrency.rate) || 1;
    const targetRate = Number(selectedSecondaryCurrency?.rate) || 1;
    const convertedBalance = userRate > 0 ? (availableBalance / userRate) * targetRate : availableBalance;

    // Handle switching display currency / base currency
    const handleSwitchCurrency = (targetCurr: CurrencyItem) => {
        if (targetCurr.id === primaryCurrency.id) return;
        setIsSwitchingCurrency(true);

        router.post(
            '/user/wallet/switch-currency',
            { currency_id: targetCurr.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Active currency updated to ${targetCurr.code}.`);
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to update active currency. Please try again.');
                    setIsSwitchingCurrency(false);
                },
                onFinish: () => {
                    setIsSwitchingCurrency(false);
                },
            }
        );
    };

    // Filter and search transactions
    const filteredTransactions = React.useMemo(() => {
        return allTransactions.filter(txn => {
            // Tab filter
            if (activeFilter !== 'all' && txn.type !== activeFilter) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const desc = (txn.description || '').toLowerCase();
                const cat = (txn.category || '').toLowerCase();
                const ref = (txn.reference || '').toLowerCase();
                const amt = String(txn.amount);
                return desc.includes(q) || cat.includes(q) || ref.includes(q) || amt.includes(q);
            }

            return true;
        });
    }, [allTransactions, activeFilter, searchQuery]);

    // Counts for tabs
    const counts = React.useMemo(() => {
        const creditCount = allTransactions.filter(t => t.type === 'credit').length;
        const debitCount = allTransactions.filter(t => t.type === 'debit').length;
        return {
            all: allTransactions.length,
            credit: creditCount,
            debit: debitCount,
        };
    }, [allTransactions]);

    // Smooth scroll to account details card
    const handleViewAccountDetails = () => {
        const el = document.getElementById('wallet-account-details');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-brand', 'ring-offset-2');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-brand', 'ring-offset-2');
            }, 1800);
        }
    };

    // Open transaction receipt
    const handleSelectTransaction = (txn: LedgerTransaction) => {
        const isCredit = txn.type === 'credit';
        const symbol = primaryCurrency.symbol || '₦';
        const formattedDate = new Date(txn.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const txnAmount = Number(txn.amount);
        const txnStatus = txn.status === 'reversed' ? 'refunded' : (txn.status || 'completed');

        setSelectedTxData({
            reference: txn.reference || `TXN-${txn.id}`,
            serviceName: txn.description || (isCredit ? 'Wallet Funding Credit' : (txn.category ? txn.category.replace(/_/g, ' ').toUpperCase() : 'Wallet Purchase')),
            category: txn.category ? txn.category.replace(/_/g, ' ') : (isCredit ? 'Wallet Credit' : 'Service Payment'),
            recipient: txn.reference || 'Korak Wallet Balance',
            recipientLabel: 'Transaction Reference',
            // Required UniversalTransactionData financial fields
            subtotal: txnAmount,
            totalAmount: txnAmount,
            currentBalance: Number(txn.balance_before || availableBalance),
            remainingBalance: Number(txn.balance_after || availableBalance),
            currencySymbol: symbol,
            currencyCode: txn.currency_code || primaryCurrency.code,
            // Status must be a valid TransactionStatus union value ('reversed' → 'refunded')
            status: txnStatus as TransactionStatus,
            date: formattedDate,
            additionalDetails: [
                { label: 'Transaction Type', value: isCredit ? 'Credit (Money In)' : 'Debit (Money Out)' },
                { label: 'Payment Method', value: 'Wallet Balance Ledger' },
                { label: 'Date & Time', value: formattedDate },
                { label: 'Balance Before', value: `${symbol}${Number(txn.balance_before || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'Balance After', value: `${symbol}${Number(txn.balance_after || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
            ],
        });
    };

    return (
        <>
            <Head title="Wallet" />

            <div className="max-w-6xl mx-auto px-1 sm:px-4 py-2 md:py-6 space-y-6 pb-24 md:pb-12">
                {/* Desktop Back Link */}
                <div className="hidden md:block">
                    <Link
                        href="/user/services"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Back to Services</span>
                    </Link>
                </div>

                {/* Page Title & Subtitle */}
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                        Wallet
                    </h1>
                    <p className="text-xs md:text-sm text-text-secondary mt-0.5">
                        Manage your wallet balance, check live converted rates, and review past transaction receipts.
                    </p>
                </div>

                {/* Main 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column (Primary ~68%, 8 cols on desktop) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Primary Burgundy Balance Card */}
                        <WalletBalanceCard
                            availableBalance={availableBalance}
                            primaryCurrency={primaryCurrency}
                            availableCurrencies={availableCurrencies}
                            selectedSecondaryCurrency={selectedSecondaryCurrency}
                            convertedBalance={convertedBalance}
                            hideBalance={hideBalance}
                            onToggleHideBalance={() => setHideBalance(!hideBalance)}
                            onSelectSecondaryCurrency={setSelectedSecondaryCurrency}
                            onViewAccountDetails={handleViewAccountDetails}
                        />

                        {/* 2. Filter Tabs & Search Bar */}
                        <div className="space-y-3">
                            <TransactionFilters
                                activeFilter={activeFilter}
                                onSelectFilter={setActiveFilter}
                                counts={counts}
                            />

                            <TransactionSearch
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                placeholder="Search transactions..."
                            />
                        </div>

                        {/* 3. Recent Transactions List */}
                        <TransactionList
                            transactions={filteredTransactions}
                            displaySymbol={primaryCurrency.symbol || '₦'}
                            onSelectTransaction={handleSelectTransaction}
                            hasFilterOrSearch={activeFilter !== 'all' || searchQuery.trim().length > 0}
                            onResetFilter={() => {
                                setActiveFilter('all');
                                setSearchQuery('');
                            }}
                        />
                    </div>

                    {/* Right Column (Sidebar ~32%, 4 cols on desktop) */}
                    <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
                        {/* Display Currency Switcher Card */}
                        <CurrencySelector
                            currencies={availableCurrencies}
                            activeCurrency={primaryCurrency}
                            onSelectCurrency={handleSwitchCurrency}
                            isSwitching={isSwitchingCurrency}
                        />

                        {/* Wallet Account Details Card (Desktop only, hidden on mobile) */}
                        <div className="hidden lg:block">
                            <WalletAccountDetails
                                account={account}
                                fundingAccount={props.fundingAccount}
                                userName={props.auth?.user?.name}
                            />
                        </div>

                        {/* Quick Actions Card */}
                        <QuickActionsCard />

                        {/* Wallet Security Card */}
                        <WalletSecurityCard />
                    </div>
                </div>
            </div>

            {/* Universal Transaction Receipt Modal */}
            <TransactionFlowModal
                step={selectedTxData ? 'result' : 'form'}
                data={selectedTxData}
                isProcessing={false}
                onClose={() => setSelectedTxData(null)}
                onConfirmPay={() => {}}
                handlers={{
                    onBuyAgain: () => {
                        setSelectedTxData(null);
                        router.visit('/user/services');
                    },
                }}
            />
        </>
    );
}

WalletPage.layout = (page: React.ReactNode) => (
    <AppShell title="Wallet" backUrl="/user/services">
        {page}
    </AppShell>
);
