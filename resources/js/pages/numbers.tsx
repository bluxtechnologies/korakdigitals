import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { SearchIcon, InboxIcon } from '@/components/ui/Icons';
import { CopyButton } from '@/components/ui/CopyButton';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { cn } from '@/lib/utils';

export interface CountryOption {
    id: number;
    name: string;
    code: string;
    flag: string;
    dialCode: string;
}

export interface ServiceOption {
    code: string;
    name: string;
    icon?: string;
    description: string;
}

export interface CatalogOffer {
    cost_usd: number;
    price: number;
    total_count: number;
}

export interface OrderItemPayload {
    activation_id?: string;
    phone_number?: string;
    country_id?: number;
    country_name?: string;
    service_code?: string;
    service_name?: string;
    sms_code?: string | null;
    sms_text?: string | null;
    status?: string;
    expires_at?: string;
    received_at?: string;
    created_at?: string;
}

export interface ActiveOrderItem {
    id: number;
    order_id: number;
    item_title: string;
    subtotal: number;
    currency_code: string;
    status: string;
    supplier_order_reference?: string;
    credentials_payload?: OrderItemPayload;
    created_at: string;
}

export interface ActiveOrder {
    id: number;
    public_reference: string;
    service_category: string;
    total_amount: number;
    currency_code: string;
    status: string;
    created_at: string;
    items?: ActiveOrderItem[];
}

interface NumbersPageProps {
    activeOrders: ActiveOrder[];
    popularCountries: CountryOption[];
    popularServices: ServiceOption[];
    initialCatalog: Record<string, Record<number, CatalogOffer>>;
    walletBalance: number;
    userCurrency: string;
}

