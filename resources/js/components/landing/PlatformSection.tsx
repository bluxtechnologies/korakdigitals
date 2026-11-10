import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    Wallet,
    Headphones,
    Lock,
    Activity,
    Check
} from 'lucide-react';

interface PlatformSectionProps {
    authUser?: any;
    brandName?: string;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({
    authUser,
    brandName = 'Korak Digitals',
}) => {
    return (
        <section
            id="platform"
            className="py-16 sm:py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full select-none border-t border-border-subtle/80 overflow-hidden"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                
                {/* ───────────────────────────────────────────────────────────
                    LEFT COLUMN: Editorial Content & 2x2 Capability Grid (~45% width)
                ─────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-5 space-y-8">
                    <ScrollReveal distance={22} duration={650}>
                        <div className="space-y-5">
                            
                            {/* Eyebrow Badge */}
                            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand-subtle px-3 py-1 rounded-full border border-brand/10 inline-block">
                                LIVE PRODUCTION ENVIRONMENT
                            </span>

                            {/* Main Heading with hand-drawn brush underline */}
                            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-text-primary leading-[1.18]">
                                Your complete command center,{' '}
                                <span className="relative whitespace-nowrap inline-block text-brand dark:text-brand">
                                    in action.
                                    {/* Hand-drawn editorial underline accent */}
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 170 14"
                                        className="absolute -bottom-1.5 left-0 w-full text-brand/85 dark:text-brand/85 overflow-visible pointer-events-none"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 10C45 3 115 2 167 7C118 9 65 10 20 11"
                                            stroke="currentColor"
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </h2>

                            {/* Supporting Paragraph */}
                            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                                What you see is what you use. Inspect the actual, production-ready interface configured with multi-currency reserves, real-time carrier routing, and 24/7 internal desk support — all from a single dashboard.
                            </p>

                        </div>
                    </ScrollReveal>

                    {/* 2x2 Capability Grid (matching the Global Access concept) */}
                    <ScrollReveal delay={100} distance={20} duration={650}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            
                            {/* Feature 1: Dual-Currency Ledger */}
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20 shadow-2xs">
                                    <Wallet size={19} strokeWidth={2.2} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                                    Dual-Currency Ledger
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Hold and convert active NGN & USD reserves with instant virtual account funding.
                                </p>
                            </div>

                            {/* Feature 2: Automated Routing */}
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20 shadow-2xs">
                                    <Zap size={19} strokeWidth={2.2} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                                    Automated Routing
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Direct carrier fulfillment adapters dispatch OTP, airtime, and data sub-second.
                                </p>
                            </div>

                            {/* Feature 3: Automated Timeout Refund */}
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20 shadow-2xs">
                                    <ShieldCheck size={19} strokeWidth={2.2} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                                    Automated Refunds
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Real-time transaction auditing with 10-minute automated refund if SMS fails to deliver.
                                </p>
                            </div>

                            {/* Feature 4: 24/7 Support Desk */}
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20 shadow-2xs">
                                    <Headphones size={19} strokeWidth={2.2} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                                    Active Support Desk
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    In-app support desk directly linked to your order references and live transaction IDs.
                                </p>
                            </div>

                        </div>
                    </ScrollReveal>

                    {/* Action Buttons */}
                    <ScrollReveal delay={150} distance={20} duration={650}>
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border-subtle/70">
                            <Link href={authUser ? '/user/dashboard' : '/register'}>
                                <Button
                                    size="lg"
                                    className="font-black text-sm px-7 py-3.5 shadow-sm active:scale-[0.96] transition-transform duration-150 inline-flex items-center gap-2 group"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <Link
                                href={authUser ? '/user/dashboard' : '/login'}
                                className="text-xs sm:text-sm font-bold text-text-secondary hover:text-brand transition-colors inline-flex items-center gap-1.5 group py-2"
                            >
                                <span>{authUser ? 'Open Workspace' : 'Sign in to Console'}</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-muted group-hover:text-brand" />
                            </Link>
                        </div>
                    </ScrollReveal>

                </div>

                {/* ───────────────────────────────────────────────────────────
                    RIGHT COLUMN: Dashboard Window with Floating Accent Cards (~55% width)
                ─────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-7 relative">
                    <ScrollReveal delay={80} distance={24} duration={700}>
                        <div className="relative pt-6 sm:pt-8 pb-8 sm:pb-10 px-2 sm:px-4">
                            
                            {/* Subtle Ambient Depth Glow Backdrop */}
                            <div
                                aria-hidden="true"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-brand/10 dark:bg-brand/15 blur-3xl pointer-events-none -z-10"
                            />

                            {/* Floating Accent Card 1: Top-Right Gateway Health Pill */}
                            <div className="absolute top-0 right-2 sm:right-6 z-20 animate-fade-in">
                                <div className="bg-white/95 dark:bg-bg-surface/95 backdrop-blur-md border border-border-subtle px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 text-xs">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <span className="font-bold text-text-primary text-[11px] sm:text-xs">
                                        Production Gateway
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-brand bg-brand-subtle px-1.5 py-0.5 rounded-sm border border-brand/20">
                                        99.98% Live
                                    </span>
                                </div>
                            </div>

                            {/* Browser Frame Window */}
                            <div className="relative rounded-2xl overflow-hidden border border-border-strong bg-bg-surface shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(128,0,32,0.14)] group">
                                
                                {/* macOS-style Browser Top Navigation Bar */}
                                <div className="bg-bg-base border-b border-border-subtle px-4 py-2.5 flex items-center justify-between select-none">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                                    </div>

                                    {/* URL Bar */}
                                    <div className="flex items-center gap-2 bg-bg-surface border border-border-subtle px-3.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono text-text-muted max-w-[240px] sm:max-w-none truncate">
                                        <Lock size={10} className="text-brand shrink-0" />
                                        <span className="truncate">korakdigital.com/user/dashboard</span>
                                    </div>

                                    {/* SSL Badge */}
                                    <div className="text-[10px] font-semibold text-text-muted hidden sm:flex items-center gap-1">
                                        <ShieldCheck size={11} className="text-brand" />
                                        <span>256-bit SSL</span>
                                    </div>
                                </div>

                                {/* Actual Authenticated Dashboard Screenshot */}
                                <div className="relative overflow-hidden bg-bg-surface">
                                    <img
                                        src="/web-img.png"
                                        alt="Korak Digitals authenticated customer command center interface"
                                        className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {/* Subtle gradient sheen at bottom */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-surface/60 to-transparent pointer-events-none" />
                                </div>

                            </div>

                            {/* Floating Accent Card 2: Bottom-Left Real-time Settlement Notification */}
                            <div className="absolute -bottom-4 sm:-bottom-5 left-1 sm:left-6 z-20 max-w-[270px] sm:max-w-[300px]">
                                <div className="bg-white/95 dark:bg-bg-surface/95 backdrop-blur-md border border-border-subtle p-3 rounded-xl shadow-xl space-y-1.5 hover:border-brand/40 transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-brand-subtle text-brand flex items-center justify-center font-bold">
                                                <Check size={13} strokeWidth={2.8} />
                                            </div>
                                            <span className="text-[11px] font-bold text-text-primary">
                                                Instant Settlement
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-text-muted">
                                            Just now
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                                        <span className="text-text-muted text-[10px]">Virtual NUBAN Deposit</span>
                                        <span className="font-extrabold text-brand text-xs">+₦14,456.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Accent Card 3: Bottom-Right Instant Carrier Fulfillment Badge */}
                            <div className="absolute -bottom-3 sm:-bottom-4 right-1 sm:right-6 z-20 hidden md:block">
                                <div className="bg-white/95 dark:bg-bg-surface/95 backdrop-blur-md border border-border-subtle px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-[11px]">
                                    <div className="w-5 h-5 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                        <Activity size={11} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-text-primary block text-[10px] sm:text-[11px]">
                                            Carrier API Status
                                        </span>
                                        <span className="text-[9px] text-text-muted font-mono">
                                            Sub-second dispatch
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </ScrollReveal>
                </div>

            </div>
        </section>
    );
};
