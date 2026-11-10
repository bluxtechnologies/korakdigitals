import * as React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
    Wallet,
    Eye,
    EyeOff,
    ChevronDown,
    ArrowRight,
    Headphones,
    Phone,
    Wifi,
    TrendingUp,
    LayoutGrid,
    ChevronRight,
    Check,
    Copy,
    CheckCircle2,
    Smartphone,
    Loader2,
    Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencyItem {
    id: number;
    code: string;
    symbol: string;
    name: string;
    rate: number | string;
    is_default?: boolean;
    is_active?: boolean;
    decimal_places?: number;
}

export default function Dashboard() {
    const { props } = usePage<any>();
    const authUser = props.auth?.user || { name: 'Customer' };
    const authAccount = props.auth?.account || {};
    const stats = props.stats || {};
    const dbTransactions = props.recentTransactions || [];

    // Active currencies from database
    const dbCurrencies: CurrencyItem[] = props.currencies && props.currencies.length > 0
        ? props.currencies
        : [
            { id: 1, code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
            { id: 2, code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1300.0 }
        ];

    // Determine user's active currency by checking user_currency_id
    const userCurrencyId = Number(authUser.user_currency_id || stats.currencyId || props.auth?.currency?.id || 1);
    
    // Find active user currency in available currencies, fallback to USD or first
    const initialUserCurrency = dbCurrencies.find(c => Number(c.id) === userCurrencyId)
        || dbCurrencies.find(c => c.code === (stats.currencyCode || props.auth?.currency?.code))
        || dbCurrencies[0];

    const toast = useToast();
    const [hideBalance, setHideBalance] = React.useState(false);
    const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyItem>(initialUserCurrency);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = React.useState(false);
    const [isSwitchingCurrency, setIsSwitchingCurrency] = React.useState(false);
    const [selectedTxn, setSelectedTxn] = React.useState<any | null>(null);
    const [copiedRef, setCopiedRef] = React.useState(false);

    // Keep selected currency synchronized if props.auth.user.user_currency_id updates
    React.useEffect(() => {
        const matching = dbCurrencies.find(c => Number(c.id) === Number(authUser.user_currency_id));
        if (matching && matching.id !== selectedCurrency.id) {
            setSelectedCurrency(matching);
        }
    }, [authUser.user_currency_id]);

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Calculate main display balance and secondary estimated equivalent dynamically
    const baseBalance = Number(stats.availableBalance ?? authAccount.available_balance ?? 0);
    const userBaseRate = Number(initialUserCurrency.rate) || 1.0;
    const selectedRate = Number(selectedCurrency.rate) || 1.0;

    // Converted balance = (baseBalance / userBaseRate) * selectedRate
    const displayBalance = userBaseRate > 0
        ? (baseBalance / userBaseRate) * selectedRate
        : baseBalance;

    // Secondary equivalent currency:
    // If viewing USD, secondary is NGN. If viewing NGN, secondary is USD.
    const secondaryCurrency = dbCurrencies.find(c => c.code !== selectedCurrency.code) || selectedCurrency;
    const secondaryRate = Number(secondaryCurrency.rate) || 1.0;
    const secondaryAmount = selectedRate > 0
        ? (displayBalance / selectedRate) * secondaryRate
        : displayBalance;

    // Handle switching currency (both updates client display and persists via backend)
    const handleSwitchCurrency = (targetCurrency: CurrencyItem) => {
        if (targetCurrency.id === selectedCurrency.id) {
            setShowCurrencyDropdown(false);
            return;
        }

        // Immediately update visual symbol and selected currency
        setSelectedCurrency(targetCurrency);
        setShowCurrencyDropdown(false);

        // Persist to user account in database so user_currency_id is saved
        setIsSwitchingCurrency(true);
        router.post('/user/wallet/switch-currency', { currency_id: targetCurrency.id }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Currency switched to ${targetCurrency.code} (${targetCurrency.symbol})`);
            },
            onError: () => {
                toast.error('Could not switch base currency. Displaying estimated value.');
            },
            onFinish: () => {
                setIsSwitchingCurrency(false);
            }
        });
    };

    // Helper to get currency symbol for any transaction without hardcoding
    const getTxnSymbol = (currencyCode?: string) => {
        if (!currencyCode) return selectedCurrency.symbol;
        const found = dbCurrencies.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
        if (found) return found.symbol;
        if (currencyCode.toUpperCase() === 'USD') return '$';
        if (currencyCode.toUpperCase() === 'NGN') return '₦';
        if (currencyCode.toUpperCase() === 'EUR') return '€';
        if (currencyCode.toUpperCase() === 'GBP') return '£';
        return selectedCurrency.symbol;
    };

    // Parse database transactions (returns empty array if no transactions exist yet)
    const transactionsList = dbTransactions && dbTransactions.length > 0 
        ? dbTransactions.slice(0, 5).map((txn: any) => ({
            id: txn.id || txn.reference,
            type: txn.type || (Number(txn.amount) > 0 ? 'credit' : 'debit'),
            category: txn.category || (txn.type === 'credit' ? 'funding' : 'service'),
            description: txn.description || 'Service Purchase',
            amount: Math.abs(Number(txn.amount)) || 0,
            status: txn.status || 'completed',
            date: new Date(txn.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(txn.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            currency_code: txn.currency_code || initialUserCurrency.code,
            reference: txn.reference || `KORAK-${txn.id}`
        }))
        : [];

    const handleCopyRef = (refText: string) => {
        navigator.clipboard.writeText(refText);
        setCopiedRef(true);
        toast.success('Reference copied to clipboard');
        setTimeout(() => setCopiedRef(false), 2000);
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'airtime':
                return { icon: Phone, bg: 'bg-brand-subtle text-brand' };
            case 'data':
                return { icon: Wifi, bg: 'bg-info-bg text-info' };
            case 'funding':
            case 'wallet':
            case 'bank_transfer_deposit':
                return { icon: Wallet, bg: 'bg-brand-subtle text-brand' };
            case 'social':
            case 'growth':
                return { icon: TrendingUp, bg: 'bg-brand-subtle text-brand' };
            default:
                return { icon: Smartphone, bg: 'bg-brand-subtle text-brand' };
        }
    };

    return (
        <>
            <Head title="Dashboard Overview" />

            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 select-none animate-fadeIn pb-12">

                {/* ──── 1. Greeting Section ──── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                                {getGreeting()}, {authUser.name ? authUser.name.split(' ')[0] : 'Customer'}
                            </h1>
                            <span className="text-lg select-none" aria-hidden="true">☀️</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Your digital services, all in one place.
                        </p>
                    </div>
                </div>

                {/* ──── 2. Top Section: 7/5 Desktop Grid (Balance Card + Support Card) ──── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                    {/* Balance Card (7 Columns on Desktop) */}
                    <div className="lg:col-span-7 bg-brand text-brand-foreground p-6 sm:p-7 rounded-2xl shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
                        {/* Subtle decorative curved background branding watermark */}
                        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full border-[18px] border-white/8 pointer-events-none" />
                        <div className="absolute -right-2 -bottom-2 w-32 h-32 rounded-full border-[12px] border-white/6 pointer-events-none" />

                        {/* Top Row: Available balance label + Currency switcher + Eye show/hide */}
                        <div className="flex items-center justify-between z-10">
                            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
                                <Wallet size={16} className="text-white/80" aria-hidden="true" />
                                <span>Available Balance</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                {/* Currency Switcher Dropdown (Updates symbol and converts) */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                                        disabled={isSwitchingCurrency}
                                        aria-haspopup="menu"
                                        aria-expanded={showCurrencyDropdown}
                                        aria-label="Switch display currency"
                                        className="bg-white/12 hover:bg-white/18 border border-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                        title={`Active Currency: ${selectedCurrency.code} (${selectedCurrency.symbol})`}
                                    >
                                        {isSwitchingCurrency ? (
                                            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                                        ) : (
                                            <>
                                                <span>{selectedCurrency.code}</span>
                                                <ChevronDown size={13} className={cn("transition-transform duration-150", showCurrencyDropdown && "rotate-180")} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>

                                    {showCurrencyDropdown && (
                                        <div
                                            role="menu"
                                            aria-label="Currency choices"
                                            onKeyDown={(e) => { if (e.key === 'Escape') setShowCurrencyDropdown(false); }}
                                            className="absolute right-0 top-8 bg-bg-surface text-text-primary border border-border-subtle rounded-lg shadow-lg py-1 w-36 z-30 animate-fadeIn"
                                            style={{ overscrollBehavior: 'contain' }}
                                        >
                                            <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase border-b border-border-subtle">
                                                Select Currency
                                            </div>
                                            {dbCurrencies.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => handleSwitchCurrency(c)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-bg-surface-hover cursor-pointer transition-colors",
                                                        selectedCurrency.id === c.id ? "text-brand font-bold bg-brand-subtle/50" : "text-text-secondary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold">{c.code}</span>
                                                        <span className="text-[10px] text-text-muted truncate">({c.name})</span>
                                                    </div>
                                                    <span className="font-bold font-mono tabular-nums text-xs">{c.symbol}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Eye Show/Hide Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setHideBalance(!hideBalance)}
                                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                                    title={hideBalance ? "Show Balance" : "Hide Balance"}
                                    aria-label={hideBalance ? "Show Balance" : "Hide Balance"}
                                >
                                    {hideBalance ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        {/* Middle: Dominant Main Currency Amount + Dynamic Symbol + Estimated Equivalent */}
                        <div className="space-y-1 z-10">
                            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums tracking-tight text-white flex items-baseline">
                                {hideBalance ? (
                                    '••••••'
                                ) : (
                                    <span>
                                        {selectedCurrency.symbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                )}
                            </div>

                            <div className="text-xs text-white/80 font-medium flex items-center gap-1">
                                <span>≈</span>
                                <span className="font-mono tabular-nums">
                                    {hideBalance ? '••••' : `${secondaryCurrency.symbol}${secondaryAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} {secondaryCurrency.code}
                                </span>
                                <span className="text-white/60">(Estimated equivalent)</span>
                            </div>
                        </div>

                        {/* Bottom Row: + Add Money & View Wallet */}
                        <div className="flex items-center gap-3 z-10 pt-1">
                            <Link
                                href="/user/wallet/fund"
                                className="inline-flex items-center justify-center gap-1.5 bg-white text-brand hover:bg-white/95 active:scale-[0.96] text-xs font-extrabold px-4 py-2.5 rounded-lg shadow-xs transition-transform duration-150 cursor-pointer"
                            >
                                <span>+ Add Money</span>
                            </Link>

                            <Link
                                href="/user/wallet"
                                className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 active:scale-[0.96] border border-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-transform duration-150 cursor-pointer"
                            >
                                <span>View Wallet</span>
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    {/* Support Card (5 Columns on Desktop) */}
                    <div className="lg:col-span-5 bg-bg-surface border border-border-subtle p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                            {/* Headset Icon */}
                            <div className="w-11 h-11 rounded-full bg-brand-subtle text-brand flex items-center justify-center shadow-2xs">
                                <Headphones size={20} />
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-text-primary">Need help?</h3>
                                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                    We&apos;re here to help with your digital services.
                                </p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex flex-col gap-2 pt-2">
                            <Link
                                href="/user/support"
                                className="w-full inline-flex items-center justify-center bg-brand text-brand-foreground hover:bg-brand-hover active:scale-[0.96] text-xs font-bold py-2.5 px-4 rounded-lg shadow-xs transition-colors duration-150 text-center cursor-pointer"
                            >
                                Contact Support
                            </Link>

                            <Link
                                href="/user/support"
                                className="w-full inline-flex items-center justify-center border border-border-subtle text-text-primary hover:bg-bg-surface-hover active:scale-[0.96] text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 text-center cursor-pointer gap-1"
                            >
                                <span>Help Center</span>
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>

                        {/* Mobile Compact Shortcut Action (Single row per reference spec) */}
                        <div className="md:hidden pt-1">
                            <Link
                                href="/user/support"
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-bg-base border border-border-subtle hover:bg-bg-surface-hover text-xs font-bold text-brand transition-colors active:scale-[0.96]"
                            >
                                <span>Contact Support</span>
                                <ChevronRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* ──── 3. What do you need today? (Essential Services) ──── */}
                <div className="space-y-3.5">
                    <div>
                        <h2 className="text-base font-bold text-text-primary tracking-tight">
                            What do you need today?
                        </h2>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Quick access to our most popular services.
                        </p>
                    </div>

                    {/* 4 Cards Grid: Airtime, Data, Social, More */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                        {/* 1: Airtime */}
                        <Link
                            href="/user/services/airtime"
                            className="group bg-bg-surface border border-border-subtle hover:border-brand/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-sm transition-transform duration-150 cursor-pointer active:scale-[0.96]"
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <Phone size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                                    Airtime
                                </h3>
                                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                                    Buy airtime for any network
                                </p>
                            </div>
                            <div className="flex items-center text-text-muted group-hover:text-brand transition-colors pt-1">
                                <ArrowRight size={15} aria-hidden="true" />
                            </div>
                        </Link>

                        {/* 2: Data */}
                        <Link
                            href="/user/services/data"
                            className="group bg-bg-surface border border-border-subtle hover:border-brand/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-sm transition-transform duration-150 cursor-pointer active:scale-[0.96]"
                        >
                            <div className="w-10 h-10 rounded-full bg-info-bg text-info flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <Wifi size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                                    Data
                                </h3>
                                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                                    Get data for browsing, streaming and more
                                </p>
                            </div>
                            <div className="flex items-center text-text-muted group-hover:text-brand transition-colors pt-1">
                                <ArrowRight size={15} aria-hidden="true" />
                            </div>
                        </Link>

                        {/* 3: Social */}
                        <Link
                            href="/user/services/growth"
                            className="group bg-bg-surface border border-border-subtle hover:border-brand/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-sm transition-transform duration-150 cursor-pointer active:scale-[0.96]"
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <TrendingUp size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                                    Social
                                </h3>
                                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                                    Social accounts, boosting and more
                                </p>
                            </div>
                            <div className="flex items-center text-text-muted group-hover:text-brand transition-colors pt-1">
                                <ArrowRight size={15} aria-hidden="true" />
                            </div>
                        </Link>

                        {/* 4: More */}
                        <Link
                            href="/user/numbers"
                            className="group bg-bg-surface border border-border-subtle hover:border-brand/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-sm transition-transform duration-150 cursor-pointer active:scale-[0.96]"
                        >
                            <div className="w-10 h-10 rounded-full bg-bg-base border border-border-subtle text-text-secondary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <LayoutGrid size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                                    More
                                </h3>
                                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                                    Explore all services
                                </p>
                            </div>
                            <div className="flex items-center text-text-muted group-hover:text-brand transition-colors pt-1">
                                <ArrowRight size={15} aria-hidden="true" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ──── 4. Recent Transactions (Non-hardcoded currency symbol) ──── */}
                <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-bold text-text-primary tracking-tight">
                                Recent Transactions
                            </h3>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Your latest purchases and wallet activities.
                            </p>
                        </div>

                        <Link
                            href="/user/wallet/history"
                            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0"
                        >
                            <span>View all</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>

                    {/* Transactions Card / Desktop Table & Mobile List */}
                    <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-xs overflow-hidden">
                        {transactionsList.length === 0 ? (
                            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                                <div className="w-12 h-12 rounded-full bg-brand-subtle text-brand flex items-center justify-center mb-3.5 shadow-2xs">
                                    <Receipt size={22} className="stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h4 className="text-sm font-bold text-text-primary tracking-tight">
                                    No transactions yet
                                </h4>
                                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                                    When you fund your wallet or purchase airtime, data, and digital services, your activity will appear here.
                                </p>
                                <div className="flex items-center gap-2.5 mt-5">
                                    <Link
                                        href="/user/wallet/fund"
                                        className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground hover:bg-brand-hover active:scale-[0.96] text-xs font-bold px-3.5 py-2 rounded-lg transition-transform shadow-xs cursor-pointer"
                                    >
                                        <span>+ Add Money</span>
                                    </Link>
                                    <Link
                                        href="/user/services/airtime"
                                        className="inline-flex items-center gap-1.5 border border-border-subtle bg-bg-base hover:bg-bg-surface-hover active:scale-[0.96] text-text-primary text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <span>Explore Services</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table (Hidden on mobile) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-bold border-b border-border-subtle select-none">
                                                <th className="px-5 py-3 w-36">Type</th>
                                                <th className="px-5 py-3">Description</th>
                                                <th className="px-5 py-3 text-right">Amount</th>
                                                <th className="px-5 py-3 text-center w-28">Status</th>
                                                <th className="px-5 py-3 text-right w-36">Date</th>
                                                <th className="px-3 py-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-subtle">
                                            {transactionsList.map((txn: any) => {
                                                const isCredit = txn.type === 'credit';
                                                const iconInfo = getCategoryIcon(txn.category);
                                                const CategoryIcon = iconInfo.icon;
                                                const txnSymbol = getTxnSymbol(txn.currency_code);

                                                return (
                                                    <tr
                                                        key={txn.id}
                                                        onClick={() => setSelectedTxn(txn)}
                                                        className="hover:bg-bg-surface-hover/60 transition-colors cursor-pointer group"
                                                        title="Click to view receipt"
                                                    >
                                                        {/* Type with Icon */}
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", iconInfo.bg)}>
                                                                    <CategoryIcon size={14} />
                                                                </div>
                                                                <span className="font-bold capitalize text-text-primary">
                                                                    {txn.category ? txn.category.replace(/_/g, ' ') : (isCredit ? 'Funding' : 'Purchase')}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Description */}
                                                        <td className="px-5 py-3.5 font-medium text-text-secondary">
                                                            <span className="truncate max-w-sm block">{txn.description}</span>
                                                        </td>

                                                        {/* Amount with dynamic non-hardcoded symbol */}
                                                        <td className={cn(
                                                            "px-5 py-3.5 text-right font-mono tabular-nums font-bold",
                                                            isCredit ? "text-success" : "text-text-primary"
                                                        )}>
                                                            {isCredit ? '+' : '-'}{txnSymbol}{(Number(txn.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-5 py-3.5 text-center">
                                                            {txn.status === 'completed' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-bg text-success border border-success-border/60">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                                    Completed
                                                                </span>
                                                            ) : txn.status === 'pending' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-bg text-warning border border-warning-border/60">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                                                                    Pending
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-bg text-error border border-error-border/60">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-error" />
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Date */}
                                                        <td className="px-5 py-3.5 text-right text-text-muted text-[11px]">
                                                            {txn.date}
                                                        </td>

                                                        {/* Action Arrow */}
                                                        <td className="px-3 py-3.5 text-right text-text-muted group-hover:text-text-primary transition-colors">
                                                            <ChevronRight size={15} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List Format (Hidden on desktop) */}
                                <div className="md:hidden divide-y divide-border-subtle">
                                    {transactionsList.map((txn: any) => {
                                        const isCredit = txn.type === 'credit';
                                        const iconInfo = getCategoryIcon(txn.category);
                                        const CategoryIcon = iconInfo.icon;
                                        const txnSymbol = getTxnSymbol(txn.currency_code);

                                        return (
                                            <div
                                                key={txn.id}
                                                onClick={() => setSelectedTxn(txn)}
                                                className="p-4 flex items-center justify-between gap-3 hover:bg-bg-surface-hover/50 transition-colors cursor-pointer active:scale-[0.96]"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", iconInfo.bg)}>
                                                        <CategoryIcon size={16} aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-text-primary truncate">
                                                            {txn.description}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted mt-0.5">
                                                            {txn.date}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end shrink-0 gap-1">
                                                    <span className={cn(
                                                        "text-xs font-bold font-mono tabular-nums",
                                                        isCredit ? "text-success" : "text-text-primary"
                                                    )}>
                                                        {isCredit ? '+' : '-'}{txnSymbol}{(Number(txn.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                                        txn.status === 'completed' 
                                                            ? "bg-success-bg text-success" 
                                                            : txn.status === 'pending'
                                                            ? "bg-warning-bg text-warning"
                                                            : "bg-error-bg text-error"
                                                    )}>
                                                        {txn.status === 'completed' ? 'Completed' : txn.status === 'pending' ? 'Pending' : 'Failed'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ──── 5. Promotional Banner (At bottom) ──── */}
                <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-brand-active via-brand to-brand-hover text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-sm">
                    {/* Background abstract wifi / device watermark */}
                    <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none blur-xl" />

                    <div className="space-y-1.5 max-w-xl z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold tracking-wider uppercase inline-block">
                            EXCLUSIVE PROMO
                        </span>
                        <h4 className="text-base sm:text-lg font-bold tracking-tight text-white">
                            Get 5% bonus on your next data purchase!
                        </h4>
                        <p className="text-xs text-white/85 leading-relaxed">
                            Buy data this week and receive 5% cashback on your next purchase. T&amp;C applies.
                        </p>
                    </div>

                    <div className="z-10 shrink-0 w-full md:w-auto">
                        <Link
                            href="/user/services/data"
                            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-brand hover:bg-white/95 active:scale-[0.96] text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition-transform duration-150 cursor-pointer whitespace-nowrap"
                        >
                            <span>Buy Data</span>
                            <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>

            </div>

            {/* ──── Transaction Details Receipt Modal ──── */}
            {selectedTxn && (
                <Modal
                    isOpen={!!selectedTxn}
                    onClose={() => setSelectedTxn(null)}
                    title="Transaction Details"
                >
                    <div className="space-y-5 select-none pb-2 animate-scaleIn">
                        <div className="flex flex-col items-center justify-center text-center gap-1.5 pt-2">
                            <div className="w-12 h-12 bg-success-bg text-success rounded-full flex items-center justify-center shadow-xs">
                                <CheckCircle2 size={26} />
                            </div>
                            <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Transaction Receipt</span>
                            <span className="text-2xl font-black text-text-primary font-mono tracking-tight">
                                {selectedTxn.type === 'credit' ? '+' : '-'}{getTxnSymbol(selectedTxn.currency_code)}{(Number(selectedTxn.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-success-bg text-success border border-success-border/60 uppercase">
                                {selectedTxn.status || 'Completed'}
                            </span>
                        </div>

                        <div className="bg-bg-base border border-border-subtle rounded-lg p-4 space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted">Reference ID</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-text-primary font-mono">{selectedTxn.reference}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyRef(selectedTxn.reference)}
                                        className="p-1 text-brand hover:text-brand-hover cursor-pointer"
                                        title="Copy Reference"
                                    >
                                        {copiedRef ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-border-subtle pt-2.5">
                                <span className="text-text-muted">Service / Category</span>
                                <span className="font-bold text-text-primary capitalize">{selectedTxn.category ? selectedTxn.category.replace(/_/g, ' ') : selectedTxn.type}</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-border-subtle pt-2.5">
                                <span className="text-text-muted">Description</span>
                                <span className="font-bold text-text-primary text-right max-w-[200px] truncate">{selectedTxn.description}</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-border-subtle pt-2.5">
                                <span className="text-text-muted">Payment Channel</span>
                                <span className="font-bold text-text-primary">Korak Core Ledger</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-border-subtle pt-2.5">
                                <span className="text-text-muted">Date &amp; Time</span>
                                <span className="font-bold text-text-primary font-mono text-[11px]">{selectedTxn.date}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => handleCopyRef(selectedTxn.reference)}
                                className="flex-1 border border-border-strong text-text-primary hover:bg-bg-surface-hover text-xs font-bold py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
                            >
                                Copy Reference
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTxn(null)}
                                className="flex-1 bg-brand text-brand-foreground hover:bg-brand-hover text-xs font-bold py-2.5 px-3 rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
