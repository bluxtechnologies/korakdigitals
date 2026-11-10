import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { CameraIcon, MusicNoteIcon, BirdIcon, PaperPlaneIcon, PlayIcon, CheckIcon } from '@/components/ui/Icons';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { cn } from '@/lib/utils';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: CameraIcon, ratePer1k: 1200 },
    { id: 'tiktok', name: 'TikTok', icon: MusicNoteIcon, ratePer1k: 950 },
    { id: 'twitter', name: 'X (Twitter)', icon: BirdIcon, ratePer1k: 1500 },
    { id: 'telegram', name: 'Telegram', icon: PaperPlaneIcon, ratePer1k: 800 },
    { id: 'youtube', name: 'YouTube', icon: PlayIcon, ratePer1k: 2200 },
];

const SERVICE_TYPES = [
    { value: 'followers', label: 'High Quality Followers' },
    { value: 'likes', label: 'Post Likes' },
    { value: 'views', label: 'Video / Reel Views' },
    { value: 'comments', label: 'Custom Comments' },
];

export default function SocialGrowth() {
    const { props } = usePage<any>();
    const authAccount = props.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$', rate: 1.0 } : { code: 'NGN', symbol: '₦', rate: 1300.0 });
    const isUsd = (authCurrency.code || '').toUpperCase() === 'USD';
    const rate = Number(authCurrency.rate) || 1300;
    const currentBalance = Number(authAccount.available_balance) || 0;
    const currencySymbol = authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦');

    const toast = useToast();
    const flow = useTransactionFlow();

    const [platform, setPlatform] = React.useState('instagram');
    const [serviceType, setServiceType] = React.useState('followers');
    const [targetUrl, setTargetUrl] = React.useState('');
    const [quantity, setQuantity] = React.useState('1000');

    const selectedPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
    const selectedServiceType = SERVICE_TYPES.find(s => s.value === serviceType) || SERVICE_TYPES[0];
    const qtyNum = parseInt(quantity, 10) || 0;
    const rawPriceNgn = Math.round((qtyNum / 1000) * selectedPlatform.ratePer1k);
    const estimatedPrice = isUsd ? Number((rawPriceNgn / Math.max(rate, 1)).toFixed(2)) : rawPriceNgn;
    const displayRatePer1k = isUsd ? Number((selectedPlatform.ratePer1k / Math.max(rate, 1)).toFixed(2)) : selectedPlatform.ratePer1k;
    const remainingBalance = Math.max(0, currentBalance - estimatedPrice);

    const handleInitiateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUrl.trim()) {
            toast.error('Please provide your target profile or post link.');
            return;
        }
        if (qtyNum < 100) {
            toast.error('Minimum quantity is 100.');
            return;
        }

        const txData: UniversalTransactionData = {
            serviceName: `${selectedPlatform.name} — ${selectedServiceType.label}`,
            serviceCategory: 'Social Media Growth',
            serviceType: 'social_growth',
            providerName: selectedPlatform.name,
            recipient: targetUrl.trim(),
            recipientLabel: 'Target Link / Handle',
            selectedItemName: `${qtyNum.toLocaleString()} ${selectedServiceType.label}`,
            selectedItemLabel: 'Package Tier',
            quantity: qtyNum,
            subtotal: estimatedPrice,
            totalAmount: estimatedPrice,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || (userCurrencyId === 1 ? 'USD' : 'NGN'),
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            additionalDetails: [
                { label: 'Target Platform', value: selectedPlatform.name },
                { label: 'Delivery Start', value: '1 — 30 minutes' },
            ],
        };

        flow.initiateFlow(txData);
        flow.openConfirmModal();
    };

    const handleExecuteOrder = async () => {
        flow.startProcessing();
        const refId = 'KORAK-' + Math.floor(100000 + Math.random() * 900000);

        router.post('/user/services/order', {
            service_code: 'growth_ig_followers',
            quantity: Math.max(1, Math.round(qtyNum / 1000)),
            options: {
                platform: selectedPlatform.name,
                service_type: serviceType,
                link: targetUrl.trim(),
                quantity: qtyNum,
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                flow.completeSuccess({
                    reference: refId,
                    status: 'completed',
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    notes: `Campaign initialized for ${qtyNum.toLocaleString()} ${selectedServiceType.label.toLowerCase()}`,
                });
                toast.success('Social growth campaign launched successfully!', 'Order Placed');
                setTargetUrl('');
            },
            onError: (err: any) => {
                flow.completeFailed(err.message || 'Failed to place order. Please check wallet balance.');
                toast.error(err.message || 'Failed to place order. Please check wallet balance.');
            }
        });
    };

    return (
        <>
            <Head title="Social Media Growth" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Social Growth Desk</h1>
                        <p className="text-xs text-text-secondary">
                            Boost your Instagram, TikTok, Telegram, and YouTube profiles with real engagement.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="neutral">Service Paused</Badge>
                        <span className="text-[10px] text-text-muted">Under maintenance</span>
                    </div>
                </div>

                {/* Deactivated Service Notice */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-text-secondary font-medium">
                        <span className="text-sm">⚠️</span>
                        <span>
                            <strong className="text-text-primary">Service Deactivated:</strong> Social Growth is currently paused for system upgrades. Our working services are <strong className="text-text-primary">Mobile Data</strong> and <strong className="text-text-primary">Airtime</strong>.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/user/services/data" className="text-xs font-bold text-brand hover:underline">
                            Go to Mobile Data →
                        </Link>
                    </div>
                </div>

                {/* 12-Column Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left 8 Cols: Platform Selection & Configuration */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Platform Selector Tabs */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                                1. Select Social Platform
                            </label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {PLATFORMS.map((p) => {
                                    const Icon = p.icon;
                                    const isSelected = platform === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPlatform(p.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all cursor-pointer relative",
                                                isSelected
                                                    ? "border-brand bg-brand-subtle/50 text-brand shadow-2xs"
                                                    : "border-border-subtle hover:border-border-strong text-text-secondary hover:bg-bg-surface-hover"
                                            )}
                                        >
                                            <Icon size={22} className={cn("mb-1.5", isSelected ? "text-brand" : "text-text-muted")} />
                                            <span className="text-xs font-bold text-text-primary">{p.name}</span>
                                            <span className="text-[10px] text-text-muted font-mono mt-0.5">
                                                from {currencySymbol}{isUsd ? (p.ratePer1k / rate).toFixed(2) : p.ratePer1k}/1k
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 text-brand">
                                                    <CheckIcon size={14} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Service Configuration Form */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                                2. Service & Target
                            </label>

                            <form onSubmit={handleInitiateOrder} className="space-y-4">
                                <Select
                                    label="Service Type"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    options={SERVICE_TYPES.map(s => ({
                                        value: s.value,
                                        label: `${s.label} — ${currencySymbol}${displayRatePer1k.toLocaleString()}/1k`
                                    }))}
                                />

                                <Input
                                    label="3. Target Link or Username"
                                    placeholder="https://instagram.com/username or @handle"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    required
                                    helperText="Ensure account is public before placing orders."
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <Input
                                        label="4. Quantity"
                                        type="number"
                                        min="100"
                                        max="100000"
                                        step="100"
                                        placeholder="1000"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                    
                                    <div className="field-group">
                                        <label className="field-label">Estimated Price</label>
                                        <div className="input-base bg-bg-surface-hover font-mono font-bold text-brand flex items-center justify-between">
                                            <span>
                                                {currencySymbol}{estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: isUsd ? 2 : 0, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-text-muted font-normal">
                                                Rate: {currencySymbol}{displayRatePer1k}/1k
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs font-bold py-2.5 mt-2 opacity-60 cursor-not-allowed"
                                    disabled={true}
                                >
                                    Service Currently Deactivated
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right 4 Cols: Order Summary */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    Summary
                                </span>
                                <span className="text-[10px] font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">
                                    SMM High Speed
                                </span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center text-text-secondary">
                                    <span>Platform</span>
                                    <span className="font-bold text-text-primary">{selectedPlatform.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary">
                                    <span>Service</span>
                                    <span className="font-bold text-text-primary">{selectedServiceType.label}</span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary">
                                    <span>Units</span>
                                    <span className="font-bold text-text-primary">{qtyNum.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary">
                                    <span>Wallet Balance</span>
                                    <span className="font-bold text-text-primary">
                                        {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary pt-2 border-t border-border-subtle">
                                    <span className="font-bold text-text-primary">Total Price</span>
                                    <span className="text-sm font-black text-brand font-mono">
                                        {currencySymbol}{estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: isUsd ? 2 : 0, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
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
                onConfirmPay={handleExecuteOrder}
                handlers={{
                    onBuyAgain: () => {
                        flow.resetFlow();
                        setTargetUrl('');
                        setQuantity('1000');
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

SocialGrowth.layout = (page: React.ReactNode) => (
    <AppShell title="Social Growth" backUrl="/user/services">
        {page}
    </AppShell>
);