// Sub-component for individual active number countdown, live OTP polling & actions
const ActiveNumberCard: React.FC<{
    order: ActiveOrder;
    item: ActiveOrderItem;
    currencySymbol: string;
    onStatusUpdate: (orderItemId: number, code: string, text?: string) => void;
}> = ({ order, item, currencySymbol, onStatusUpdate }) => {
    const toast = useToast();
    const payload = item.credentials_payload || {};
    const [smsCode, setSmsCode] = React.useState<string | null>(payload.sms_code || null);
    const [smsText, setSmsText] = React.useState<string | null>(payload.sms_text || null);
    const [itemStatus, setItemStatus] = React.useState<string>(item.status);
    const [timeLeft, setTimeLeft] = React.useState<string>('--:--');
    const [isCancelling, setIsCancelling] = React.useState(false);
    const [isFinishing, setIsFinishing] = React.useState(false);

    const expiresAtMs = React.useMemo(() => {
        if (!payload.expires_at) return Date.now() + 20 * 60 * 1000;
        return new Date(payload.expires_at).getTime();
    }, [payload.expires_at]);

    // Live countdown timer
    React.useEffect(() => {
        const updateTimer = () => {
            const diff = expiresAtMs - Date.now();
            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAtMs]);

    // Hybrid polling fallback: polls backend every 4.5 seconds if waiting for code
    React.useEffect(() => {
        if (smsCode || itemStatus === 'completed' || itemStatus === 'cancelled') {
            return;
        }

        const pollStatus = async () => {
            try {
                const res = await fetch(`/user/numbers/status/${item.id}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();

                if (data.sms_code) {
                    setSmsCode(data.sms_code);
                    setSmsText(data.sms_text || null);
                    setItemStatus('completed');
                    onStatusUpdate(item.id, data.sms_code, data.sms_text);
                    toast.success(`Verification code received: ${data.sms_code}`, 'SMS Arrived!');
                }
            } catch {
                // Ignore network glitches during periodic polling
            }
        };

        const interval = setInterval(pollStatus, 4500);
        return () => clearInterval(interval);
    }, [item.id, smsCode, itemStatus, onStatusUpdate, toast]);

    const handleCancelAndRefund = () => {
        if (isCancelling) return;
        setIsCancelling(true);
        router.post(`/user/numbers/cancel/${item.id}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setItemStatus('cancelled');
                toast.success('Number cancelled. Refund credited to your wallet.', 'Refund Processed');
            },
            onError: (err: any) => {
                toast.error(err.cancel || err.message || 'Unable to cancel this activation.');
            },
            onFinish: () => setIsCancelling(false),
        });
    };

    const handleFinish = () => {
        if (isFinishing) return;
        setIsFinishing(true);
        router.post(`/user/numbers/finish/${item.id}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setItemStatus('completed');
                toast.success('Number activation marked as finished.');
            },
            onError: (err: any) => {
                toast.error(err.finish || err.message || 'Unable to finalize activation.');
            },
            onFinish: () => setIsFinishing(false),
        });
    };

    const isDone = !!smsCode || itemStatus === 'completed';
    const isCancelled = itemStatus === 'cancelled';
    const phoneNumber = payload.phone_number || 'Awaiting Allocation';

    return (
        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs flex flex-col gap-4 animate-fadeIn">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">
                        {payload.service_name || item.item_title} Number
                    </span>
                    <span className="text-[10px] text-text-muted">
                        Ref: {order.public_reference} • {payload.country_name || 'Global'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {!isDone && !isCancelled && (
                        <span className="text-xs font-semibold text-text-secondary select-none">
                            Expires: <strong className="text-text-primary font-mono tabular-nums">{timeLeft}</strong>
                        </span>
                    )}
                    <Badge
                        variant={isCancelled ? 'danger' : isDone ? 'success' : 'primary'}
                        dot={!isDone && !isCancelled}
                    >
                        {isCancelled ? 'Cancelled / Refunded' : isDone ? 'SMS Received' : 'Waiting for SMS'}
                    </Badge>
                </div>
            </div>

            {/* Real Number Display */}
            <div className="flex items-center justify-between bg-bg-base p-3 rounded-sm border border-border-subtle">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Assigned Number</span>
                    <span className="font-mono tabular-nums text-base font-bold text-text-primary select-all">
                        {phoneNumber}
                    </span>
                </div>
                {phoneNumber !== 'Awaiting Allocation' && (
                    <CopyButton text={phoneNumber} size="sm" />
                )}
            </div>

            {/* OTP Message Area */}
            {isCancelled ? (
                <div className="p-3 bg-bg-base/60 border border-border-subtle rounded-sm text-center text-xs text-text-muted">
                    This order was cancelled and refunded.
                </div>
            ) : isDone ? (
                <div className="bg-success-bg border border-success-border p-4 rounded-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-success uppercase tracking-wider">Verification SMS Code</span>
                        <CopyButton text={smsCode || ''} label="Copy Code" variant="pill" size="xs" />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-mono tabular-nums text-3xl font-extrabold text-success tracking-wider select-all">
                            {smsCode}
                        </span>
                        {smsText && (
                            <div className="text-xs text-text-secondary border-l border-success-border pl-4 break-words max-w-xs">
                                {smsText}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 border border-dashed border-border-strong rounded-sm text-center flex flex-col items-center justify-center gap-2 py-5 select-none bg-bg-base/40">
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-text-secondary">Waiting for verification code...</span>
                    <span className="text-[10px] text-text-muted">
                        Enter the phone number in your app. Code will automatically arrive here.
                    </span>
                </div>
            )}

            {/* Action Bar */}
            {!isCancelled && (
                <div className="flex justify-end gap-2 border-t border-border-subtle pt-3 mt-1">
                    {!isDone ? (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancelAndRefund}
                            disabled={isCancelling}
                            className="text-xs font-bold"
                        >
                            {isCancelling ? 'Refunding...' : 'Cancel & Refund'}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleFinish}
                            disabled={isFinishing || itemStatus === 'completed'}
                            className="text-xs font-bold"
                        >
                            {isFinishing ? 'Finishing...' : 'Mark Done'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default function Numbers() {
    const { props } = usePage<{
        activeOrders: ActiveOrder[];
        popularCountries: CountryOption[];
        popularServices: ServiceOption[];
        initialCatalog: Record<string, Record<number, CatalogOffer>>;
        walletBalance: number;
        userCurrency: string;
        auth?: any;
    }>();

    const popularCountries = props.popularCountries || [];
    const popularServices = props.popularServices || [];
    const initialCatalog = props.initialCatalog || {};
    const walletBalance = Number(props.walletBalance || props.auth?.account?.available_balance || 0);
    const userCurrency = props.userCurrency || props.auth?.currency?.code || 'NGN';
    const currencySymbol = userCurrency === 'USD' ? '$' : '₦';

    const toast = useToast();
    const flow = useTransactionFlow();

    // Filters and selections
    const [countrySearch, setCountrySearch] = React.useState('');
    const [selectedCountry, setSelectedCountry] = React.useState<CountryOption>(
        popularCountries[0] || { id: 187, name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1' }
    );
    const [serviceSearch, setServiceSearch] = React.useState('');
    const [selectedService, setSelectedService] = React.useState<ServiceOption | null>(null);

    // Active orders state with live update reactivity
    const [ordersList, setOrdersList] = React.useState<ActiveOrder[]>(props.activeOrders || []);
    React.useEffect(() => {
        setOrdersList(props.activeOrders || []);
    }, [props.activeOrders]);

    const handleStatusUpdate = React.useCallback((orderItemId: number, code: string, text?: string) => {
        setOrdersList((prev) =>
            prev.map((order) => ({
                ...order,
                items: order.items?.map((item) => {
                    if (item.id === orderItemId) {
                        return {
                            ...item,
                            status: 'completed',
                            credentials_payload: {
                                ...(item.credentials_payload || {}),
                                sms_code: code,
                                sms_text: text || null,
                                status: 'STATUS_OK',
                            },
                        };
                    }
                    return item;
                }),
            }))
        );
    }, []);

    // Filter country choices
    const filteredCountries = popularCountries.filter(
        (c) =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.dialCode.includes(countrySearch)
    );

    // Filter service choices
    const filteredServices = popularServices.filter((s) =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    // Get pricing from live catalog for a given service and country
    const getPriceFor = React.useCallback(
        (serviceCode: string, countryId: number): { price: number; costUsd: number } => {
            const offer = initialCatalog[serviceCode]?.[countryId];
            if (offer) {
                return { price: offer.price, costUsd: offer.cost_usd };
            }
            // Fallback default calculation
            const fallbackUsd = 1.50;
            const fallbackPrice = userCurrency === 'NGN' ? Math.round(fallbackUsd * 1500 * 1.2) : Number((fallbackUsd * 1.2).toFixed(2));
            return { price: fallbackPrice, costUsd: fallbackUsd };
        },
        [initialCatalog, userCurrency]
    );

    const handleInitiatePurchase = () => {
        if (!selectedService) {
            toast.error('Please select an application or platform to verify.');
            return;
        }

        const pricing = getPriceFor(selectedService.code, selectedCountry.id);
        const remainingBalance = Math.max(0, walletBalance - pricing.price);

        const txData: UniversalTransactionData = {
            serviceName: `Virtual Number: ${selectedService.name}`,
            serviceCategory: 'Virtual Numbers & OTP',
            serviceType: 'numbers',
            providerName: `${selectedCountry.flag} ${selectedCountry.name}`,
            recipient: `${selectedCountry.name} (${selectedCountry.dialCode})`,
            recipientLabel: 'Country Region',
            selectedItemName: `${selectedService.name} Quick Activation`,
            selectedItemLabel: 'App Platform',
            quantity: 1,
            subtotal: pricing.price,
            totalAmount: pricing.price,
            currencySymbol: currencySymbol,
            currencyCode: userCurrency,
            currentBalance: walletBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            additionalDetails: [
                { label: 'Platform App', value: selectedService.name },
                { label: 'Country Region', value: `${selectedCountry.name} (${selectedCountry.dialCode})` },
                { label: 'Usage Mode', value: 'Quick Activation (Single OTP)' },
                { label: 'Validity Window', value: '20 Minutes (Full refund if no SMS)' },
            ],
        };

        flow.initiateFlow(txData);
        flow.openConfirmModal();
    };

    const handleExecutePurchase = () => {
        if (!selectedService) return;
        flow.startProcessing();

        const pricing = getPriceFor(selectedService.code, selectedCountry.id);

        router.post('/user/numbers/purchase', {
            service_code: selectedService.code,
            service_name: selectedService.name,
            country_id: selectedCountry.id,
            country_name: selectedCountry.name,
            cost_usd: pricing.costUsd,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                flow.completeSuccess({
                    reference: 'KORAK-' + Math.floor(100000 + Math.random() * 900000),
                    status: 'completed',
                    date: new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    notes: `Allocation request submitted for ${selectedService.name}`,
                });
                toast.success('Virtual number reserved! Waiting for SMS code.', 'Number Allocated');
                setSelectedService(null);
            },
            onError: (err: any) => {
                flow.completeFailed(err.purchase || err.message || 'Failed to order number. Check your wallet balance.');
                toast.error(err.purchase || err.message || 'Failed to order number. Check your wallet balance.');
            },
        });
    };

    // Flatten active items for display
    const activeNumberItems = React.useMemo(() => {
        const results: { order: ActiveOrder; item: ActiveOrderItem }[] = [];
        ordersList.forEach((order) => {
            (order.items || []).forEach((item) => {
                if (order.service_category === 'numbers') {
                    results.push({ order, item });
                }
            });
        });
        return results;
    }, [ordersList]);

    return (
        <>
            <Head title="Virtual Numbers & OTP Activation — Korak" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">

                {/* Page Title & Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                                Virtual Phone Numbers
                            </h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg-surface border border-border-subtle px-2.5 py-0.5 rounded-full">
                                Paused
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Temporary phone numbers for instant SMS verification codes across global platforms.
                        </p>
                    </div>

                    {/* Dedicated Navigation Subtabs between the 2 Pages */}
                    <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-subtle rounded-md">
                        <div className="px-3 py-1.5 rounded-sm text-xs font-bold bg-brand text-text-inverse shadow-2xs">
                            Quick Activation (1 OTP)
                        </div>
                        <Link
                            href="/user/numbers/rent"
                            className="px-3 py-1.5 rounded-sm text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                        >
                            <span>Rent Numbers (Multi-day)</span>
                            <Badge variant="primary" size="xs">Paused</Badge>
                        </Link>
                    </div>
                </div>

                {/* Deactivated Service Notice */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-text-secondary font-medium">
                        <span className="text-sm">⚠️</span>
                        <span>
                            <strong className="text-text-primary">Service Deactivated:</strong> Virtual Numbers service is currently paused for upgrades. Our active services are <strong className="text-text-primary">Mobile Data</strong> and <strong className="text-text-primary">Airtime</strong>.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/user/services/data" className="text-xs font-bold text-brand hover:underline">
                            Go to Mobile Data →
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Columns (8/12): Marketplace Selection */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Step 1: Select Country */}
                            <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs flex flex-col gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <h2 className="text-sm font-bold text-text-primary">Step 1: Choose Country Location</h2>
                                    <p className="text-xs text-text-secondary">Select the geographic dial-code region for your verification number</p>
                                </div>

                                <Input
                                    placeholder="Search country name or dial code..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    icon={<SearchIcon className="text-text-muted" />}
                                    className="bg-bg-base"
                                />

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                                    {filteredCountries.length === 0 ? (
                                        <div className="col-span-full py-6 text-center text-xs text-text-muted">
                                            No countries matched your search.
                                        </div>
                                    ) : (
                                        filteredCountries.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedCountry(c)}
                                                className={cn(
                                                    'flex items-center gap-2.5 p-3 rounded-sm border text-xs font-semibold select-none cursor-pointer transition-colors text-left truncate',
                                                    selectedCountry.id === c.id
                                                        ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand shadow-2xs'
                                                        : 'border-border-subtle bg-bg-base hover:bg-bg-surface-hover text-text-primary'
                                                )}
                                            >
                                                <span className="text-lg shrink-0">{c.flag}</span>
                                                <div className="flex flex-col truncate">
                                                    <span className="truncate">{c.name}</span>
                                                    <span className="text-[10px] text-text-muted font-mono tabular-nums">{c.dialCode}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Select Service Platform */}
                            <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs flex flex-col gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <h2 className="text-sm font-bold text-text-primary">Step 2: Choose Verification App / Service</h2>
                                    <p className="text-xs text-text-secondary">Select the service or application you want to receive an SMS for</p>
                                </div>

                                <Input
                                    placeholder="Search platform (WhatsApp, Telegram, OpenAI, Google...)"
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    icon={<SearchIcon className="text-text-muted" />}
                                    className="bg-bg-base"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                                    {filteredServices.length === 0 ? (
                                        <div className="col-span-full py-6 text-center text-xs text-text-muted">
                                            No platforms matched your search.
                                        </div>
                                    ) : (
                                        filteredServices.map((s) => {
                                            const isSelected = selectedService?.code === s.code;
                                            const pricing = getPriceFor(s.code, selectedCountry.id);
                                            return (
                                                <button
                                                    key={s.code}
                                                    onClick={() => setSelectedService(s)}
                                                    className={cn(
                                                        'flex items-center justify-between p-3.5 rounded-sm border text-xs font-semibold select-none cursor-pointer transition-colors text-left',
                                                        isSelected
                                                            ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand shadow-2xs'
                                                            : 'border-border-subtle bg-bg-base hover:bg-bg-surface-hover text-text-primary'
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-0.5 truncate">
                                                        <span className="font-bold truncate">{s.name}</span>
                                                        <span className="text-[10px] text-text-muted truncate">{s.description}</span>
                                                    </div>
                                                    <span className="font-mono tabular-nums font-bold shrink-0 pl-3 text-sm text-text-primary">
                                                        {currencySymbol}{pricing.price.toLocaleString()}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Columns (4/12): Checkout Summary & Active Workspace */}
                        <div className="lg:col-span-4 flex flex-col gap-6">

                            {/* Checkout Panel */}
                            {selectedService && (
                                <div className="bg-bg-surface border border-brand/30 p-5 rounded-md shadow-2xs flex flex-col gap-4 animate-fadeIn">
                                    <div className="flex justify-between items-center select-none">
                                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                            Activation Summary
                                        </span>
                                        <Badge variant="primary" size="xs">Ready to reserve</Badge>
                                    </div>

                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-text-secondary">Country</span>
                                            <span className="font-bold text-text-primary flex items-center gap-1.5">
                                                {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.dialCode})
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-text-secondary">Target Platform</span>
                                            <span className="font-bold text-text-primary">{selectedService.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-text-secondary">Lifespan</span>
                                            <span className="font-semibold text-text-primary">20 Minutes</span>
                                        </div>
                                        <div className="w-full h-px bg-border-subtle my-1" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-text-primary">Total Price</span>
                                            <span className="font-mono tabular-nums font-extrabold text-brand text-base">
                                                {currencySymbol}{getPriceFor(selectedService.code, selectedCountry.id).price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-1 opacity-60 cursor-not-allowed"
                                        disabled={true}
                                        variant="outline"
                                    >
                                        Service Currently Deactivated
                                    </Button>

                                    <span className="text-[10px] text-text-muted text-center leading-relaxed select-none">
                                        Your number stays active for 20 minutes. If no SMS arrives, you can cancel for a 100% automatic wallet refund.
                                    </span>
                                </div>
                            )}

                            {/* Active Numbers Dashboard */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between select-none">
                                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Active Number Workspace
                                    </h3>
                                    <Badge variant="primary">
                                        {activeNumberItems.length} Total
                                    </Badge>
                                </div>

                                {activeNumberItems.length === 0 ? (
                                    <div className="bg-bg-surface border border-border-subtle p-8 rounded-md text-center flex flex-col items-center justify-center gap-3 select-none">
                                        <div className="w-12 h-12 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted">
                                            <InboxIcon size={24} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-text-primary">No Active Numbers</span>
                                            <span className="text-[10px] text-text-secondary max-w-[200px] leading-relaxed mx-auto">
                                                Reserved phone numbers awaiting SMS verification codes will appear here in real-time.
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeNumberItems.map(({ order, item }) => (
                                            <ActiveNumberCard
                                                key={item.id}
                                                order={order}
                                                item={item}
                                                currencySymbol={currencySymbol}
                                                onStatusUpdate={handleStatusUpdate}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            </div>

            {/* Universal Transaction Modal */}
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
                        setSelectedService(null);
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

Numbers.layout = (page: React.ReactNode) => (
    <AppShell title="Virtual Numbers" backUrl="/user/services">
        {page}
    </AppShell>
);
