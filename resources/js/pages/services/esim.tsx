import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import {
    Globe,
    QrCode,
    Sparkles,
    ShieldCheck,
    Wifi,
    Phone,
    ArrowRight,
    CheckCircle2,
    Clock,
    Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ESimComingSoonPage() {
    const { props } = usePage<any>();
    const authUser = props.auth?.user || {};
    const toast = useToast();

    const [email, setEmail] = React.useState(authUser.email || '');
    const [isSubscribed, setIsSubscribed] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleNotifyMe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubscribed(true);
            toast.success('You have been added to the early-access waitlist for Korak eSIM!');
        }, 600);
    };

    return (
        <>
            <Head title="Global eSIM Data — Coming Soon" />

            <div className="max-w-5xl mx-auto space-y-8 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-2 pb-16">

                {/* ──── 1. Page Header ──── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                                Global eSIM Data
                            </h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-subtle border border-brand/20 px-2.5 py-0.5 rounded-full">
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                            Stay connected worldwide without physical SIM cards. In active development.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-lg">
                        <Clock size={14} className="text-brand shrink-0" aria-hidden="true" />
                        <span className="font-medium text-[11px]">Launching in Upcoming Release</span>
                    </div>
                </div>

                {/* ──── 2. Hero Visual Card ──── */}
                <div className="bg-brand text-brand-foreground rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                    {/* Decorative curved watermarks */}
                    <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full border-[18px] border-white/8 pointer-events-none" />
                    <div className="absolute -right-2 -bottom-2 w-32 h-32 rounded-full border-[12px] border-white/6 pointer-events-none" />

                    <div className="relative z-10 max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/12 border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase">
                            <Sparkles size={12} aria-hidden="true" />
                            <span>Next-Gen Travel Connectivity</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                            International Travel Data Without Roaming Fees
                        </h2>

                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                            We are finalizing direct global telecom carrier integrations for Korak eSIM. Soon you will be able to activate high-speed 4G/5G mobile data across 190+ countries straight from your phone using an instant QR code.
                        </p>
                    </div>
                </div>

                {/* ──── 3. What to Expect (4 Feature Cards) ──── */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-text-primary tracking-tight">
                        What to Expect with Korak eSIM
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                <QrCode size={18} />
                            </div>
                            <h4 className="text-xs font-bold text-text-primary">Instant QR Setup</h4>
                            <p className="text-[11px] text-text-secondary leading-snug">
                                Scan a secure QR code or copy the LPA string to activate within 60 seconds.
                            </p>
                        </div>

                        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-info-bg text-info flex items-center justify-center shrink-0">
                                <Globe size={18} />
                            </div>
                            <h4 className="text-xs font-bold text-text-primary">190+ Countries</h4>
                            <p className="text-[11px] text-text-secondary leading-snug">
                                Destination coverage across North America, Europe, Asia, Africa, and Global passes.
                            </p>
                        </div>

                        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                <Phone size={18} />
                            </div>
                            <h4 className="text-xs font-bold text-text-primary">Keep Your Number</h4>
                            <p className="text-[11px] text-text-secondary leading-snug">
                                Dual-SIM capability lets you keep your primary WhatsApp and bank alerts active.
                            </p>
                        </div>

                        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                            <h4 className="text-xs font-bold text-text-primary">Zero Roaming Shock</h4>
                            <p className="text-[11px] text-text-secondary leading-snug">
                                Prepaid transparent pricing funded directly from your Korak multi-currency wallet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ──── 4. Early Access Notification Form ──── */}
                <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 shadow-2xs">
                    <div className="max-w-xl space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-text-primary">
                                Get Notified When eSIM Launches
                            </h3>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Join our early-access waitlist to receive priority access and exclusive beta discounts.
                            </p>
                        </div>

                        {isSubscribed ? (
                            <div className="p-3.5 rounded-xl bg-success-bg border border-success-border/60 text-success text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 size={16} className="shrink-0" />
                                <span>You are on the VIP launch list! We will email you the moment eSIM goes live.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-bg-base border border-border-subtle focus:border-brand rounded-lg px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-1.5 bg-brand text-brand-foreground hover:bg-brand-hover active:scale-[0.96] text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition-transform cursor-pointer disabled:opacity-60 shrink-0"
                                >
                                    <Send size={13} aria-hidden="true" />
                                    <span>{isSubmitting ? 'Adding...' : 'Notify Me'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ──── 5. Working Active Services (Airtime & Data) ──── */}
                <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-text-primary">
                            Need mobile connectivity right now?
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Our instant local airtime and high-speed data services are fully active and operational.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <Link
                            href="/user/services/data"
                            className="group p-4 rounded-xl border border-border-subtle hover:border-brand/40 bg-bg-base hover:bg-bg-surface-hover/80 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-info-bg text-info flex items-center justify-center shrink-0">
                                    <Wifi size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                                        Mobile Data Top-up
                                    </h4>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        Instant SME, Gifting &amp; Corporate data for all networks
                                    </p>
                                </div>
                            </div>
                            <ArrowRight size={15} className="text-text-muted group-hover:text-brand group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/user/services/airtime"
                            className="group p-4 rounded-xl border border-border-subtle hover:border-brand/40 bg-bg-base hover:bg-bg-surface-hover/80 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                                        Airtime Recharge
                                    </h4>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        Instant airtime recharge with cashback bonus
                                    </p>
                                </div>
                            </div>
                            <ArrowRight size={15} className="text-text-muted group-hover:text-brand group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}
