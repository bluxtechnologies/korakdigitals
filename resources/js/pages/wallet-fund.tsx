import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
    Building2,
    Copy,
    RefreshCw,
    CheckCircle2,
    ArrowDownLeft,
    AlertCircle,
    Clock,
    ChevronRight,
    Wallet,
    History,
    Banknote,
    SendHorizonal,
    Zap,
} from 'lucide-react';

export default function WalletFund() {
    const { props } = usePage<any>();
    const authUser = props.auth?.user || { name: 'Customer' };
    const userCurrencyId = Number(authUser.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$' } : { code: 'NGN', symbol: '₦' });
    const fundingAccount = props.fundingAccount || null;
    const recentDeposits = props.recentDeposits || [];
    const toast = useToast();

    // Dedicated Virtual Bank Account Details
    const bankDetails = {
        bankName: fundingAccount?.bank_name || 'Paga / FinityPay',
        accountName: fundingAccount?.account_name || (authUser.name ? `KORAK / ${authUser.name}` : 'Korak Virtual Account'),
        accountNumber: fundingAccount?.account_number || null,
        status: fundingAccount?.status || 'active',
    };

    const [isRetrieving, setIsRetrieving] = React.useState(false);

    const handleCopyAll = () => {
        if (!bankDetails.accountNumber) return;
        const textToCopy = `Bank: ${bankDetails.bankName}\nAccount Name: ${bankDetails.accountName}\nAccount Number: ${bankDetails.accountNumber}`;
        navigator.clipboard.writeText(textToCopy);
        toast.success('All deposit details copied to clipboard!');
    };

    const handleRetrieve = () => {
        setIsRetrieving(true);
        router.reload({
            only: ['fundingAccount'],
            onFinish: () => {
                setIsRetrieving(false);
            },
        });
    };

    const getTxnSymbol = (code?: string) => {
        const c = (code || '').toUpperCase();
        if (c === 'USD') return '$';
        if (c === 'NGN') return '₦';
        if (c === 'EUR') return '€';
        if (c === 'GBP') return '£';
        return c ? `${c} ` : (authCurrency.symbol || '$');
    };

    return (
        <>
            <Head title="Fund Wallet" />

            <div className="max-w-6xl mx-auto space-y-5 select-none pb-16">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-text-primary tracking-tight">Fund Wallet</h1>
                            <Badge variant="success" dot className="font-bold text-[10px]">Instant 24/7</Badge>
                        </div>
                        <p className="text-xs text-text-secondary">
                            Transfer to your dedicated virtual account to top up your balance automatically in seconds.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/user/wallet"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-brand transition-colors"
                        >
                            <Wallet className="w-3.5 h-3.5" />
                            Overview
                        </Link>
                        <span className="text-border-strong">·</span>
                        <Link
                            href="/user/wallet/history"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-brand transition-colors"
                        >
                            <History className="w-3.5 h-3.5" />
                            History
                        </Link>
                    </div>
                </div>

                {/* Main 2-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Left 2 Columns ─────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* ── Virtual Account Card ──────────────────────────── */}
                        <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs overflow-hidden">

                            {/* Card Header Strip */}
                            <div className="px-6 pt-6 pb-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-brand shrink-0" />
                                        <h3 className="text-sm font-bold text-text-primary tracking-tight">
                                            Your Dedicated Virtual Account
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-text-muted">
                                        Permanent NUBAN account exclusively linked to your Korak wallet.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success bg-success-bg border border-success-border px-2.5 py-1 rounded-full shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    Auto-Credit Active
                                </span>
                            </div>

                            <div className="p-6">
                                {bankDetails.accountNumber ? (
                                    <div className="space-y-4">

                                        {/* Account Number Hero Box */}
                                        <div className="p-5 bg-brand/5 border border-brand/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                                                    Account Number (NUBAN)
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-brand select-all">
                                                    {bankDetails.accountNumber}
                                                </div>
                                            </div>
                                            <CopyButton
                                                text={bankDetails.accountNumber}
                                                variant="button"
                                                label="Copy Number"
                                                className="w-full sm:w-auto justify-center font-bold text-xs bg-brand text-brand-foreground hover:bg-brand-hover border-transparent shadow-xs"
                                            />
                                        </div>

                                        {/* Bank Name & Account Name */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                            <div className="p-4 bg-bg-base border border-border-subtle rounded-xl flex items-center justify-between gap-2">
                                                <div className="space-y-0.5 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                                                        Bank Name
                                                    </span>
                                                    <span className="text-xs font-black text-text-primary block truncate">
                                                        {bankDetails.bankName}
                                                    </span>
                                                </div>
                                                <CopyButton text={bankDetails.bankName} variant="icon" size="sm" />
                                            </div>

                                            <div className="p-4 bg-bg-base border border-border-subtle rounded-xl flex items-center justify-between gap-2">
                                                <div className="space-y-0.5 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                                                        Account Name
                                                    </span>
                                                    <span className="text-xs font-black text-text-primary block truncate" title={bankDetails.accountName}>
                                                        {bankDetails.accountName}
                                                    </span>
                                                </div>
                                                <CopyButton text={bankDetails.accountName} variant="icon" size="sm" />
                                            </div>

                                        </div>

                                        {/* Fee & Instant Credit Notice Banner */}
                                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-text-primary text-xs">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <div className="text-[11px] leading-relaxed">
                                                <span className="font-bold text-amber-700 dark:text-amber-500">Notice: </span>
                                                A flat charge of <span className="font-bold font-mono">₦10</span> applies per bank transfer deposit.
                                            </div>
                                        </div>

                                        {/* Copy All Row */}
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleCopyAll}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand hover:underline cursor-pointer"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy All Account Details
                                            </button>
                                        </div>

                                    </div>
                                ) : (
                                    /* Provisioning State */
                                    <div className="py-10 text-center space-y-4">
                                        <div className="w-12 h-12 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1.5 max-w-sm mx-auto">
                                            <div className="text-sm font-bold text-text-primary">Generating Your Dedicated Account</div>
                                            <p className="text-xs text-text-muted">
                                                Your dedicated virtual bank account is being provisioned. Click below to refresh and retrieve your account details.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            className="text-xs font-bold shadow-xs"
                                            disabled={isRetrieving}
                                            isLoading={isRetrieving}
                                            onClick={handleRetrieve}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                            Retrieve Account Details
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── How It Works ──────────────────────────────────── */}
                        <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs p-5 space-y-4">
                            <h4 className="text-sm font-bold text-text-primary tracking-tight">
                                How Bank Transfer Deposit Works
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                <div className="p-4 bg-bg-base border border-border-subtle rounded-xl space-y-2">
                                    <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                        <Copy className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-text-primary block">Copy Account Info</span>
                                    <span className="text-[11px] text-text-muted leading-snug block">
                                        Copy the account number and bank name shown above.
                                    </span>
                                </div>

                                <div className="p-4 bg-bg-base border border-border-subtle rounded-xl space-y-2">
                                    <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                        <SendHorizonal className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-text-primary block">Send Funds</span>
                                    <span className="text-[11px] text-text-muted leading-snug block">
                                        Transfer any amount from your bank app, Kuda, OPay, or USSD.
                                    </span>
                                </div>

                                <div className="p-4 bg-bg-base border border-border-subtle rounded-xl space-y-2">
                                    <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                        <Zap className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-text-primary block">Instant Credit</span>
                                    <span className="text-[11px] text-text-muted leading-snug block">
                                        Your Korak wallet balance updates automatically in seconds.
                                    </span>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* ── Right Column ───────────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Recent Deposit Log */}
                        <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs p-5 space-y-4">

                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-text-primary tracking-tight">Recent Deposits</h3>
                                    {recentDeposits.length > 0 && (
                                        <span className="text-[10px] font-mono font-bold bg-bg-base border border-border-subtle text-text-muted px-1.5 py-0.5 rounded-md">
                                            {recentDeposits.length}
                                        </span>
                                    )}
                                </div>
                                <Link
                                    href="/user/wallet/history"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                                >
                                    All History
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {recentDeposits.length === 0 ? (
                                <div className="py-8 text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-bg-base border border-border-subtle text-text-muted mx-auto flex items-center justify-center">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="text-xs font-bold text-text-primary">No Deposits Yet</div>
                                    <p className="text-[11px] text-text-muted max-w-[200px] mx-auto">
                                        Transfers to your virtual account will appear here instantly.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentDeposits.map((dep: any) => {
                                        const symbol = getTxnSymbol(dep.currency_code);
                                        const isSuccess = dep.status === 'success' || !dep.status;
                                        const isFailed = dep.status === 'failed' || dep.status === 'rejected';
                                        const isPending = dep.status === 'pending';

                                        return (
                                            <div
                                                key={dep.id}
                                                className="p-3.5 bg-bg-base border border-border-subtle rounded-xl flex items-center justify-between gap-3 text-xs hover:border-border-strong transition-colors"
                                            >
                                                {/* Icon + Description */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                        isSuccess && "bg-success/10 text-success",
                                                        isFailed && "bg-danger/10 text-danger",
                                                        isPending && "bg-warning/10 text-warning",
                                                    )}>
                                                        {isSuccess && <ArrowDownLeft className="w-4 h-4" />}
                                                        {isFailed && <AlertCircle className="w-4 h-4" />}
                                                        {isPending && <Clock className="w-4 h-4" />}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 space-y-0.5">
                                                        <span className="font-bold text-text-primary truncate">
                                                            {dep.description || 'Bank Transfer Deposit'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                                                            <span>
                                                                {dep.created_at
                                                                    ? new Date(dep.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                                                                    : 'Recent'}
                                                            </span>
                                                            {dep.reference && (
                                                                <span className="truncate max-w-[80px]" title={dep.reference}>
                                                                    · {dep.reference}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Amount + Badge */}
                                                <div className="flex flex-col items-end shrink-0 space-y-1">
                                                    <span className={cn(
                                                        "font-mono font-bold",
                                                        isSuccess && "text-success",
                                                        isFailed && "text-danger line-through opacity-60",
                                                        isPending && "text-warning",
                                                    )}>
                                                        +{symbol}{Number(dep.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {isSuccess && (
                                                        <Badge variant="success" dot className="text-[9px] font-bold px-1.5 py-0">Success</Badge>
                                                    )}
                                                    {isFailed && (
                                                        <Badge variant="danger" dot className="text-[9px] font-bold px-1.5 py-0">Failed</Badge>
                                                    )}
                                                    {isPending && (
                                                        <Badge variant="warning" dot className="text-[9px] font-bold px-1.5 py-0">Pending</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Security Info Card */}
                        <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                <h4 className="text-sm font-bold text-text-primary tracking-tight">Safe &amp; Secure</h4>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Your dedicated NUBAN account is unique to you only.',
                                    'All transfers are protected and monitored 24/7.',
                                    'A flat fee of ₦10 applies per deposit transaction.',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-text-muted">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

WalletFund.layout = (page: React.ReactNode) => (
    <AppShell title="Fund Wallet" backUrl="/user/wallet">
        {page}
    </AppShell>
);


