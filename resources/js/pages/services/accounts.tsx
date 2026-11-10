import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import {
    CameraIcon,
    MusicNoteIcon,
    BirdIcon,
    PaperPlaneIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    CheckIcon
} from '@/components/ui/Icons';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { cn } from '@/lib/utils';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: CameraIcon },
    { id: 'tiktok', name: 'TikTok', icon: MusicNoteIcon },
    { id: 'twitter', name: 'X (Twitter)', icon: BirdIcon },
    { id: 'telegram', name: 'Telegram', icon: PaperPlaneIcon },
    { id: 'facebook', name: 'Facebook', icon: UserGroupIcon },
];

const ACCOUNT_TIERS: Record<string, Array<{ id: string; name: string; age: string; details: string; priceNgn: number; priceUsd: number }>> = {
    instagram: [
        { id: 'ig-aged-2020', name: 'Instagram Aged (2020 - 2022)', age: '2-4 Years Old', details: 'Full Email Access + Phone Verified (PVA) + Cookies included', priceNgn: 8500, priceUsd: 5.30 },
        { id: 'ig-10k-creator', name: 'Instagram 10K+ Niche Account', age: 'Active 2021', details: 'Real Followers + Original Email Access + Clean History', priceNgn: 35000, priceUsd: 22.00 },
        { id: 'ig-fresh-pva', name: 'Instagram Fresh PVA (2024)', age: 'New / Warmed', details: 'Phone & Email Verified + Avatar + Bio set', priceNgn: 3200, priceUsd: 2.00 },
    ],
    tiktok: [
        { id: 'tt-1k-live', name: 'TikTok 1K+ Followers (Live Enabled)', age: 'Aged 2023', details: 'Live Streaming Enabled + Creator Fund Eligible + Original Email', priceNgn: 14500, priceUsd: 9.00 },
        { id: 'tt-5k-creators', name: 'TikTok 5K+ Organic Followers', age: 'Aged 2022', details: 'USA/UK Audience + Full Credentials + No Shadowban', priceNgn: 28000, priceUsd: 17.50 },
    ],
    twitter: [
        { id: 'tw-aged-2018', name: 'X (Twitter) Vintage (2018 - 2020)', age: '5+ Years Old', details: 'High Trust Score + Premium Blue Badge Eligible + Token', priceNgn: 12000, priceUsd: 7.50 },
        { id: 'tw-pva-warmed', name: 'X (Twitter) Warmed PVA', age: '1 Year Old', details: 'Phone Verified + 100+ Tweets + Auth Token Format', priceNgn: 5500, priceUsd: 3.50 },
    ],
    telegram: [
        { id: 'tg-tdata-old', name: 'Telegram TData Session (Aged)', age: '2022 PVA', details: 'TData Folder + Session File + 2FA Password Included', priceNgn: 4200, priceUsd: 2.60 },
        { id: 'tg-us-number', name: 'Telegram USA +1 Number Account', age: 'Warmed', details: 'Session Json + Full Access + No Mute', priceNgn: 6000, priceUsd: 3.75 },
    ],
    facebook: [
        { id: 'fb-bm-aged', name: 'Facebook BM250 Advertising Account', age: 'Aged 2019', details: 'Business Manager Ready + Daily Spend Limit ₦150k / $250', priceNgn: 25000, priceUsd: 15.50 },
        { id: 'fb-profile-pva', name: 'Facebook Aged Real Profile', age: '3 Years Old', details: 'Friends Included + 2FA Secret Key + Marketplace Enabled', priceNgn: 9800, priceUsd: 6.10 },
    ]
};

