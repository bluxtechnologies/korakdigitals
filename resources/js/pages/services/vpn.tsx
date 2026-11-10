import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { ShieldIcon, MapPinIcon } from '@/components/ui/Icons';
import {
    useTransactionFlow,
    TransactionFlowModal,
    UniversalTransactionData,
} from '@/components/transaction';
import { cn } from '@/lib/utils';

const VPN_LOCATIONS = [
    { value: 'us', label: 'United States (New York / LA)', code: 'US', ping: '45ms' },
    { value: 'uk', label: 'United Kingdom (London)', code: 'UK', ping: '28ms' },
    { value: 'de', label: 'Germany (Frankfurt)', code: 'DE', ping: '32ms' },
    { value: 'nl', label: 'Netherlands (Amsterdam)', code: 'NL', ping: '25ms' },
    { value: 'sg', label: 'Singapore (Central)', code: 'SG', ping: '95ms' },
];

const PROTOCOLS = [
    { value: 'wireguard', label: 'WireGuard (Fastest / Lightweight)' },
    { value: 'openvpn', label: 'OpenVPN (UDP / TCP High Security)' },
    { value: 'v2ray', label: 'V2Ray / VLESS (Bypass Deep Packet Inspection)' },
];

const PLAN_DURATION = [
    { value: '30', label: '30 Days Access — ₦2,500', priceNgn: 2500, priceUsd: 1.70 },
    { value: '90', label: '90 Days Access — ₦6,500', priceNgn: 6500, priceUsd: 4.50 },
    { value: '365', label: '1 Year Unlimited — ₦22,000', priceNgn: 22000, priceUsd: 15.00 },
];

