import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import {
    ArrowLeft,
    Smartphone,
    Check,
    CheckCircle2,
    Phone,
    X,
    Wallet,
    ArrowRight,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';

interface NetworkItem {
    id: string;
    name: string;
    short?: string;
    data_service: string;
    airtime_service: string;
    color: string;
    logo?: string;
    prefix: string[];
}

interface AirtimeProps {
    networks?: NetworkItem[];
}

const DEFAULT_NETWORKS: NetworkItem[] = [
    {
        id: 'mtn',
        name: 'MTN Nigeria',
        short: 'MTN',
        data_service: 'MTN_DATA',
        airtime_service: 'MTN_VTU',
        color: '#EAB308',
        logo: '/telecom-logos/mtn-seeklogo.svg',
        prefix: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916'],
    },
    {
        id: 'airtel',
        name: 'Airtel Nigeria',
        short: 'Airtel',
        data_service: 'AIRTEL_DATA',
        airtime_service: 'AIRTEL_VTU',
        color: '#EF4444',
        logo: '/telecom-logos/airtel.svg',
        prefix: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'],
    },
    {
        id: 'glo',
        name: 'Glo Nigeria',
        short: 'Glo',
        data_service: 'GLO_DATA',
        airtime_service: 'GLO_VTU',
        color: '#22C55E',
        logo: '/telecom-logos/glo-limited-seeklogo.svg',
        prefix: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
    },
    {
        id: '9mobile',
        name: '9mobile Nigeria',
        short: '9mobile',
        data_service: '9MOBILE_DATA',
        airtime_service: '9MOBILE_VTU',
        color: '#10B981',
        logo: '/telecom-logos/9mobile-seeklogo.svg',
        prefix: ['0809', '0818', '0817', '0909', '0908'],
    },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage(props: AirtimeProps) {
    const { props: pageProps } = usePage<any>();
    const authAccount = pageProps.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(pageProps.auth?.user?.user_currency_id || pageProps.auth?.currency?.id || 1);
    const authCurrency = pageProps.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$', rate: 1.0 } : { code: 'NGN', symbol: '₦', rate: 1300.0 });
    const currentBalance = Number(authAccount.available_balance) || 0;
    const isUsd = (authCurrency.code || '').toUpperCase() === 'USD';
    const rate = Number(authCurrency.rate) || 1500;
    const currencySymbol = authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦');

    const toast = useToast();
    const networks = props.networks || DEFAULT_NETWORKS;

    const [selectedNetworkId, setSelectedNetworkId] = React.useState('mtn');
    const [phone, setPhone] = React.useState('');
    const [selectedAmount, setSelectedAmount] = React.useState<number>(500);
    const [customAmount, setCustomAmount] = React.useState<string>('500');
    const [userSelectedNetworkManually, setUserSelectedNetworkManually] = React.useState(false);
    const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = React.useState(false);
    const networkDropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target as Node)) {
                setIsNetworkDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Universal Transaction Flow
    const flow = useTransactionFlow();

    const selectedNetwork = networks.find(n => n.id === selectedNetworkId) || networks[0];

    // Cleaned phone number (digits only, normalized from +234/234 to 0)
    const normalizedPhone = React.useMemo(() => {
        let cleaned = phone.replace(/[^0-9+]/g, '');
        if (cleaned.startsWith('+234')) {
            cleaned = '0' + cleaned.slice(4);
        } else if (cleaned.startsWith('234') && cleaned.length > 10) {
            cleaned = '0' + cleaned.slice(3);
        }
        return cleaned;
    }, [phone]);

    // Network auto-detection from Nigerian prefixes
    const detectedNetwork = React.useMemo(() => {
        if (normalizedPhone.length >= 4) {
            const prefix = normalizedPhone.substring(0, 4);
            return networks.find(n => n.prefix?.includes(prefix)) || null;
        }
        return null;
    }, [normalizedPhone, networks]);

    // Handle phone number change
    const handlePhoneChange = (val: string) => {
        setPhone(val);
        let digits = val.replace(/[^0-9+]/g, '');
        if (digits.startsWith('+234')) {
            digits = '0' + digits.slice(4);
        } else if (digits.startsWith('234') && digits.length > 10) {
            digits = '0' + digits.slice(3);
        }

        if (digits.length >= 4) {
            const prefix = digits.substring(0, 4);
            const matched = networks.find(n => n.prefix?.includes(prefix));
            if (matched && !userSelectedNetworkManually) {
                setSelectedNetworkId(matched.id);
            }
        }
    };

    const handleSelectNetwork = (id: string) => {
        setSelectedNetworkId(id);
        setUserSelectedNetworkManually(true);
    };

    const handleSelectPresetAmount = (amt: number) => {
        setSelectedAmount(amt);
        setCustomAmount(String(amt));
    };

    const handleCustomAmountChange = (val: string) => {
        setCustomAmount(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
            setSelectedAmount(parsed);
        } else {
            setSelectedAmount(0);
        }
    };

    // Amount calculations (Airtime is denominated in NGN for Nigerian telcos)
    const airtimeNgnAmount = selectedAmount || 0;
    const serviceFeeNgn = 0;
    const totalNgnAmount = airtimeNgnAmount + serviceFeeNgn;

    // Amount in user's currency
    const payableAmount = isUsd
        ? Number((totalNgnAmount / Math.max(rate, 1)).toFixed(2))
        : totalNgnAmount;

    const remainingBalance = Math.max(0, currentBalance - payableAmount);
    const isBalanceInsufficient = currentBalance < payableAmount;
    const isValidPhone = normalizedPhone.length === 11 && /^0[789][01]\d{8}$/.test(normalizedPhone);
    const isAmountValid = airtimeNgnAmount >= 100 && airtimeNgnAmount <= 50000;
    const canContinue = isValidPhone && isAmountValid && !isBalanceInsufficient;

    const handleInitiateReview = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!isValidPhone) {
            toast.error('Please enter a valid 11-digit mobile number (e.g. 08012345678).');
            return;
        }

        if (airtimeNgnAmount < 100 || airtimeNgnAmount > 50000) {
            toast.error('Airtime amount must be between ₦100 and ₦50,000.');
            return;
        }

        if (isBalanceInsufficient) {
            toast.error(`Insufficient wallet balance. You have ${currencySymbol}${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
            return;
        }

        const transactionData: UniversalTransactionData = {
            serviceName: `${selectedNetwork.name} — ₦${airtimeNgnAmount.toLocaleString()} Airtime`,
            serviceCategory: 'Airtime Top-up',
            providerName: selectedNetwork.name,
            providerLogo: selectedNetwork.logo,
            recipient: normalizedPhone,
            recipientLabel: 'Recipient Mobile Number',
            selectedItemName: `₦${airtimeNgnAmount.toLocaleString()} Airtime`,
            selectedItemLabel: 'Airtime Value',
            subtotal: payableAmount,
            totalAmount: payableAmount,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || 'NGN',
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            fee: 0,
            additionalDetails: [
                { label: 'Network Provider', value: selectedNetwork.name },
                { label: 'Airtime Value', value: `₦${airtimeNgnAmount.toLocaleString()}` },
                { label: 'Service Fee', value: '₦0.00 (Free)' },
                { label: 'Wallet Deduction', value: `${currencySymbol}${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'Fulfillment Time', value: 'Instant (~5-15 seconds)' },
            ],
        };

        flow.openConfirmModal(transactionData);
    };

    const handleExecutePurchase = async () => {
        await flow.executePayment('/user/services/bills/purchase', {
            mode: 'airtime',
            network: selectedNetwork.id,
            service_code: selectedNetwork.airtime_service,
            package_code: null,
            phone: normalizedPhone,
            amount: airtimeNgnAmount,
            package_name: `₦${airtimeNgnAmount.toLocaleString()} Airtime`,
        });
    };

    return (
        <>
            <Head title="Airtime Purchase" />

            <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6">
                {/* Desktop Back Link (Hidden on mobile as mobile has header back button) */}
                <div className="hidden md:block">
                    <Link
                        href="/user/services"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Back to Services</span>
                    </Link>
                </div>

                {/* Page Title Row with Squircle Icon */}
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        <Smartphone size={24} className="stroke-[2.2]" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                            Airtime
                        </h1>
                        <p className="text-xs md:text-sm text-text-secondary mt-0.5">
                            Buy airtime for any supported network.
                        </p>
                    </div>
                </div>

                {/* Main 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column (Primary Form, 7 cols on desktop) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Recipient Phone Number & Network */}
                        <div className="space-y-2">
                            <div>
                                <h2 className="text-sm font-bold text-text-primary">
                                    1. Recipient Phone Number &amp; Carrier
                                </h2>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Select your network carrier and enter the recipient mobile number.
                                </p>
                            </div>

                            <div className="relative flex rounded-xl border border-border-subtle bg-bg-surface shadow-2xs focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-colors">
                                {/* Network Select Group / Trigger */}
                                <div ref={networkDropdownRef} className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                                        className="h-full px-3 py-2.5 flex items-center gap-2 border-r border-border-subtle bg-bg-base hover:bg-bg-surface-hover rounded-l-xl transition-colors cursor-pointer select-none"
                                        title="Select Carrier"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-bg-surface border border-border-subtle p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                            {selectedNetwork.logo ? (
                                                <img
                                                    src={selectedNetwork.logo}
                                                    alt={selectedNetwork.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: selectedNetwork.color }}
                                                />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-text-primary hidden sm:inline">
                                            {selectedNetwork.short || selectedNetwork.name}
                                        </span>
                                        <ChevronDown size={14} className={cn("text-text-muted transition-transform", isNetworkDropdownOpen && "rotate-180")} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isNetworkDropdownOpen && (
                                        <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-border-subtle bg-bg-surface shadow-lg z-30 py-1.5 animate-in fade-in-50 zoom-in-95">
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                Select Carrier
                                            </div>
                                            {networks.map(net => {
                                                const isSelected = selectedNetwork.id === net.id;
                                                return (
                                                    <button
                                                        key={net.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleSelectNetwork(net.id);
                                                            setIsNetworkDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer",
                                                            isSelected
                                                                ? "bg-brand/10 text-brand font-bold"
                                                                : "hover:bg-bg-surface-hover text-text-primary"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-6 h-6 rounded-md bg-bg-surface border border-border-subtle p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                                                                {net.logo ? (
                                                                    <img src={net.logo} alt={net.name} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: net.color }} />
                                                                )}
                                                            </div>
                                                            <span className="truncate">{net.name}</span>
                                                        </div>
                                                        {isSelected && <Check size={14} className="text-brand shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Phone Input */}
                                <div className="relative flex-1 flex items-center">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => handlePhoneChange(e.target.value)}
                                        placeholder="08012345678"
                                        maxLength={14}
                                        className="w-full pl-3.5 pr-10 py-3 rounded-r-xl text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent"
                                    />
                                    {phone && (
                                        <button
                                            type="button"
                                            onClick={() => setPhone('')}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Validation / Helper Status */}
                            {isValidPhone ? (
                                <div className="flex items-center gap-1.5 text-xs text-brand font-medium pt-0.5">
                                    <CheckCircle2 size={14} className="shrink-0 text-brand" />
                                    <span>
                                        Valid 11-digit mobile number. Network detected: {detectedNetwork?.name || selectedNetwork.name}.
                                    </span>
                                </div>
                            ) : normalizedPhone.length > 0 && detectedNetwork ? (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted pt-0.5">
                                    <span>
                                        Network detected: {detectedNetwork.name} ({normalizedPhone.length}/11 digits)
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {/* 2. Select Amount */}
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-sm font-bold text-text-primary">
                                    2. Select Amount
                                </h2>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Choose a quick amount or enter a custom amount.
                                </p>
                            </div>

                            {/* 2x3 Quick Amount Presets */}
                            <div className="grid grid-cols-3 gap-3">
                                {QUICK_AMOUNTS.map(amt => {
                                    const isSelected = selectedAmount === amt;
                                    return (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => handleSelectPresetAmount(amt)}
                                            className={cn(
                                                "py-3 px-2 rounded-xl text-center font-bold text-sm transition-all border cursor-pointer font-mono",
                                                isSelected
                                                    ? "border-brand text-brand bg-brand/[0.04] ring-1 ring-brand"
                                                    : "border-border-subtle bg-bg-surface text-text-primary hover:border-border-strong hover:bg-bg-surface-hover"
                                            )}
                                        >
                                            ₦{amt.toLocaleString()}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Amount Input */}
                            <div className="space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted font-bold text-sm">
                                        ₦
                                    </div>
                                    <input
                                        type="number"
                                        min="100"
                                        max="50000"
                                        value={customAmount}
                                        onChange={e => handleCustomAmountChange(e.target.value)}
                                        placeholder="Enter custom amount"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-border-subtle bg-bg-surface text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <span className="text-[11px] text-text-muted">
                                        Min: ₦100 | Max: ₦50,000
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Compact Horizontal Order Summary Strip (Hidden on Desktop) */}
                        <div className="block lg:hidden pt-2 space-y-3">
                            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-between shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center shrink-0">
                                        {selectedNetwork.logo ? (
                                            <img
                                                src={selectedNetwork.logo}
                                                alt={selectedNetwork.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: selectedNetwork.color }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-text-primary block leading-tight">
                                            {selectedNetwork.name}
                                        </span>
                                        <span className="text-[11px] font-mono text-text-muted block">
                                            {normalizedPhone || '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-black text-text-primary font-mono block leading-tight">
                                        ₦{airtimeNgnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-[10px] text-text-muted block">
                                        + ₦0.00 fee
                                    </span>
                                </div>
                            </div>

                            {/* Mobile Insufficient Balance Warning */}
                            {isBalanceInsufficient && (
                                <div className="p-3 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle size={15} className="shrink-0" />
                                        <span>Insufficient wallet balance</span>
                                    </div>
                                    <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                                        Add Money
                                    </Link>
                                </div>
                            )}

                            {/* Mobile CTA */}
                            <button
                                type="button"
                                onClick={() => handleInitiateReview()}
                                disabled={!canContinue || flow.isProcessing}
                                className="w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span>Continue to Review</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Desktop Continue to Review Button (Hidden on Mobile) */}
                        <div className="hidden lg:block pt-2">
                            <button
                                type="button"
                                onClick={() => handleInitiateReview()}
                                disabled={!canContinue || flow.isProcessing}
                                className="w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span>Continue to Review</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Order Summary Card (Desktop Only, 5 cols) */}
                    <div className="hidden lg:block lg:col-span-5 sticky top-20">
                        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs space-y-6">
                            <h3 className="text-base font-bold text-text-primary">
                                Order Summary
                            </h3>

                            {/* Selected Network Preview Box */}
                            <div className="bg-bg-base rounded-xl p-3.5 flex items-center gap-3.5 border border-border-subtle/60">
                                <div className="w-11 h-11 rounded-lg bg-bg-surface border border-border-subtle p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                    {selectedNetwork.logo ? (
                                        <img
                                            src={selectedNetwork.logo}
                                            alt={selectedNetwork.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span
                                            className="w-3.5 h-3.5 rounded-full"
                                            style={{ backgroundColor: selectedNetwork.color }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-text-primary leading-tight">
                                        {selectedNetwork.name}
                                    </h4>
                                    <span className="text-xs text-text-muted mt-0.5 block">
                                        Airtime
                                    </span>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-3.5 text-xs md:text-sm">
                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Recipient</span>
                                    <span className="font-bold font-mono text-text-primary">
                                        {normalizedPhone || '—'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Airtime Amount</span>
                                    <span className="font-bold font-mono text-text-primary">
                                        ₦{airtimeNgnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Service Fee</span>
                                    <span className="font-bold font-mono text-text-primary">
                                        ₦0.00
                                    </span>
                                </div>

                                <div className="border-t border-border-subtle pt-3.5 flex items-center justify-between">
                                    <span className="text-sm font-bold text-text-primary">
                                        Total
                                    </span>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-text-primary font-mono block leading-tight">
                                            ₦{totalNgnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        {isUsd && (
                                            <span className="text-[11px] text-text-muted font-mono block mt-0.5">
                                                ≈ {currencySymbol}{payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Embedded Wallet Balance Card */}
                            <div className="rounded-xl p-3.5 bg-brand/[0.04] border border-brand/20 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-bg-surface border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-2xs">
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-text-secondary font-medium block leading-tight">
                                            Wallet Balance
                                        </span>
                                        <span className="text-xs font-bold text-text-primary font-mono block mt-0.5">
                                            {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[11px] text-text-secondary font-medium block leading-tight">
                                        After purchase
                                    </span>
                                    <span className="text-xs font-bold text-text-primary font-mono block mt-0.5">
                                        {currencySymbol}{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Insufficient Balance Alert */}
                            {isBalanceInsufficient && (
                                <div className="p-3 rounded-xl bg-error-bg/30 border border-error/30 text-xs text-error flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle size={15} className="shrink-0" />
                                        <span>Insufficient balance</span>
                                    </div>
                                    <Link href="/user/wallet/fund" className="font-bold underline text-xs">
                                        Add Money →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Universal Transaction Modal (Confirmation, Processing, Result) */}
            <TransactionFlowModal
                step={flow.step}
                data={flow.data}
                isProcessing={flow.isProcessing}
                isCheckingStatus={flow.isCheckingStatus}
                onClose={flow.resetFlow}
                onConfirmPay={handleExecutePurchase}
                handlers={{
                    onBuyAgain: () => {
                        flow.resetFlow();
                        setPhone('');
                        setSelectedAmount(1000);
                        setCustomAmount('1000');
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

AirtimePage.layout = (page: React.ReactNode) => (
    <AppShell title="Airtime" backUrl="/user/services">
        {page}
    </AppShell>
);