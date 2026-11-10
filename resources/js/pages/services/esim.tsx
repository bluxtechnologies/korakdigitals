import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { GlobeIcon } from '@/components/ui/Icons';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { cn } from '@/lib/utils';

const REGIONS = [
    { value: 'usa', label: 'United States & Canada', code: 'US', priceNgn: 4500, priceUsd: 3.10 },
    { value: 'europe', label: 'Europe Regional (34 Countries)', code: 'EU', priceNgn: 5200, priceUsd: 3.60 },
    { value: 'asia', label: 'Asia-Pacific Regional', code: 'AP', priceNgn: 6000, priceUsd: 4.15 },
    { value: 'global', label: 'Global Pass (120+ Countries)', code: 'GL', priceNgn: 11500, priceUsd: 8.00 },
];

const DATA_PACKAGES = [
    { value: '1gb', label: '1 GB Data — 7 Days Validity' },
    { value: '3gb', label: '3 GB Data — 15 Days Validity' },
    { value: '5gb', label: '5 GB Data — 30 Days Validity' },
    { value: '10gb', label: '10 GB Data — 30 Days Validity' },
];

export default function ESimServices() {
    const { props } = usePage<any>();
    const authAccount = props.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$', rate: 1.0 } : { code: 'NGN', symbol: '₦', rate: 1300.0 });
    const isUsd = (authCurrency.code || '').toUpperCase() === 'USD';
    const currentBalance = Number(authAccount.available_balance) || 0;
    const currencySymbol = authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦');

    const toast = useToast();
    const flow = useTransactionFlow();

    const [region, setRegion] = React.useState('usa');
    const [dataPkg, setDataPkg] = React.useState('3gb');

    const selectedRegion = REGIONS.find(r => r.value === region) || REGIONS[0];
    const selectedPkg = DATA_PACKAGES.find(p => p.value === dataPkg) || DATA_PACKAGES[0];
    const price = isUsd ? selectedRegion.priceUsd : selectedRegion.priceNgn;
    const remainingBalance = Math.max(0, currentBalance - price);

    const handleInitiateOrder = (e: React.FormEvent) => {
        e.preventDefault();

        const txData: UniversalTransactionData = {
            serviceName: `eSIM Global Profile — ${selectedRegion.label}`,
            serviceCategory: 'Travel eSIM Profiles',
            serviceType: 'esim',
            providerName: `${selectedRegion.label}`,
            recipient: `${selectedRegion.code} Region (${selectedPkg.label.split('—')[0].trim()})`,
            recipientLabel: 'Destination & Data',
            selectedItemName: `${selectedPkg.label}`,
            selectedItemLabel: 'Data Package',
            quantity: 1,
            subtotal: price,
            totalAmount: price,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || (userCurrencyId === 1 ? 'USD' : 'NGN'),
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            additionalDetails: [
                { label: 'Region', value: selectedRegion.label },
                { label: 'Package Plan', value: selectedPkg.label },
                { label: 'Delivery Speed', value: 'Instant LPA Activation String & QR' },
            ],
        };

        flow.initiateFlow(txData);
        flow.openConfirmModal();
    };

    const handleExecuteOrder = async () => {
        flow.startProcessing();

        const refId = 'KORAK-' + Math.floor(100000 + Math.random() * 900000);
        const iccid = `890141032${Math.floor(100000000 + Math.random() * 900000000)}`;
        const activationString = `LPA:1$cipher-esim.net$${iccid}`;

        router.post('/user/services/order', {
            service_code: 'esim_global_profile',
            quantity: 1,
            options: {
                region: selectedRegion.label,
                package: dataPkg,
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                flow.completeSuccess({
                    reference: refId,
                    status: 'completed',
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    notes: `ICCID: ${iccid} | ACTIVATION_STRING: ${activationString}`,
                });
                toast.success('eSIM Profile provisioned and stored in Order Vault!', 'Provisioning Completed');
            },
            onError: (err: any) => {
                flow.completeFailed(err.message || 'Failed to order eSIM profile. Please check your wallet balance.');
                toast.error(err.message || 'Failed to order eSIM profile. Please check your wallet balance.');
            }
        });
    };

    return (
        <>
            <Head title="Travel eSIM Profiles" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Travel eSIM Store</h1>
                        <p className="text-xs text-text-secondary">
                            Get instant QR and LPA activation credentials for high-speed roaming across 150+ countries.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="success" dot statusIcon="check">Instant Delivery</Badge>
                        <span className="text-[10px] text-text-muted">Global coverage</span>
                    </div>
                </div>

                {/* Standard 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Form area (8 Cols) */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Region Selector */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                1. Select Travel Region
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {REGIONS.map((r) => {
                                    const isSelected = region === r.value;
                                    const regPrice = isUsd ? r.priceUsd : r.priceNgn;
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRegion(r.value)}
                                            className={cn(
                                                "p-4 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer",
                                                isSelected
                                                    ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand shadow-2xs'
                                                    : 'border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-subtle text-brand flex items-center justify-center font-bold text-xs">
                                                    {r.code}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold">{r.label}</div>
                                                    <div className="text-[10px] text-text-muted">Starting from {currencySymbol}{isUsd ? regPrice.toFixed(2) : regPrice.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Package Configuration */}
                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs">
                            <form onSubmit={handleInitiateOrder} className="space-y-4">
                                <Select
                                    label="2. Data Allowance & Validity"
                                    options={DATA_PACKAGES}
                                    value={dataPkg}
                                    onChange={(e) => setDataPkg(e.target.value)}
                                />

                                <div className="p-4 rounded-md bg-bg-base border border-border-subtle flex items-center justify-between">
                                    <span className="text-xs text-text-secondary">Estimated Checkout:</span>
                                    <span className="text-base font-black font-mono text-brand">
                                        {currencySymbol}{isUsd ? price.toFixed(2) : price.toLocaleString()}
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full text-xs font-bold shadow-sm py-2.5 mt-2"
                                    disabled={flow.isProcessing}
                                >
                                    Proceed to Activation ({currencySymbol}{isUsd ? price.toFixed(2) : price.toLocaleString()})
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right Features Column (4 Cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
                                <GlobeIcon size={20} className="text-brand" />
                                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    Why Korak eSIM?
                                </span>
                            </div>

                            <ul className="space-y-3 text-xs">
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Instant QR Delivery:</strong> Scan and connect in 60 seconds without physical SIMs.</span>
                                </li>
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Multi-Carrier Access:</strong> Connects to the strongest local network in every country automatically.</span>
                                </li>
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Hotspot Allowed:</strong> Tether to your laptop or other mobile devices with zero restrictions.</span>
                                </li>
                            </ul>
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
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

ESimServices.layout = (page: React.ReactNode) => (
    <AppShell title="Travel eSIM" backUrl="/user/services">
        {page}
    </AppShell>
);