export default function SecureVpn() {
    const { props } = usePage<any>();
    const authAccount = props.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(props.auth?.user?.user_currency_id || props.auth?.currency?.id || 1);
    const authCurrency = props.auth?.currency || (userCurrencyId === 1 ? { code: 'USD', symbol: '$', rate: 1.0 } : { code: 'NGN', symbol: '₦', rate: 1300.0 });
    const isUsd = (authCurrency.code || '').toUpperCase() === 'USD';
    const currentBalance = Number(authAccount.available_balance) || 0;
    const currencySymbol = authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦');

    const toast = useToast();
    const flow = useTransactionFlow();

    const [location, setLocation] = React.useState('us');
    const [protocol, setProtocol] = React.useState('wireguard');
    const [duration, setDuration] = React.useState('30');

    const selectedLoc = VPN_LOCATIONS.find(l => l.value === location) || VPN_LOCATIONS[0];
    const selectedProto = PROTOCOLS.find(p => p.value === protocol) || PROTOCOLS[0];
    const selectedPlan = PLAN_DURATION.find(p => p.value === duration) || PLAN_DURATION[0];
    const price = isUsd ? selectedPlan.priceUsd : selectedPlan.priceNgn;
    const remainingBalance = Math.max(0, currentBalance - price);

    const handleInitiateGenerate = (e: React.FormEvent) => {
        e.preventDefault();

        const txData: UniversalTransactionData = {
            serviceName: `Korak Private VPN (${selectedLoc.code}) — ${selectedPlan.label.split('—')[0].trim()}`,
            serviceCategory: 'Encrypted VPN & Proxy',
            serviceType: 'vpn',
            providerName: `${selectedLoc.label.split('(')[0]} Server`,
            recipient: `${selectedLoc.label}`,
            recipientLabel: 'Server Location',
            selectedItemName: `${duration} Days Unlimited Access`,
            selectedItemLabel: 'Plan Tier',
            quantity: 1,
            subtotal: price,
            totalAmount: price,
            currencySymbol: currencySymbol,
            currencyCode: authCurrency.code || (userCurrencyId === 1 ? 'USD' : 'NGN'),
            currentBalance: currentBalance,
            remainingBalance: remainingBalance,
            status: 'awaiting_confirmation',
            additionalDetails: [
                { label: 'Protocol', value: selectedProto.label.split('(')[0].trim() },
                { label: 'Validity Period', value: `${duration} Days` },
                { label: 'No-Logs Policy', value: '100% Encrypted' },
            ],
        };

        flow.initiateFlow(txData);
        flow.openConfirmModal();
    };

    const handleExecuteGenerate = async () => {
        flow.startProcessing();

        const refId = 'KORAK-' + Math.floor(100000 + Math.random() * 900000);
        const configKey = `wg-${Math.random().toString(36).substring(2, 10)}@cipher-vpn-${location}.net:51820`;

        router.post('/user/services/order', {
            service_code: 'vpn_premium_key',
            quantity: 1,
            options: {
                location: location,
                protocol: protocol,
                duration_days: duration,
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                flow.completeSuccess({
                    reference: refId,
                    status: 'completed',
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    notes: `Provisioned Configuration: ${configKey}`,
                });
                toast.success('VPN configuration key provisioned and recorded in Order History!', 'Provisioning Completed');
            },
            onError: (err: any) => {
                flow.completeFailed(err.message || 'Failed to generate VPN key. Please check your wallet balance.');
                toast.error(err.message || 'Failed to generate VPN key. Please check your wallet balance.');
            }
        });
    };

    return (
        <>
            <Head title="Secure VPN Service" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Secure VPN Desk</h1>
                        <p className="text-xs text-text-secondary">
                            Provision WireGuard, OpenVPN, and V2Ray configs with dedicated IP routing across high-speed servers.
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
                            <strong className="text-text-primary">Service Deactivated:</strong> Secure VPN is currently paused for network upgrades. Our active services are <strong className="text-text-primary">Mobile Data</strong> and <strong className="text-text-primary">Airtime</strong>.
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
                    {/* Location & Protocol Form (8 Cols) */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Server Location Grid */}
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                1. Select Server Location
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {VPN_LOCATIONS.map((loc) => {
                                    const isSelected = location === loc.value;
                                    return (
                                        <button
                                            key={loc.value}
                                            type="button"
                                            onClick={() => setLocation(loc.value)}
                                            className={cn(
                                                "p-3 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer",
                                                isSelected
                                                    ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand shadow-2xs'
                                                    : 'border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <MapPinIcon size={16} className={isSelected ? 'text-brand' : 'text-text-muted'} />
                                                <div>
                                                    <div className="text-xs font-bold">{loc.label.split('(')[0]}</div>
                                                    <div className="text-[10px] text-text-muted">Latency: ~{loc.ping}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono font-bold">{loc.code}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs">
                            <form onSubmit={handleInitiateGenerate} className="space-y-4">
                                <Select
                                    label="2. Connection Protocol"
                                    options={PROTOCOLS}
                                    value={protocol}
                                    onChange={(e) => setProtocol(e.target.value)}
                                    helperText="WireGuard is recommended for lowest battery consumption and fastest throughput"
                                />

                                <Select
                                    label="3. Access Duration"
                                    options={PLAN_DURATION.map(p => ({
                                        value: p.value,
                                        label: `${p.label.split('—')[0].trim()} — ${currencySymbol}${isUsd ? p.priceUsd.toFixed(2) : p.priceNgn.toLocaleString()}`
                                    }))}
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />

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

                    {/* Features Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
                                <ShieldIcon size={20} className="text-brand" />
                                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    Enterprise Security
                                </span>
                            </div>

                            <ul className="space-y-3 text-xs">
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Strict No-Logs:</strong> RAM-only servers wipe memory on reboot.</span>
                                </li>
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Kill Switch:</strong> Automatic disconnection shield if connection drops.</span>
                                </li>
                                <li className="flex items-start gap-2 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                    <span><strong>Unlimited Bandwidth:</strong> High speed 10Gbps uplinks with zero throttling.</span>
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
                onConfirmPay={handleExecuteGenerate}
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

SecureVpn.layout = (page: React.ReactNode) => (
    <AppShell title="Secure VPN" backUrl="/user/services">
        {page}
    </AppShell>
);
