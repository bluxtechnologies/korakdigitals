import React from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
    ArrowRight,
    ArrowDown,
    Check,
    ChevronRight,
    ChevronDown,
    Search,
    Smartphone,
    Wifi,
    Shield,
    ShieldCheck,
    TrendingUp,
    Radio,
    Globe,
    ShoppingBag,
    Send
} from 'lucide-react';

interface HowItWorksSectionProps {
    authUser?: any;
    brandName?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
    authUser,
    brandName = 'Korak Digitals',
}) => {
    return (
        <section
            id="how-it-works"
            className="py-16 sm:py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full select-none"
        >
            {/* ───────────────────────────────────────────────────────────
                1. SECTION HEADER (Centered Editorial)
            ─────────────────────────────────────────────────────────── */}
            <ScrollReveal distance={20} duration={650}>
                <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
                    {/* Eyebrow */}
                    <p className="text-xs font-bold text-brand uppercase tracking-widest inline-block">
                        HOW IT WORKS
                    </p>

                    {/* Main Heading with hand-drawn brush underline */}
                    <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-text-primary leading-[1.15]">
                        From what you need <br />
                        to{' '}
                        <span className="relative whitespace-nowrap inline-block text-brand dark:text-brand">
                            getting it done.
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 260 16"
                                className="absolute -bottom-1.5 left-0 w-full text-brand/85 dark:text-brand/85 overflow-visible pointer-events-none"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M4 11C70 4 180 3 256 8C182 10 102 11 30 12"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </h2>

                    {/* Supporting explanation */}
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto pt-1">
                        Find the service you need, provide the required details, and complete your request — all in a few simple steps.
                    </p>
                </div>
            </ScrollReveal>

            {/* ───────────────────────────────────────────────────────────
                2. THREE CONNECTED STAGES (Responsive Editorial Track)
            ─────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 relative">

                {/* ═══════════════════════════════════════════════════════
                    STAGE 01 — CHOOSE
                ═══════════════════════════════════════════════════════ */}
                <div className="flex flex-col justify-between space-y-6 relative group">
                    <ScrollReveal delay={100} distance={22} duration={700}>
                        {/* Step Meta Header & Desktop Horizontal Connector */}
                        <div className="relative pb-2">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-brand/85 dark:text-brand">
                                    01
                                </span>
                                <span className="h-0.5 w-6 bg-brand/30 dark:bg-brand/30 rounded-full" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                                Choose
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1.5 pr-2">
                                Browse our services and find what you need. Everything is organized and easy to locate.
                            </p>

                            {/* Desktop Connector to Stage 02 */}
                            <div
                                aria-hidden="true"
                                className="hidden lg:flex items-center absolute -right-4 top-4 translate-x-1/2 z-20"
                            >
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-bg-surface border border-border-subtle shadow-xs flex items-center justify-center text-text-muted">
                                    <ArrowRight size={13} className="text-brand/80" />
                                </div>
                            </div>
                        </div>

                        {/* Realistic UI Visual 1: Catalogue Fragment */}
                        <div className="mt-4 rounded-2xl border border-border-subtle bg-white dark:bg-bg-surface shadow-[0_12px_32px_rgba(64,0,16,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_18px_40px_rgba(64,0,16,0.09)] hover:-translate-y-1">
                            <div className="grid grid-cols-12 min-h-[290px]">
                                
                                {/* Left Sidebar */}
                                <div className="col-span-5 border-r border-border-subtle/80 bg-slate-50/70 dark:bg-bg-base/60 p-3 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        {/* Brand Mini Header */}
                                        <div className="flex items-center gap-1.5 px-1 py-0.5">
                                            <div className="w-5 h-5 rounded-md bg-brand text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
                                                C
                                            </div>
                                            <span className="text-[11px] font-bold text-text-primary tracking-tight truncate">
                                                {brandName}
                                            </span>
                                        </div>

                                        {/* Sidebar Menu Items */}
                                        <div className="space-y-1 pt-0.5">
                                            {/* Active: Airtime & Data */}
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-brand text-white text-[10px] sm:text-[11px] font-semibold shadow-xs">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Radio size={12} className="shrink-0 opacity-90" />
                                                    <span className="truncate">Airtime & Data</span>
                                                </div>
                                                <ChevronRight size={10} className="shrink-0 opacity-75" />
                                            </div>

                                            {/* Verification */}
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary text-[10px] sm:text-[11px] font-medium transition-colors">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <ShieldCheck size={12} className="shrink-0 text-text-muted" />
                                                    <span className="truncate">Verification</span>
                                                </div>
                                            </div>

                                            {/* Social Tools */}
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary text-[10px] sm:text-[11px] font-medium transition-colors">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <TrendingUp size={12} className="shrink-0 text-text-muted" />
                                                    <span className="truncate">Social Tools</span>
                                                </div>
                                            </div>

                                            {/* eSIM & VPN */}
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary text-[10px] sm:text-[11px] font-medium transition-colors">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Globe size={12} className="shrink-0 text-text-muted" />
                                                    <span className="truncate">eSIM & VPN</span>
                                                </div>
                                            </div>

                                            {/* Other Services */}
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary text-[10px] sm:text-[11px] font-medium transition-colors">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <ShoppingBag size={12} className="shrink-0 text-text-muted" />
                                                    <span className="truncate">Other Services</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Catalogue List */}
                                <div className="col-span-7 p-3 flex flex-col justify-between space-y-2.5">
                                    {/* Search Input Mock */}
                                    <div className="relative">
                                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <div className="w-full bg-slate-100/90 dark:bg-bg-base/80 border border-border-subtle rounded-lg py-1 pl-6 pr-2 text-[10px] text-text-muted flex items-center">
                                            Search services...
                                        </div>
                                    </div>

                                    {/* Section Heading */}
                                    <div>
                                        <p className="text-[10px] font-bold text-text-primary tracking-tight mb-1.5">
                                            Popular Services
                                        </p>

                                        {/* Rows */}
                                        <div className="space-y-1.5">
                                            {/* Airtime */}
                                            <div className="flex items-center justify-between p-1.5 rounded-lg border border-border-subtle/70 bg-bg-surface hover:border-brand/40 transition-colors group/row">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                                        <Smartphone size={11} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-text-primary">Airtime</span>
                                                </div>
                                                <ChevronRight size={11} className="text-text-muted group-hover/row:text-brand transition-colors" />
                                            </div>

                                            {/* Data */}
                                            <div className="flex items-center justify-between p-1.5 rounded-lg border border-border-subtle/70 bg-bg-surface hover:border-brand/40 transition-colors group/row">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-info-bg text-info flex items-center justify-center shrink-0">
                                                        <Wifi size={11} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-text-primary">Data</span>
                                                </div>
                                                <ChevronRight size={11} className="text-text-muted group-hover/row:text-brand transition-colors" />
                                            </div>

                                            {/* Verification */}
                                            <div className="flex items-center justify-between p-1.5 rounded-lg border border-border-subtle/70 bg-bg-surface hover:border-brand/40 transition-colors group/row">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                                                        <Shield size={11} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-text-primary truncate">Verification Numbers</span>
                                                </div>
                                                <ChevronRight size={11} className="text-text-muted group-hover/row:text-brand transition-colors" />
                                            </div>

                                            {/* Social Media */}
                                            <div className="flex items-center justify-between p-1.5 rounded-lg border border-border-subtle/70 bg-bg-surface hover:border-brand/40 transition-colors group/row">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                        <TrendingUp size={11} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-text-primary">Social Media</span>
                                                </div>
                                                <ChevronRight size={11} className="text-text-muted group-hover/row:text-brand transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Mobile Progression Downward Arrow */}
                    <div
                        aria-hidden="true"
                        className="flex lg:hidden justify-center items-center py-2"
                    >
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-bg-surface border border-border-subtle shadow-xs flex items-center justify-center text-text-muted">
                            <ArrowDown size={13} className="text-brand/80" />
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    STAGE 02 — CONFIGURE
                ═══════════════════════════════════════════════════════ */}
                <div className="flex flex-col justify-between space-y-6 relative group">
                    <ScrollReveal delay={200} distance={22} duration={700}>
                        {/* Step Meta Header & Desktop Horizontal Connector */}
                        <div className="relative pb-2">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-brand/85 dark:text-brand">
                                    02
                                </span>
                                <span className="h-0.5 w-6 bg-brand/30 dark:bg-brand/30 rounded-full" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                                Configure
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1.5 pr-2">
                                Enter the details for your request. Confirm the information and proceed to payment.
                            </p>

                            {/* Desktop Connector to Stage 03 */}
                            <div
                                aria-hidden="true"
                                className="hidden lg:flex items-center absolute -right-4 top-4 translate-x-1/2 z-20"
                            >
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-bg-surface border border-border-subtle shadow-xs flex items-center justify-center text-text-muted">
                                    <ArrowRight size={13} className="text-brand/80" />
                                </div>
                            </div>
                        </div>

                        {/* Realistic UI Visual 2: Configuration Card + Layered Phone Peek */}
                        <div className="mt-4 relative min-h-[290px] flex items-center">
                            
                            {/* Layered Smartphone Peek Behind (Right side depth element) */}
                            <div
                                aria-hidden="true"
                                className="absolute right-0 top-1 bottom-1 w-28 sm:w-36 rounded-[22px] border-[3px] border-slate-800 bg-slate-900 shadow-xl overflow-hidden z-0 rotate-[3deg] translate-x-1 flex flex-col pointer-events-none"
                            >
                                {/* Mini Phone Notch & Header */}
                                <div className="w-10 h-2.5 bg-slate-800 rounded-full mx-auto mt-1 mb-2" />
                                
                                <div className="px-2 space-y-1.5 opacity-90">
                                    <div className="flex items-center justify-between text-[8px] text-slate-300 font-bold">
                                        <span>MTN</span>
                                        <span className="w-2 h-2 rounded-full bg-brand" />
                                    </div>
                                    <div className="bg-brand text-white text-[8px] font-bold py-0.5 px-2 rounded-full inline-block">
                                        10 GB
                                    </div>
                                    {/* Mock cellular option lines */}
                                    <div className="space-y-1 pt-1">
                                        <div className="h-2 rounded bg-slate-800 w-full" />
                                        <div className="h-2 rounded bg-slate-800/80 w-4/5" />
                                        <div className="h-2 rounded bg-slate-800/60 w-3/4" />
                                        <div className="h-2 rounded bg-slate-800/40 w-5/6" />
                                    </div>
                                </div>
                            </div>

                            {/* Front Realistic Configuration Card */}
                            <div className="relative z-10 w-[84%] sm:w-[86%] rounded-2xl border border-border-subtle bg-white dark:bg-bg-surface p-4 sm:p-4.5 shadow-[0_12px_32px_rgba(64,0,16,0.08)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(64,0,16,0.11)] hover:-translate-y-1">
                                {/* Service Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <Wifi size={14} />
                                    </div>
                                    <div className="leading-tight">
                                        <h4 className="text-xs font-bold text-text-primary">Mobile Data</h4>
                                        <p className="text-[10px] text-text-muted">Fast and reliable data for your device.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-2.5">
                                    {/* Network Field */}
                                    <div>
                                        <label className="text-[10px] font-bold text-text-secondary block mb-1">
                                            Network
                                        </label>
                                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border-subtle bg-slate-50/70 dark:bg-bg-base/70 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {/* Yellow MTN Badge Icon */}
                                                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[8px] flex items-center justify-center tracking-tighter">
                                                    MTN
                                                </span>
                                                <span className="text-[11px] font-semibold text-text-primary">MTN</span>
                                            </div>
                                            <ChevronDown size={12} className="text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Plan Field */}
                                    <div>
                                        <label className="text-[10px] font-bold text-text-secondary block mb-1">
                                            Plan
                                        </label>
                                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border-subtle bg-slate-50/70 dark:bg-bg-base/70 text-xs">
                                            <span className="text-[11px] font-semibold text-text-primary">10 GB · 30 Days</span>
                                            <ChevronDown size={12} className="text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Total Amount & Continue Button */}
                                    <div className="pt-1 space-y-2">
                                        <div>
                                            <span className="text-sm font-black text-text-primary">₦3,500</span>
                                            <span className="text-[9px] text-text-muted block">Total amount</span>
                                        </div>

                                        <button
                                            type="button"
                                            className="w-full bg-brand hover:bg-brand-hover text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight size={11} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </ScrollReveal>

                    {/* Mobile Progression Downward Arrow */}
                    <div
                        aria-hidden="true"
                        className="flex lg:hidden justify-center items-center py-2"
                    >
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-bg-surface border border-border-subtle shadow-xs flex items-center justify-center text-text-muted">
                            <ArrowDown size={13} className="text-brand/80" />
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    STAGE 03 — COMPLETE
                ═══════════════════════════════════════════════════════ */}
                <div className="flex flex-col justify-between space-y-6 relative group">
                    <ScrollReveal delay={300} distance={22} duration={700}>
                        {/* Step Meta Header */}
                        <div className="relative pb-2">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-brand/85 dark:text-brand">
                                    03
                                </span>
                                <span className="h-0.5 w-6 bg-brand/30 dark:bg-brand/30 rounded-full" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                                Complete
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1.5 pr-2">
                                Review your details, make payment and get your service. It's that simple.
                            </p>
                        </div>

                        {/* Realistic UI Visual 3: Receipt Confirmation Card + Paper Plane Accent */}
                        <div className="mt-4 relative min-h-[290px]">
                            
                            {/* Decorative Top-Right Flight Trail with Paper Plane */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-3 -right-2 sm:-top-4 sm:-right-3 z-20 pointer-events-none"
                            >
                                <div className="relative">
                                    {/* Curved SVG dashed trail */}
                                    <svg
                                        viewBox="0 0 60 50"
                                        fill="none"
                                        className="w-14 h-12 text-brand/40 overflow-visible"
                                    >
                                        <path
                                            d="M4 42C14 42 22 28 34 20C42 15 50 14 56 6"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeDasharray="3 4"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <Send
                                        size={14}
                                        className="absolute -top-1 -right-1 text-brand rotate-[15deg]"
                                    />
                                </div>
                            </div>

                            {/* Floating Receipt Card */}
                            <div className="relative z-10 rounded-2xl border border-border-subtle bg-white dark:bg-bg-surface p-4 sm:p-5 shadow-[0_12px_32px_rgba(64,0,16,0.06)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(64,0,16,0.09)] hover:-translate-y-1">
                                {/* Success Icon Badge */}
                                <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                                    <Check size={20} strokeWidth={2.8} />
                                </div>

                                {/* Confirmation Title */}
                                <div className="text-center mb-4">
                                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                                        Request Successful
                                    </h4>
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                        Your data purchase has been completed.
                                    </p>
                                </div>

                                {/* Order Key-Value Summary */}
                                <div className="border-t border-border-subtle/70 pt-2.5 space-y-2 text-[11px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted text-[10px]">Service</span>
                                        <span className="font-semibold text-text-primary">Mobile Data</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted text-[10px]">Network</span>
                                        <span className="font-semibold text-text-primary">MTN</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted text-[10px]">Plan</span>
                                        <span className="font-semibold text-text-primary">10 GB · 30 Days</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-subtle/40 pt-1.5">
                                        <span className="text-text-muted text-[10px]">Amount</span>
                                        <span className="font-black text-brand text-xs">₦3,500</span>
                                    </div>
                                </div>

                                {/* View Transaction Action */}
                                <div className="pt-3">
                                    <a
                                        href={authUser ? '/user/orders' : '/register'}
                                        className="w-full bg-brand-subtle hover:bg-brand-subtle dark:bg-brand-subtle dark:hover:bg-brand-subtle text-brand dark:text-brand-foreground font-semibold text-[11px] py-1.5 px-3 rounded-lg text-center block transition-colors"
                                    >
                                        View Transaction →
                                    </a>
                                </div>
                            </div>

                        </div>
                    </ScrollReveal>
                </div>

            </div>
        </section>
    );
};
