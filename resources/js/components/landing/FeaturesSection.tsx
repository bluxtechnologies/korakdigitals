import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    Wallet,
    Zap,
    ShieldCheck,
    Clock,
    Users,
    ChevronRight,
    Eye,
    Check,
    Phone,
    Wifi,
    TrendingUp
} from 'lucide-react';
import { useInView } from '@/components/ui/ScrollReveal';

interface FeaturesSectionProps {
    authUser?: any;
}

export function FeaturesSection({ authUser }: FeaturesSectionProps) {
    const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

    const getCardStyle = (delayMs: number) => ({
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transitionProperty: 'opacity, transform, border-color, box-shadow',
        transitionDuration: '650ms, 650ms, 300ms, 300ms',
        transitionDelay: `${delayMs}ms, ${delayMs}ms, 0ms, 0ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: isInView ? 'auto' : 'opacity, transform',
    });

    return (
        <section
            id="features"
            ref={sectionRef}
            className="py-16 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full select-none border-b border-border-subtle/80 overflow-hidden"
        >
            {/* ── Section Header (Fade + Settle Upward) ── */}
            <div
                className="text-center max-w-2xl mx-auto mb-14 space-y-3 transition-all duration-700 ease-out"
                style={{
                    opacity: isInView ? 1 : 0,
                    transform: isInView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                {/* Pill Tag */}
                <span className="inline-block text-[11px] sm:text-xs font-bold text-brand uppercase tracking-widest bg-brand-subtle px-3.5 py-1 rounded-full border border-brand/20 shadow-2xs">
                    FEATURES
                </span>

                {/* Headline with Signature Burgundy Brush Flourish */}
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-text-primary leading-[1.18] [text-wrap:balance]">
                    Built for a smoother{' '}
                    <span className="relative inline-block text-brand">
                        digital experience.
                        {/* Burgundy Curved Flourish Underline */}
                        <svg
                            className="absolute -bottom-2.5 left-0 w-full overflow-visible pointer-events-none text-brand"
                            height="12"
                            viewBox="0 0 240 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 8C65 2.5 175 3 237 8"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1 max-w-xl mx-auto">
                    Smart tools, faster access, and a more seamless way to manage your digital services — all in one place.
                </p>
            </div>

            {/* ── 3-Column, 2-Row Features Grid (6 Cards with 70ms Stagger) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">

                {/* ───────────────────────────────────────────────────────────
                    CARD 01: One Account, One Workspace (0ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href={authUser ? '/user/dashboard' : '/register'}
                    style={getCardStyle(0)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <Wallet size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            One Account, One Workspace
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Manage your services, wallet, purchases and settings from a single, secure workspace.
                        </p>
                    </div>

                    {/* Bottom Visual: Laptop + Mobile Workspace Mockup */}
                    <div className="mt-8 pt-2 flex items-center justify-center relative min-h-[190px] group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        {/* Background Ambient Glow */}
                        <div className="absolute inset-0 bg-brand/5 dark:bg-brand/10 rounded-xl blur-xl -z-10 group-hover:bg-brand/15 transition-colors duration-300" />

                        {/* Laptop Mockup */}
                        <div className="relative w-[210px] sm:w-[220px] bg-neutral-900 rounded-t-xl p-1.5 shadow-md border border-neutral-700/60 pb-3 group-hover:border-neutral-600 transition-colors duration-300">
                            {/* Screen Bezel Top Dot */}
                            <div className="w-1 h-1 rounded-full bg-neutral-600 mx-auto mb-1" />
                            {/* Laptop Display Screen */}
                            <div className="bg-[#1C0D15] rounded-lg p-2.5 flex gap-2 overflow-hidden border border-brand/30">
                                {/* Left Mini Sidebar */}
                                <div className="w-8 flex flex-col gap-1.5 border-r border-brand/20 pr-1.5">
                                    <div className="w-5 h-5 rounded-md bg-brand text-brand-foreground flex items-center justify-center font-black text-[9px] shadow-2xs">
                                        K
                                    </div>
                                    <div className="w-3.5 h-1 rounded-full bg-brand/40 mt-1" />
                                    <div className="w-3.5 h-1 rounded-full bg-brand/20" />
                                    <div className="w-3.5 h-1 rounded-full bg-brand/20" />
                                </div>
                                {/* Main Display Area */}
                                <div className="flex-1 space-y-2">
                                    {/* Mini Wallet Card */}
                                    <div className="bg-gradient-to-r from-brand to-brand-hover p-2 rounded-md text-white shadow-2xs group-hover:shadow-xs transition-shadow">
                                        <span className="text-[7px] text-rose-200 block uppercase tracking-wider">
                                            Wallet Balance
                                        </span>
                                        <span className="text-xs font-mono font-bold tabular-nums">$24.50</span>
                                    </div>
                                    {/* Mini Service List */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded text-[8px] text-rose-100">
                                            <div className="w-2 h-2 rounded-full bg-brand" />
                                            <span>Airtime</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded text-[8px] text-rose-100">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <span>Data</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded text-[8px] text-rose-100">
                                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                                            <span>Social Media</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Laptop Base Stand */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[230px] sm:w-[240px] h-2 bg-neutral-700 rounded-b-md shadow-xs flex justify-center">
                                <div className="w-12 h-0.5 bg-neutral-500 rounded-full" />
                            </div>
                        </div>

                        {/* Mobile Phone Mockup (Floating & Overlapping Laptop Right) */}
                        <div className="absolute -right-1 sm:right-1 bottom-1 w-[80px] bg-neutral-900 rounded-xl p-1 shadow-xl border border-neutral-700/80 transform translate-y-1 group-hover:translate-y-[-2px] transition-transform duration-300">
                            {/* Dynamic Island Notch */}
                            <div className="w-6 h-1 rounded-full bg-neutral-700 mx-auto mb-1" />
                            {/* Phone Screen */}
                            <div className="bg-[#1C0D15] rounded-lg p-1.5 space-y-1 border border-brand/30">
                                <div className="w-full h-4 rounded bg-brand p-0.5 flex items-center justify-between">
                                    <div className="w-2 h-2 rounded-full bg-white/40" />
                                    <div className="w-4 h-1 rounded-full bg-white/60" />
                                </div>
                                <div className="h-2 w-full bg-black/40 rounded" />
                                <div className="h-2 w-4/5 bg-black/40 rounded" />
                                <div className="h-2 w-full bg-black/40 rounded" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ───────────────────────────────────────────────────────────
                    CARD 02: Fast Access, Without the Runaround (70ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href="#how-it-works"
                    style={getCardStyle(70)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <Zap size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            Fast Access, Without the Runaround
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Get what you need without jumping between platforms. Choose a service, provide the details and complete the transaction in just a few steps.
                        </p>
                    </div>

                    {/* Bottom Visual: Interactive Service Selector Menu with Mouse Cursor */}
                    <div className="mt-8 pt-2 flex items-center justify-center relative min-h-[190px] group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        {/* Selector Card */}
                        <div className="w-full max-w-[230px] bg-white dark:bg-bg-base border border-border-subtle rounded-xl p-2.5 shadow-md space-y-1 relative group-hover:shadow-lg transition-shadow duration-300">
                            {/* Row 1: Airtime */}
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-brand-subtle text-brand flex items-center justify-center">
                                        <Phone size={12} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-xs font-semibold text-text-primary">Airtime</span>
                                </div>
                                <ChevronRight size={13} className="text-text-muted" />
                            </div>

                            {/* Row 2: Data */}
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Wifi size={12} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-xs font-semibold text-text-primary">Data</span>
                                </div>
                                <ChevronRight size={13} className="text-text-muted" />
                            </div>

                            {/* Row 3: Social Media */}
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                        <TrendingUp size={12} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-xs font-semibold text-text-primary">Social Media</span>
                                </div>
                                <ChevronRight size={13} className="text-text-muted" />
                            </div>

                            {/* Row 4: Verification (Highlighted / Target Click) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-brand-subtle border border-brand/30 group-hover:border-brand transition-colors relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-brand text-brand-foreground flex items-center justify-center shadow-2xs">
                                        <ShieldCheck size={12} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-xs font-bold text-brand">Verification</span>
                                </div>
                                <ChevronRight size={13} className="text-brand" />
                            </div>

                            {/* Burgundy Cursor Clicking on Verification Row (micro-nudging on hover) */}
                            <div className="absolute -bottom-2 -right-1 pointer-events-none transform translate-x-1 translate-y-1 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:scale-105 transition-all duration-300 ease-out text-brand">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.5 3.5L18.5 10.5L12.5 12.5L9.5 19.5L5.5 3.5Z"
                                        fill="currentColor"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ───────────────────────────────────────────────────────────
                    CARD 03: Built Around Your Wallet (140ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href={authUser ? '/user/wallet' : '/register'}
                    style={getCardStyle(140)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <Wallet size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            Built Around Your Wallet
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Fund once. Use it across your services. <strong className="font-semibold text-text-primary">Your wallet keeps</strong> your balance, transactions and spending in check.
                        </p>
                    </div>

                    {/* Bottom Visual: Burgundy Wallet Card + Multi-Currency Pills */}
                    <div className="mt-8 pt-2 flex flex-col items-center justify-center relative min-h-[190px] group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        {/* Primary Wallet Balance Card */}
                        <div className="w-full max-w-[230px] bg-gradient-to-br from-brand via-brand-hover to-brand-active text-white rounded-xl p-3.5 shadow-md border border-brand/30 relative overflow-hidden group-hover:shadow-rose-950/30 group-hover:scale-[1.01] transition-all duration-300">
                            {/* Watermark Logo Texture */}
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-rose-100 uppercase tracking-wider">
                                    Korak Wallet
                                </span>
                                <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <Eye size={11} className="text-rose-100" />
                                </div>
                            </div>
                            <div className="text-xl font-bold font-mono tabular-nums tracking-tight text-white">
                                ₦24,500.00
                            </div>
                        </div>

                        {/* Multi-Currency Selection Tray */}
                        <div className="w-full max-w-[215px] bg-white dark:bg-bg-base border border-border-subtle rounded-xl p-2.5 shadow-sm -mt-2 space-y-1 relative z-10 group-hover:border-brand/30 transition-colors">
                            {/* NGN (Active) */}
                            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-brand-subtle">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">🇳🇬</span>
                                    <span className="text-xs font-bold text-text-primary">NGN</span>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-brand text-brand-foreground flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                                    <Check size={10} strokeWidth={3} />
                                </div>
                            </div>

                            {/* USD */}
                            <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">🇺🇸</span>
                                    <span className="text-xs font-medium text-text-secondary">USD</span>
                                </div>
                            </div>

                            {/* EUR */}
                            <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">🇪🇺</span>
                                    <span className="text-xs font-medium text-text-secondary">EUR</span>
                                </div>
                            </div>

                            {/* GBP */}
                            <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">🇬🇧</span>
                                    <span className="text-xs font-medium text-text-secondary">GBP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ───────────────────────────────────────────────────────────
                    CARD 04: Know What You're Paying For (210ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href="#platform"
                    style={getCardStyle(210)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <ShieldCheck size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            Know What You're Paying For
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Clear prices before you confirm. See the service details, charges and total — no hidden fees, no surprises.
                        </p>
                    </div>

                    {/* Bottom Visual: Confirm Purchase Modal Receipt */}
                    <div className="mt-8 pt-2 flex items-center justify-center relative min-h-[190px] group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        <div className="w-full max-w-[230px] bg-white dark:bg-bg-base border border-border-subtle rounded-xl p-3.5 shadow-md space-y-2.5 group-hover:shadow-lg transition-shadow duration-300">
                            <h4 className="text-xs font-bold text-text-primary pb-1.5 border-b border-border-subtle">
                                Confirm Purchase
                            </h4>

                            <div className="space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Service</span>
                                    <span className="font-semibold text-text-primary">Data (1GB)</span>
                                </div>
                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Network</span>
                                    <span className="font-semibold text-text-primary">MTN</span>
                                </div>
                                <div className="flex items-center justify-between text-text-secondary">
                                    <span>Amount</span>
                                    <span className="font-mono tabular-nums font-semibold text-text-primary">₦1,500</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                                <span className="text-xs font-bold text-text-primary">Total</span>
                                <span className="text-sm font-bold font-mono tabular-nums text-text-primary">₦1,500</span>
                            </div>

                            {/* Confirm Button with tactile feedback */}
                            <div className="w-full bg-brand hover:bg-brand-hover active:scale-[0.96] text-white py-2 rounded-lg text-center text-xs font-bold shadow-2xs transition-all duration-200 cursor-pointer">
                                Confirm & Pay
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ───────────────────────────────────────────────────────────
                    CARD 05: Transaction History That Actually Helps (280ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href={authUser ? '/user/orders' : '/register'}
                    style={getCardStyle(280)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <Clock size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            Transaction History That Actually Helps
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Every transaction leaves a trail. Check your purchases, references, status and details whenever you need them.
                        </p>
                    </div>

                    {/* Bottom Visual: Transactions Ledger Card */}
                    <div className="mt-8 pt-2 flex items-center justify-center relative min-h-[190px] group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        <div className="w-full max-w-[245px] bg-white dark:bg-bg-base border border-border-subtle rounded-xl p-3 shadow-md space-y-2 group-hover:shadow-lg transition-shadow duration-300">
                            {/* Card Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
                                <span className="text-xs font-bold text-text-primary">Transactions</span>
                                <span className="text-[10px] font-bold text-brand group-hover:underline flex items-center gap-0.5">
                                    View all →
                                </span>
                            </div>

                            {/* Item 1: Airtime */}
                            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                        <Phone size={12} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-bold text-text-primary leading-tight">
                                            Airtime (MTN)
                                        </span>
                                        <span className="text-[9px] text-success font-semibold leading-tight flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            Completed
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-mono tabular-nums font-bold text-text-primary">₦1,000</span>
                                    <span className="text-[9px] text-text-muted">2m ago</span>
                                </div>
                            </div>

                            {/* Item 2: Data */}
                            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Wifi size={12} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-bold text-text-primary leading-tight">
                                            Data (Airtel)
                                        </span>
                                        <span className="text-[9px] text-success font-semibold leading-tight flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                            Completed
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-mono tabular-nums font-bold text-text-primary">₦1,500</span>
                                    <span className="text-[9px] text-text-muted">12m ago</span>
                                </div>
                            </div>

                            {/* Item 3: Social Media */}
                            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-surface hover:translate-x-0.5 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <TrendingUp size={12} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-bold text-text-primary leading-tight">
                                            Social Media (IG)
                                        </span>
                                        <span className="text-[9px] text-success font-semibold leading-tight flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                            Completed
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-mono tabular-nums font-bold text-text-primary">₦2,000</span>
                                    <span className="text-[9px] text-text-muted">1h ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ───────────────────────────────────────────────────────────
                    CARD 06: Services That Work Around You (350ms stagger)
                ─────────────────────────────────────────────────────────── */}
                <Link
                    href={authUser ? '/user/dashboard' : '/register'}
                    style={getCardStyle(350)}
                    className="group bg-white dark:bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-brand/50 hover:shadow-md dark:hover:shadow-[0_12px_30px_rgba(128,0,32,0.18)] hover:-translate-y-1 transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                    {/* Top Text Content */}
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground transition-all duration-300">
                            <Users size={20} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors duration-200">
                            Services That Work Around You
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2.5">
                            Use Korak from wherever your work takes you. Built for marketers, creators, online businesses and everyday users.
                        </p>
                    </div>

                    {/* Bottom Visual: Professional with Laptop + Globe & Flight Route */}
                    <div className="mt-8 pt-2 flex items-center justify-center relative min-h-[190px] overflow-visible group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                        {/* Background Globe & Route SVG */}
                        <svg
                            className="w-full max-w-[240px] h-[170px] overflow-visible text-brand"
                            viewBox="0 0 240 170"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Soft Globe Halo */}
                            <circle cx="160" cy="90" r="65" fill="currentColor" fillOpacity="0.08" className="group-hover:fill-opacity-12 transition-all duration-300" />
                            {/* Globe Longitude / Latitude Rings */}
                            <ellipse cx="160" cy="90" rx="65" ry="30" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
                            <ellipse cx="160" cy="90" rx="65" ry="55" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />
                            <line x1="95" y1="90" x2="225" y2="90" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />
                            <line x1="160" y1="25" x2="160" y2="155" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />

                            {/* Flight Route Trajectory Arc */}
                            <path
                                d="M40 145C80 80 180 50 215 35"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                opacity="0.6"
                            />

                            {/* Airplane Icon along Trajectory (subtly shifts along trajectory on hover) */}
                            <g className="transform transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5">
                                <g transform="translate(210, 30) rotate(-35)">
                                    <path
                                        d="M10 2L1 7L4 8L1 11L3 11.5L5.5 9.5L9 10.5L10 10L8 7.5L10 2Z"
                                        fill="currentColor"
                                    />
                                </g>
                            </g>

                            {/* Vector Character: Young Professional with Burgundy Hoodie & Laptop */}
                            {/* Person Body/Hoodie */}
                            <path
                                d="M125 170C125 138 140 120 162 118C184 120 198 138 198 170Z"
                                fill="currentColor"
                            />
                            {/* Hoodie Collar Accent */}
                            <path
                                d="M152 118C152 125 162 129 162 129C162 129 172 125 172 118"
                                stroke="var(--brand-active)"
                                strokeWidth="2.5"
                                fill="none"
                            />
                            {/* Neck */}
                            <path d="M155 106H168V120H155Z" fill="#5A3A28" />
                            {/* Head */}
                            <ellipse cx="162" cy="94" rx="13" ry="15" fill="#5A3A28" />
                            {/* Ear */}
                            <ellipse cx="149" cy="96" rx="2.5" ry="3.5" fill="#5A3A28" />
                            {/* Cropped Curly Hair */}
                            <path
                                d="M150 94C149 84 153 76 163 76C173 76 177 83 176 93C174 91 171 90 168 90C163 90 157 91 150 94Z"
                                fill="#1A1A1A"
                            />
                            {/* Eyebrow & Focused Eye */}
                            <line x1="152" y1="91" x2="157" y2="92" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="154.5" cy="95" r="1.2" fill="#1A1A1A" />
                            {/* Smiling Mouth */}
                            <path d="M152 101C154 103 158 103 160 101" stroke="#3A2012" strokeWidth="1.2" strokeLinecap="round" />

                            {/* Laptop Base & Keyboard */}
                            <rect x="75" y="145" width="85" height="4" rx="2" fill="#94A3B8" />
                            <rect x="95" y="143" width="45" height="1.5" rx="0.75" fill="#64748B" />

                            {/* Laptop Screen Open at Angle */}
                            <path
                                d="M82 145L102 96C103 94 105 93 107 93H152C154 93 156 94 156 96L142 145H82Z"
                                fill="#CBD5E1"
                                stroke="#94A3B8"
                                strokeWidth="1"
                            />
                            {/* Laptop Inner Display with Soft Glow */}
                            <path
                                d="M86 142L104 98H150L139 142H86Z"
                                fill="#0F172A"
                            />
                            {/* Laptop Screen Content Lines */}
                            <line x1="108" y1="106" x2="135" y2="106" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="104" y1="114" x2="140" y2="114" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="100" y1="122" x2="130" y2="122" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                            {/* Hands Resting on Keyboard */}
                            <ellipse cx="140" cy="144" rx="6" ry="3.5" fill="#5A3A28" />
                            <ellipse cx="120" cy="144" rx="6" ry="3.5" fill="#5A3A28" />
                        </svg>
                    </div>
                </Link>

            </div>
        </section>
    );
}