export default function SocialAccounts() {
    const { props } = usePage<any>();
    const authAccount = props.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$', rate: 1.0 } : { code: 'NGN', symbol: '₦', rate: 1300.0 });
    const isUsd = (authCurrency.code || '').toUpperCase() === 'USD';
    const currentBalance = Number(authAccount.available_balance) || 0;
    const currencySymbol = authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦');

    const toast = useToast();
    const flow = useTransactionFlow();

    const [platform, setPlatform] = React.useState('instagram');
    const [selectedAccId, setSelectedAccId] = React.useState(ACCOUNT_TIERS.instagram[0].id);
    const [quantity, setQuantity] = React.useState('1');

    const currentTiers = ACCOUNT_TIERS[platform] || ACCOUNT_TIERS.instagram;
    const selectedAccount = currentTiers.find(a => a.id === selectedAccId) || currentTiers[0];

    React.useEffect(() => {
        if (currentTiers.length > 0) {
            setSelectedAccId(currentTiers[0].id);
        }
    }, [platform]);

    const qtyNum = Math.max(1, parseInt(quantity, 10) || 1);
    const selectedUnitPrice = isUsd ? selectedAccount.priceUsd : selectedAccount.priceNgn;
    const totalPrice = isUsd ? Number((selectedAccount.priceUsd * qtyNum).toFixed(2)) : selectedAccount.priceNgn * qtyNum;
    const remainingBalance = Math.max(0, currentBalance - totalPrice);

    const handleInitiatePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (qtyNum < 1 || qtyNum > 20) {
            toast.error('Quantity must be between 1 and 20.');
            return;
        }

        const txData: UniversalTransactionData = {
            serviceName: selectedAccount.name,
            serviceCategory: 'Social Media Accounts',
            serviceType: 'accounts',
            providerName: platform.toUpperCase(),
            recipient: `${qtyNum} account credential(s)`,
            recipientLabel: 'Allocated Package',
            selectedItemName: selectedAccount.name,
            selectedItemLabel: 'Account Type',
            quantity: qtyNum,
            subtotal: totalPrice,
            totalAmount: totalPrice,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || (userCurrencyId === 1 ? 'USD' : 'NGN'),
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            additionalDetails: [
                { label: 'Platform', value: platform.toUpperCase() },
                { label: 'Account Age', value: selectedAccount.age },
                { label: 'Delivery Type', value: 'Instant Download & Order Vault' },
            ],
        };

        flow.initiateFlow(txData);
        flow.openConfirmModal();
    };

    const handleExecutePurchase = async () => {
        flow.startProcessing();
        const refId = 'KORAK-' + Math.floor(100000 + Math.random() * 900000);
        const userRandom = `cipher_acc_${platform}_${Math.floor(10000 + Math.random() * 90000)}`;
        const passRandom = `Pass_${Math.random().toString(36).substring(2, 10)}!`;
        const extraData = `LOGIN: ${userRandom} | PASS: ${passRandom} | 2FA_SECRET: JBSWY3DPEHPK3PXP`;

        router.post('/user/services/order', {
            service_code: 'acc_ig_aged',
            quantity: qtyNum,
            options: {
                account_type: selectedAccount.name,
                platform: platform,
                quantity: qtyNum,
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                flow.completeSuccess({
                    reference: refId,
                    status: 'completed',
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    notes: extraData,
                });
                toast.success('Social account credentials provisioned and stored in Orders!', 'Purchase Successful');
            },
            onError: (err: any) => {
                flow.completeFailed(err.message || 'Failed to purchase account. Please check your wallet balance.');
                toast.error(err.message || 'Failed to purchase account. Please check your wallet balance.');
            }
        });
    };

    return (
        <>
            <Head title="Buy Social Media Accounts" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Social Accounts Marketplace</h1>
                        <p className="text-xs text-text-secondary">
                            Buy aged, phone-verified (PVA) and business-ready social media profiles with instant delivery.
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
                            <strong className="text-text-primary">Service Deactivated:</strong> Social Accounts marketplace is currently paused. Our active services are <strong className="text-text-primary">Mobile Data</strong> and <strong className="text-text-primary">Airtime</strong>.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/user/services/data" className="text-xs font-bold text-brand hover:underline">
                            Go to Mobile Data →
                        </Link>
                    </div>
                </div>

                {/* Standard 12-Column Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Platform Selector & Account Tiers (8 Cols) */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Platform Selector Tabs */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                1. Select Platform
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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
                                            <Icon size={20} className={cn("mb-1", isSelected ? "text-brand" : "text-text-muted")} />
                                            <span className="text-xs font-bold text-text-primary">{p.name}</span>
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 text-brand">
                                                    <CheckIcon size={12} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Account Tiers List */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                2. Choose Account Tier
                            </span>
                            <div className="space-y-3">
                                {currentTiers.map((tier) => {
                                    const isSelected = selectedAccId === tier.id;
                                    const price = isUsd ? tier.priceUsd : tier.priceNgn;
                                    return (
                                        <div
                                            key={tier.id}
                                            onClick={() => setSelectedAccId(tier.id)}
                                            className={cn(
                                                "p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all",
                                                isSelected
                                                    ? "border-brand bg-brand-subtle/30 shadow-2xs"
                                                    : "border-border-subtle hover:border-border-strong hover:bg-bg-surface-hover"
                                            )}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-text-primary">{tier.name}</span>
                                                    <Badge variant="neutral" className="text-[10px]">{tier.age}</Badge>
                                                </div>
                                                <p className="text-[11px] text-text-secondary">{tier.details}</p>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                <span className="text-sm font-black font-mono text-brand">
                                                    {currencySymbol}{isUsd ? price.toFixed(2) : price.toLocaleString()}
                                                </span>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                    isSelected ? "border-brand bg-brand" : "border-border-strong"
                                                )}>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Configuration & Purchase Box (4 Cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-3">
                                3. Confirm &amp; Checkout
                            </span>

                            <form onSubmit={handleInitiatePurchase} className="space-y-4">
                                <Input
                                    label="Quantity"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    helperText="Max 20 accounts per order."
                                    required
                                />

                                <div className="space-y-2 text-xs border-t border-border-subtle pt-3">
                                    <div className="flex justify-between items-center text-text-secondary">
                                        <span>Unit Price</span>
                                        <span className="font-mono font-bold text-text-primary">
                                            {currencySymbol}{isUsd ? selectedUnitPrice.toFixed(2) : selectedUnitPrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-text-secondary">
                                        <span>Wallet Balance</span>
                                        <span className="font-mono font-bold text-text-primary">
                                            {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-text-secondary border-t border-border-subtle pt-2">
                                        <span className="font-bold text-text-primary">Total Payable</span>
                                        <span className="text-base font-black font-mono text-brand">
                                            {currencySymbol}{isUsd ? totalPrice.toFixed(2) : totalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs font-bold py-2.5 opacity-60 cursor-not-allowed"
                                    disabled={true}
                                >
                                    Service Currently Deactivated
                                </Button>
                            </form>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs space-y-2 text-xs">
                            <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
                                Credential Delivery
                            </h4>
                            <p className="text-text-secondary text-[11px] leading-relaxed">
                                Full login details, 2FA secret recovery codes, and cookie sessions are revealed immediately upon checkout and permanently archived in your Order History.
                            </p>
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
                        setQuantity('1');
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

SocialAccounts.layout = (page: React.ReactNode) => (
    <AppShell title="Social Accounts" backUrl="/user/services">
        {page}
    </AppShell>
);
