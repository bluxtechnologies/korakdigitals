import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { ChevronRight, Sparkles, Clock, Layers } from 'lucide-react';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { getCsrfToken } from '@/lib/utils';
import {
    NetworkItem,
    RawDataBundle,
    ParsedDataBundle,
    BundleFilterCategory,
    MobileDataPageProps,
    parseDataBundle,
    DEFAULT_BUNDLE_CATALOGS,
    DesktopPageHeader,
    MobilePageHeader,
    NetworkSelector,
    PhoneNumberInput,
    PlanSearch,
    PlanFilters,
    DataPlanGrid,
    OrderSummary,
    MobileOrderSummary,
    BalanceNotice,
    ContinueButton,
    FormSection,
    ErrorState,
} from '@/components/services/data';

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

export default function MobileDataPage(props: MobileDataPageProps) {
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
    const [userManuallySelectedNetwork, setUserManuallySelectedNetwork] = React.useState(false);
    const [phone, setPhone] = React.useState('');

    // Prepopulate initial MTN bundles
    const initialMtnBundles = React.useMemo(() => {
        const raw = (props.initialBundles && props.initialBundles.length > 0)
            ? props.initialBundles
            : DEFAULT_BUNDLE_CATALOGS.mtn;
        return raw.map((b, idx) => parseDataBundle(b, idx));
    }, [props.initialBundles]);

    const [bundlesCache, setBundlesCache] = React.useState<Record<string, ParsedDataBundle[]>>({
        mtn: initialMtnBundles,
    });

    const [selectedPackageCode, setSelectedPackageCode] = React.useState<string>(
        initialMtnBundles[0]?.package_code || ''
    );
    const [bundleFilter, setBundleFilter] = React.useState<BundleFilterCategory>('all');
    const [bundleSearch, setBundleSearch] = React.useState<string>('');
    const [loadingBundles, setLoadingBundles] = React.useState<boolean>(false);
    const [bundleLoadError, setBundleLoadError] = React.useState<string | null>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = React.useState<boolean>(false);
    // Universal Transaction Flow
    const flow = useTransactionFlow();

    const selectedNetwork = networks.find(n => n.id === selectedNetworkId) || networks[0];
    const currentBundles = bundlesCache[selectedNetwork.id] || [];

    // Filter bundles by search query and category
    const filteredBundles = React.useMemo(() => {
        let list = currentBundles;

        if (bundleFilter !== 'all') {
            list = list.filter(b => b.category === bundleFilter);
        }

        if (bundleSearch.trim()) {
            const q = bundleSearch.toLowerCase().trim();
            list = list.filter(b =>
                b.display_name.toLowerCase().includes(q) ||
                b.total_allowance.toLowerCase().includes(q) ||
                b.validity.toLowerCase().includes(q) ||
                String(b.price_ngn).includes(q)
            );
        }

        return list;
    }, [currentBundles, bundleFilter, bundleSearch]);

    // Ensure a valid bundle is selected when filters or network change
    React.useEffect(() => {
        if (filteredBundles.length > 0) {
            const exists = filteredBundles.some(b => b.package_code === selectedPackageCode);
            if (!exists) {
                setSelectedPackageCode(filteredBundles[0].package_code);
            }
        }
    }, [filteredBundles, selectedPackageCode]);

    // Network switching & bundle fetching
    const handleNetworkSelect = (netId: string, manual = true) => {
        setSelectedNetworkId(netId);
        if (manual) {
            setUserManuallySelectedNetwork(true);
        }
        setBundleSearch('');
        setBundleLoadError(null);

        if (bundlesCache[netId] && bundlesCache[netId].length > 0) {
            const cached = bundlesCache[netId];
            setSelectedPackageCode(cached[0]?.package_code || '');
            return;
        }

        const targetNet = networks.find(n => n.id === netId) || networks[0];
        setLoadingBundles(true);

        fetch(`/user/services/data/bundles/${targetNet.data_service}`)
            .then(res => res.json())
            .then(data => {
                let parsedList: ParsedDataBundle[] = [];
                if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                    parsedList = data.data.map((b: RawDataBundle, idx: number) => parseDataBundle(b, idx));
                } else if (DEFAULT_BUNDLE_CATALOGS[netId]) {
                    // Graceful fallback to default catalogs
                    parsedList = DEFAULT_BUNDLE_CATALOGS[netId].map((b, idx) => parseDataBundle(b, idx));
                }

                setBundlesCache(prev => ({ ...prev, [netId]: parsedList }));
                if (parsedList.length > 0) {
                    setSelectedPackageCode(parsedList[0].package_code);
                }
            })
            .catch(() => {
                // Fall back to default bundles if network fails
                if (DEFAULT_BUNDLE_CATALOGS[netId]) {
                    const fallback = DEFAULT_BUNDLE_CATALOGS[netId].map((b, idx) => parseDataBundle(b, idx));
                    setBundlesCache(prev => ({ ...prev, [netId]: fallback }));
                    if (fallback.length > 0) {
                        setSelectedPackageCode(fallback[0].package_code);
                    }
                } else {
                    setBundleLoadError(`Unable to load data plans for ${targetNet.name}.`);
                }
            })
            .finally(() => {
                setLoadingBundles(false);
            });
    };

    // Cleaned recipient phone number
    const normalizedPhone = React.useMemo(() => {
        let cleaned = phone.replace(/[^0-9+]/g, '');
        if (cleaned.startsWith('+234')) {
            cleaned = '0' + cleaned.slice(4);
        } else if (cleaned.startsWith('234') && cleaned.length > 10) {
            cleaned = '0' + cleaned.slice(3);
        }
        return cleaned;
    }, [phone]);

    // Carrier prefix auto-detection
    const detectedNetwork = React.useMemo(() => {
        if (normalizedPhone.length >= 4) {
            const prefix = normalizedPhone.substring(0, 4);
            return networks.find(n => n.prefix?.includes(prefix)) || null;
        }
        return null;
    }, [normalizedPhone, networks]);

    const handlePhoneChange = (val: string) => {
        setPhone(val);
        let digits = val.replace(/[^0-9+]/g, '');
        if (digits.startsWith('+234')) {
            digits = '0' + digits.slice(4);
        } else if (digits.startsWith('234') && digits.length > 10) {
            digits = '0' + digits.slice(3);
        }

        if (digits.length >= 4 && !userManuallySelectedNetwork) {
            const prefix = digits.substring(0, 4);
            const matched = networks.find(n => n.prefix?.includes(prefix));
            if (matched && matched.id !== selectedNetworkId) {
                handleNetworkSelect(matched.id, false);
            }
        }
    };

    // Currently selected bundle
    const selectedBundle = currentBundles.find(b => b.package_code === selectedPackageCode) || null;

    // Pricing & balance calculations
    const rawPriceNgn = selectedBundle?.price_ngn || 0;
    const totalNgn = rawPriceNgn;

    const payableAmount = isUsd
        ? Number((totalNgn / Math.max(rate, 1)).toFixed(2))
        : totalNgn;

    const isBalanceInsufficient = currentBalance < payableAmount;
    const isValidPhone = normalizedPhone.length === 11 && /^0[789][01]\d{8}$/.test(normalizedPhone);
    const canContinue = isValidPhone && selectedBundle !== null && !isBalanceInsufficient;

    const planSectionRef = React.useRef<HTMLDivElement>(null);

    const handleInitiateReview = () => {
        if (!isValidPhone) {
            toast.error('Please enter a valid 11-digit mobile number (e.g. 08012345678).');
            return;
        }

        if (!selectedBundle) {
            toast.error('Please select a data bundle package to continue.');
            return;
        }

        if (isBalanceInsufficient) {
            toast.error(`Your wallet balance (${currencySymbol}${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}) is insufficient.`);
            return;
        }

        const remainingBalance = Math.max(0, currentBalance - payableAmount);

        const transactionData: UniversalTransactionData = {
            serviceName: `${selectedNetwork.name} — ${selectedBundle.display_name}`,
            serviceCategory: 'Mobile Data Bundle',
            providerName: selectedNetwork.name,
            providerLogo: selectedNetwork.logo,
            recipient: normalizedPhone,
            recipientLabel: 'Recipient Mobile Number',
            selectedItemName: selectedBundle.display_name,
            selectedItemLabel: 'Data Plan',
            subtotal: payableAmount,
            totalAmount: payableAmount,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || 'NGN',
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            fee: 0,
            discount: 0,
            additionalDetails: [
                { label: 'Network Provider', value: selectedNetwork.name },
                { label: 'Selected Plan', value: selectedBundle.display_name },
                { label: 'Validity Period', value: selectedBundle.validity },
                { label: 'Total Allowance', value: selectedBundle.total_allowance },
                { label: 'Plan Price', value: `₦${rawPriceNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Wallet Deduction', value: `${currencySymbol}${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'Fulfillment Time', value: 'Instant (~5-15 seconds)' },
            ],
        };

        flow.openConfirmModal(transactionData);
    };

    const handleExecutePurchase = async () => {
        if (!selectedBundle) return;
        await flow.executePayment('/user/services/bills/purchase', {
            mode: 'data',
            network: selectedNetwork.id,
            service_code: selectedNetwork.data_service,
            package_code: selectedBundle.package_code,
            phone: normalizedPhone,
            amount: rawPriceNgn,
            package_name: selectedBundle.display_name,
        });
    };

    return (
        <>
            <Head title="Mobile Data" />

            <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6 pb-24 md:pb-12">
                {/* Headers */}
                <DesktopPageHeader />
                <MobilePageHeader />

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Purchase Progression (7 cols on desktop) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Recipient Phone Number */}
                        <FormSection
                            title="1. Recipient Phone Number & Carrier"
                            description="Select your carrier and enter the mobile number to top up."
                        >
                            <PhoneNumberInput
                                value={phone}
                                onChange={handlePhoneChange}
                                onClear={() => setPhone('')}
                                detectedNetwork={detectedNetwork}
                                selectedNetwork={selectedNetwork}
                                isValid={isValidPhone}
                                networks={networks}
                                onSelectNetwork={id => handleNetworkSelect(id, true)}
                            />
                        </FormSection>

                        {/* 2. Select Data Plan */}
                        <div ref={planSectionRef}>
                            <FormSection
                                title="2. Select Data Plan"
                                description="Choose a data bundle that fits your needs."
                            >
                                <div className="space-y-3">
                                    {/* Selected Plan Trigger Card */}
                                    {selectedBundle ? (
                                        <div
                                            onClick={() => setIsPlanModalOpen(true)}
                                            className="p-4 rounded-xl border border-brand/30 bg-brand/[0.03] hover:bg-brand/[0.06] hover:border-brand transition-all cursor-pointer shadow-2xs group select-none"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand px-2 py-0.5 rounded-full bg-brand/10">
                                                            {selectedBundle.category} Plan
                                                        </span>
                                                        <span className="text-xs text-text-muted">
                                                            {selectedBundle.validity}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm md:text-base font-bold text-text-primary group-hover:text-brand transition-colors truncate">
                                                        {selectedBundle.display_name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-xs text-text-muted">
                                                        <span>Allowance: <strong className="text-text-primary">{selectedBundle.total_allowance}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0 flex items-center gap-3">
                                                    <div>
                                                        <span className="text-base md:text-lg font-black font-mono text-text-primary block">
                                                            {isUsd
                                                                ? `$${(selectedBundle.price_ngn / Math.max(rate, 1)).toFixed(2)}`
                                                                : `₦${selectedBundle.price_ngn.toLocaleString()}`}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-brand block mt-0.5">
                                                            Change Plan
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-subtle group-hover:border-brand flex items-center justify-center text-text-muted group-hover:text-brand transition-colors shadow-2xs">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsPlanModalOpen(true)}
                                            className="w-full p-4 rounded-xl border border-dashed border-border-strong hover:border-brand bg-bg-surface hover:bg-brand/[0.02] text-left transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <div className="space-y-0.5">
                                                <span className="text-sm font-bold text-text-primary block">
                                                    No plan selected
                                                </span>
                                                <span className="text-xs text-text-muted block">
                                                    Click to browse available {selectedNetwork.name} data bundles
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-lg">
                                                Select Plan &rarr;
                                            </span>
                                        </button>
                                    )}

                                    {/* Quick Native Dropdown Shortcut */}
                                    {filteredBundles.length > 0 && (
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <span className="text-[11px] text-text-muted shrink-0 hidden sm:inline">Or quick select:</span>
                                            <select
                                                value={selectedPackageCode}
                                                onChange={e => setSelectedPackageCode(e.target.value)}
                                                aria-label="Quick Select Plan"
                                                className="w-full text-xs py-2 px-3 rounded-lg border border-border-subtle bg-bg-surface text-text-primary focus:outline-none focus:border-brand"
                                            >
                                                {filteredBundles.map(b => (
                                                    <option key={b.package_code} value={b.package_code}>
                                                        {b.display_name} — {isUsd ? `$${(b.price_ngn / Math.max(rate, 1)).toFixed(2)}` : `₦${b.price_ngn.toLocaleString()}`} ({b.validity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </FormSection>
                        </div>

                        {/* Plan Selection Modal */}
                        <Modal
                            isOpen={isPlanModalOpen}
                            onClose={() => setIsPlanModalOpen(false)}
                            title={`Select ${selectedNetwork.name} Data Plan`}
                            size="lg"
                        >
                            <div className="space-y-4">
                                {/* Search input */}
                                <PlanSearch
                                    value={bundleSearch}
                                    onChange={setBundleSearch}
                                    onClear={() => setBundleSearch('')}
                                />

                                {/* Category filters */}
                                <PlanFilters
                                    selectedCategory={bundleFilter}
                                    onSelectCategory={setBundleFilter}
                                />

                                {/* Error message or bundle grid */}
                                {bundleLoadError ? (
                                    <ErrorState
                                        message={bundleLoadError}
                                        onRetry={() => handleNetworkSelect(selectedNetworkId, true)}
                                    />
                                ) : (
                                    <DataPlanGrid
                                        bundles={filteredBundles}
                                        selectedBundle={selectedBundle}
                                        onSelectBundle={bundle => {
                                            setSelectedPackageCode(bundle.package_code);
                                            setIsPlanModalOpen(false);
                                        }}
                                        isLoading={loadingBundles}
                                        networkName={selectedNetwork.name}
                                        onResetFilters={() => {
                                            setBundleSearch('');
                                            setBundleFilter('all');
                                        }}
                                        currencySymbol={currencySymbol}
                                        isUsd={isUsd}
                                        rate={rate}
                                    />
                                )}
                            </div>
                        </Modal>

                        {/* Insufficient balance warning */}
                        {isBalanceInsufficient && (
                            <BalanceNotice
                                onChangePlan={() => {
                                    planSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        )}

                        {/* Mobile Compact Order Summary (Visible only on Mobile) */}
                        <div className="block lg:hidden pt-1 space-y-3">
                            <MobileOrderSummary
                                network={selectedNetwork}
                                selectedBundle={selectedBundle}
                                recipientPhone={normalizedPhone}
                                currentBalance={currentBalance}
                                currencySymbol={currencySymbol}
                                isUsd={isUsd}
                                rate={rate}
                                isBalanceInsufficient={isBalanceInsufficient}
                                onEdit={() => {
                                    planSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />

                            <ContinueButton
                                onClick={handleInitiateReview}
                                disabled={!canContinue}
                                isLoading={flow.isProcessing}
                            />
                        </div>

                        {/* Desktop Continue to Review Button (Visible only on Desktop) */}
                        <div className="hidden lg:block pt-2">
                            <ContinueButton
                                onClick={handleInitiateReview}
                                disabled={!canContinue}
                                isLoading={flow.isProcessing}
                            />
                        </div>
                    </div>

                    {/* Right Column: Order Summary Card (Desktop Only, 5 cols) */}
                    <div className="hidden lg:block lg:col-span-5 sticky top-20">
                        <OrderSummary
                            network={selectedNetwork}
                            selectedBundle={selectedBundle}
                            recipientPhone={normalizedPhone}
                            currentBalance={currentBalance}
                            currencySymbol={currencySymbol}
                            isUsd={isUsd}
                            rate={rate}
                            isBalanceInsufficient={isBalanceInsufficient}
                        />
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
                    },
                    onTryAgain: () => {
                        flow.openConfirmModal();
                    },
                }}
            />
        </>
    );
}

MobileDataPage.layout = (page: React.ReactNode) => (
    <AppShell title="Mobile Data" backUrl="/user/services">
        {page}
    </AppShell>
);