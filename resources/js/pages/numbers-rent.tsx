import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InboxIcon, PhoneIcon } from '@/components/ui/Icons';
import { Clock, ShieldCheck, RefreshCw, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RentedOrderItem {
    id: number;
    item_title: string;
    subtotal: number;
    currency_code: string;
    status: string;
    credentials_payload?: {
        phone_number?: string;
        country_name?: string;
        service_name?: string;
        duration_hours?: number;
        expires_at?: string;
        otps?: Array<{ code: string; text?: string; received_at: string }>;
    };
    created_at: string;
}

export interface RentedOrder {
    id: number;
    public_reference: string;
    service_category: string;
    total_amount: number;
    currency_code: string;
    status: string;
    metadata?: Record<string, any>;
    items?: RentedOrderItem[];
    created_at: string;
}

interface NumbersRentPageProps {
    rentedOrders: RentedOrder[];
    walletBalance: number;
    userCurrency: string;
    exchangeRate: number;
}

const RENTAL_TIERS = [
    { duration: '24 Hours', days: '1 Day', hours: 24, popular: false, badge: 'Short Lease' },
    { duration: '72 Hours', days: '3 Days', hours: 72, popular: false, badge: 'Standard' },
    { duration: '7 Days', days: '1 Week', hours: 168, popular: true, badge: 'Most Popular' },
    { duration: '14 Days', days: '2 Weeks', hours: 336, popular: false, badge: 'Extended' },
    { duration: '30 Days', days: '1 Month', hours: 720, popular: false, badge: 'Long Term' },
    { duration: '90 Days', days: '3 Months', hours: 2160, popular: false, badge: 'Quarterly' },
];

export default function NumbersRent() {
    const { props } = usePage<NumbersRentPageProps>();
    const rentedOrders = props.rentedOrders || [];
    const userCurrency = props.userCurrency || 'NGN';
    const currencySymbol = userCurrency === 'USD' ? '$' : '₦';

    const [selectedTier, setSelectedTier] = React.useState(RENTAL_TIERS[2]);

    return (
        <>
            <Head title="Rent Digital Numbers (Multi-Day Access) — Korak" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">

                {/* Page Title & Navigation Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                            Rent Numbers
                        </h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Keep a dedicated virtual phone number active for days, weeks, or months with multiple OTP reception.
                        </p>
                    </div>

                    {/* Dedicated Navigation Subtabs between the 2 Pages */}
                    <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-subtle rounded-md">
                        <Link
                            href="/user/numbers"
                            className="px-3 py-1.5 rounded-sm text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Quick Activation (1 OTP)
                        </Link>
                        <div className="px-3 py-1.5 rounded-sm text-xs font-bold bg-brand text-text-inverse shadow-2xs flex items-center gap-1.5">
                            <span>Rent Numbers (Multi-day)</span>
                            <Badge variant="primary" size="xs">Paused</Badge>
                        </div>
                    </div>
                </div>

                {/* Deactivated Service Notice */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-text-secondary font-medium">
                        <span className="text-sm">⚠️</span>
                        <span>
                            <strong className="text-text-primary">Service Deactivated:</strong> Rent Numbers service is currently paused for upgrades. Our active working services are <strong className="text-text-primary">Mobile Data</strong> and <strong className="text-text-primary">Airtime</strong>.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/user/services/data" className="text-xs font-bold text-brand hover:underline">
                            Go to Mobile Data →
                        </Link>
                    </div>
                </div>

                {/* Hero / Overview Banner */}
                <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-md bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shrink-0">
                                <Clock size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-text-primary">Multi-Day Retention</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Hold real mobile numbers from 24 hours up to 180 days with continuous availability.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-md bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shrink-0">
                                <InboxIcon size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-text-primary">Multiple SMS Reception</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Receive recurring OTP codes, verification requests, and 2FA login prompts on a dedicated message stream.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-md bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shrink-0">
                                <RefreshCw size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-text-primary">Prolong &amp; Reactivate</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Extend active leases before expiry, or reactivate previously used numbers through live priced options.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rental Durations & Live Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Columns (8/12): Duration Options & Specs */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Durations Selector */}
                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                    <h2 className="text-sm font-bold text-text-primary">Rental Lease Periods</h2>
                                    <p className="text-xs text-text-secondary">
                                        Select standard rental duration tiers available on the provider network
                                    </p>
                                </div>
                                <Badge variant="primary" size="xs">Lease Tiers</Badge>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {RENTAL_TIERS.map((tier) => {
                                    const isSelected = selectedTier.hours === tier.hours;
                                    return (
                                        <button
                                            key={tier.hours}
                                            onClick={() => setSelectedTier(tier)}
                                            className={cn(
                                                'p-4 rounded-md border text-left flex flex-col gap-2 transition-all cursor-pointer relative',
                                                isSelected
                                                    ? 'border-brand bg-brand-subtle ring-1 ring-brand shadow-2xs'
                                                    : 'border-border-subtle bg-bg-base hover:bg-bg-surface-hover'
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className={cn('text-xs font-bold uppercase tracking-wider', isSelected ? 'text-brand' : 'text-text-muted')}>
                                                    {tier.days}
                                                </span>
                                                {tier.popular && (
                                                    <Badge variant="primary" size="xs">Popular</Badge>
                                                )}
                                            </div>
                                            <div className="text-lg font-black text-text-primary">
                                                {tier.duration}
                                            </div>
                                            <span className="text-[10px] text-text-secondary">
                                                {tier.hours} hours continuous active window
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 rounded-md bg-bg-base border border-border-subtle flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                                    <ShieldCheck size={16} className="text-brand" />
                                    <span>Rental Extension Policy</span>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Rental numbers can be prolonged up to 24 hours prior to expiration. Once a rental period completes, numbers remain eligible for reactivation for up to 7 days before returning to the carrier pool.
                                </p>
                            </div>
                        </div>

                        {/* Phase 2 Architecture Notice */}
                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="primary" size="xs">Phase 2 Scope</Badge>
                                    <h3 className="text-sm font-bold text-text-primary">Full Rental Purchasing Pipeline</h3>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                                    Quick Activations are fully live and operational now. Dedicated multi-day rentals with automated webhook inbox streaming are launching in Phase 2.
                                </p>
                            </div>
                            <Link href="/user/numbers">
                                <Button variant="primary" size="sm" className="whitespace-nowrap flex items-center gap-2">
                                    <span>Go to Quick Activation</span>
                                    <ArrowRight size={14} />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Columns (4/12): My Rented Numbers Workspace */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between select-none">
                            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                My Rented Numbers
                            </h3>
                            <Badge variant="primary">
                                {rentedOrders.length} Active
                            </Badge>
                        </div>

                        {rentedOrders.length === 0 ? (
                            <div className="bg-bg-surface border border-border-subtle p-8 rounded-md text-center flex flex-col items-center justify-center gap-3 select-none shadow-2xs">
                                <div className="w-12 h-12 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted">
                                    <Smartphone size={24} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-text-primary">No Active Rented Numbers</span>
                                    <span className="text-[10px] text-text-secondary max-w-[220px] leading-relaxed mx-auto">
                                        Multi-day rented phone lines with prolonged access and inbox history will appear here.
                                    </span>
                                </div>
                                <Link href="/user/numbers" className="mt-2">
                                    <Button variant="outline" size="xs">
                                        Need a Quick Code? Use 1-OTP
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {rentedOrders.map((order) => (
                                    <div key={order.id} className="p-4 bg-bg-surface border border-border-subtle rounded-md shadow-2xs flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-text-primary">Ref: {order.public_reference}</span>
                                            <Badge variant={order.status === 'completed' ? 'success' : 'primary'}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

NumbersRent.layout = (page: React.ReactNode) => (
    <AppShell title="Rent Digital Numbers" backUrl="/user/services">
        {page}
    </AppShell>
);
