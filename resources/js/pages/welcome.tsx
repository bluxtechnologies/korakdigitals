import * as React from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, usePage } from '@inertiajs/react';
import { ThemeProvider, useTheme } from '@/components/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { GlobalAccessSection } from '@/components/landing/GlobalAccessSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
    Wifi,
    Phone,
    TrendingUp,
    ShieldCheck,
    Globe,
    Wallet,
    CheckCircle2,
    ArrowRight,
    Lock,
    Zap,
    Clock,
    Sparkles,
    ChevronRight,
    Menu,
    X,
    Sun,
    Moon,
    Monitor,
    Shield,
    Plus,
    Eye,
    Search
} from 'lucide-react';

interface ServiceItem {
    id: number;
    name: string;
    code: string;
    category: string;
    description?: string;
    is_active: boolean;
    metadata?: any;
}

interface PlatformSettings {
    site_name: string;
    site_tagline: string;
    site_description: string;
    site_email: string;
    site_phone: string;
    social_links?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        github?: string;
        [key: string]: string | undefined;
    };
}

interface PlatformMetrics {
    totalUsers: number;
    totalOrders: number;
    countriesSupported: number;
    uptimePercent: string;
    avgFulfillmentSeconds: number;
}

interface AnnouncementItem {
    id: number;
    title: string;
    body: string;
    type: string;
    created_at: string;
}

interface WelcomeProps {
    services?: ServiceItem[];
    settings?: PlatformSettings;
    metrics?: PlatformMetrics;
    announcement?: AnnouncementItem | null;
}

function LandingPageContent({ services = [], settings, metrics, announcement }: WelcomeProps) {
    const { props } = usePage<any>();
    const authUser = props.auth?.user;
    const { appearance, setAppearance } = useTheme();

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = React.useState(false);
    const [balanceVisible, setBalanceVisible] = React.useState(true);
    const [scrolled, setScrolled] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [pageLoaded, setPageLoaded] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => setPageLoaded(true), 30);
        return () => clearTimeout(timer);
    }, []);

    // Scroll listener for sticky header behavior
    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mobile menu overflow lock and escape listener
    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setMobileMenuOpen(false);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileMenuOpen]);

    const brandName = 'Korak Digitals';
    const siteTagline = settings?.site_tagline || 'Global Digital Services Platform';

    const cycleTheme = () => {
        if (appearance === 'light') setAppearance('dark');
        else if (appearance === 'dark') setAppearance('system');
        else setAppearance('light');
    };

    const ThemeIcon = appearance === 'light' ? Sun : appearance === 'dark' ? Moon : Monitor;

    return (
        <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans transition-colors duration-200">

            {/* Optional Active System Announcement Banner */}
            {announcement && (
                <div className="bg-brand text-brand-foreground px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 select-none shadow-xs">
                    <Sparkles size={14} className="shrink-0" />
                    <span>
                        <strong>{announcement.title}:</strong> {announcement.body}
                    </span>
                </div>
            )}

            {/* Navigation Header */}
            <header
                className={`sticky top-0 z-50 transition-all duration-200 select-none ${
                    scrolled
                        ? 'bg-white/98 dark:bg-bg-surface/98 backdrop-blur-md border-b border-border-subtle shadow-xs'
                        : 'bg-white dark:bg-bg-surface border-b border-border-subtle/80'
                }`}
            >
                <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between">
                    
                    {/* LEFT: [ K LOGO ] Korak Digitals */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1 -ml-1 transition-colors"
                    >
                        <div className="w-8.5 h-8.5 rounded-lg bg-brand text-brand-foreground flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-102 transition-transform">
                            <span className="tracking-tighter font-black">K</span>
                        </div>
                        <span className="text-[17px] sm:text-[18px] font-bold tracking-tight text-text-primary leading-none">
                            {brandName}
                        </span>
                    </Link>

                    {/* CENTER: Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-medium text-text-secondary">
                        <a
                            href="#features"
                            className="hover:text-brand transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md px-1"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="hover:text-brand transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md px-1"
                        >
                            How It Works
                        </a>
                        <a
                            href="#platform"
                            className="hover:text-brand transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md px-1"
                        >
                            Platform
                        </a>
                    </nav>

                    {/* RIGHT: Search icon + Theme switch + Primary CTA */}
                    <div className="hidden sm:flex items-center gap-3">
                        {/* Search Icon */}
                        <a
                            href="#how-it-works"
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            title="Search services"
                            aria-label="Search services"
                        >
                            <Search size={18} />
                        </a>

                        {/* Theme Switcher Button */}
                        <button
                            type="button"
                            onClick={cycleTheme}
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            title={`Theme: ${appearance}`}
                            aria-label="Toggle theme mode"
                        >
                            <ThemeIcon size={17} />
                        </button>

                        {/* Primary CTA: Exactly "Get Started Free" for both states */}
                        <Link
                            href={authUser ? '/user/dashboard' : '/register'}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-xl"
                        >
                            <Button
                                size="sm"
                                className="bg-brand hover:bg-brand-hover active:scale-[0.96] text-brand-foreground font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors duration-150"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight size={15} />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Controls (Theme + Hamburger Button) */}
                    <div className="flex items-center gap-1 lg:hidden">
                        <button
                            type="button"
                            onClick={cycleTheme}
                            className="p-2.5 text-text-secondary hover:bg-bg-surface-hover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            aria-label="Toggle theme"
                        >
                            <ThemeIcon size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            aria-label="Open navigation menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-navigation-menu"
                        >
                            <Menu size={22} />
                        </button>
                    </div>

                </div>
            </header>

            {/* Mobile Navigation Drawer Overlay (Portaled to document.body to prevent containing block trapping from backdrop-filter) */}
            {mounted && mobileMenuOpen && createPortal(
                <div className="lg:hidden fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <div
                        id="mobile-navigation-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile Navigation"
                        className="fixed inset-y-0 right-0 z-[101] w-full sm:max-w-sm bg-white dark:bg-bg-surface shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
                    >
                        {/* Drawer Header */}
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8.5 h-8.5 rounded-lg bg-brand text-brand-foreground flex items-center justify-center font-bold text-base shadow-xs">
                                        <span className="font-black">C</span>
                                    </div>
                                    <span className="text-base font-bold text-text-primary tracking-tight">
                                        {brandName}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                    aria-label="Close navigation menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Navigation Items with chevrons */}
                            <nav className="mt-4 flex flex-col divide-y divide-border-subtle/60">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-4 flex items-center justify-between text-base font-medium text-text-primary hover:text-brand transition-colors"
                                >
                                    <span>Features</span>
                                    <ChevronRight size={16} className="text-text-muted" />
                                </a>
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-4 flex items-center justify-between text-base font-medium text-text-primary hover:text-brand transition-colors"
                                >
                                    <span>How It Works</span>
                                    <ChevronRight size={16} className="text-text-muted" />
                                </a>
                                <a
                                    href="#platform"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-4 flex items-center justify-between text-base font-medium text-text-primary hover:text-brand transition-colors"
                                >
                                    <span>Platform</span>
                                    <ChevronRight size={16} className="text-text-muted" />
                                </a>
                            </nav>
                        </div>

                        {/* Drawer Footer CTA */}
                        <div className="mt-8 pt-4 border-t border-border-subtle">
                            <Link
                                href={authUser ? '/user/dashboard' : '/register'}
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl"
                            >
                                <Button
                                    size="lg"
                                    className="w-full bg-brand hover:bg-brand-hover text-brand-foreground py-3.5 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.96]"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ───────────────────────────────────────────────────────────
                SECTION 01: HERO (Reference Mockup + Pattern & Ambient Glow)
            ─────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-bg-base border-b border-border-subtle pt-8 sm:pt-12 lg:pt-14 pb-14 sm:pb-20 lg:pb-24 px-4 sm:px-8">
                
                {/* ── Background Grid Pattern & Ambient Glows (Cheta Reference) ── */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                    
                    {/* Architectural Square Grid Pattern with Soft Radial Vignette Mask */}
                    <div 
                        className="absolute inset-0 opacity-[0.55] dark:opacity-[0.22]"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, var(--border-strong) 1px, transparent 1px),
                                linear-gradient(to bottom, var(--border-strong) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 35%, #000 35%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 35%, #000 35%, transparent 100%)',
                        }}
                    />

                    {/* Ambient Glow 1: Wide diffuse glow centered on upper hero */}
                    <div 
                        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[550px] rounded-full blur-[130px] pointer-events-none opacity-40 dark:opacity-25"
                        style={{
                            background: 'radial-gradient(circle, rgba(128, 0, 32, 0.22) 0%, rgba(201, 74, 110, 0.10) 40%, transparent 70%)',
                        }}
                    />

                    {/* Ambient Glow 2: Luminous Halo behind Right Visual (Cheta Mockup Glow) */}
                    <div 
                        className="absolute top-1/4 right-[2%] lg:right-[8%] w-[500px] sm:w-[620px] h-[500px] sm:h-[620px] rounded-full blur-[110px] pointer-events-none opacity-55 dark:opacity-35"
                        style={{
                            background: 'radial-gradient(circle, rgba(128, 0, 32, 0.28) 0%, rgba(201, 74, 110, 0.14) 40%, rgba(248, 233, 237, 0.06) 60%, transparent 75%)',
                        }}
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                        
                        {/* Left Narrative Column */}
                        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
                            
                            {/* Eyebrow Label */}
                            <span
                                className="text-[11px] sm:text-xs font-bold text-brand uppercase tracking-wider mb-3.5 block select-none transition-all duration-500"
                                style={{
                                    opacity: pageLoaded ? 1 : 0,
                                    transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    transitionDelay: '60ms',
                                }}
                            >
                                GLOBAL DIGITAL SERVICES PLATFORM
                            </span>

                            {/* Main Headline */}
                            <h1
                                className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] font-bold text-text-primary tracking-tight leading-[1.12] transition-all duration-600 [text-wrap:balance]"
                                style={{
                                    opacity: pageLoaded ? 1 : 0,
                                    transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    transitionDelay: '140ms',
                                }}
                            >
                                Access the digital<br />
                                services you need,<br />
                                from{' '}
                                <span className="relative inline-block text-brand">
                                    one place.
                                    {/* Burgundy brush flourish underline */}
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full overflow-visible pointer-events-none text-brand"
                                        height="12"
                                        viewBox="0 0 160 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 8.5C45 3 115 3.5 157 7.5"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </h1>

                            {/* Supporting Narrative */}
                            <p
                                className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg mt-5 transition-all duration-600"
                                style={{
                                    opacity: pageLoaded ? 1 : 0,
                                    transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    transitionDelay: '220ms',
                                }}
                            >
                                Airtime, data, social media, verification numbers, eSIMs, and more — all in one secure and easy-to-use platform.
                            </p>

                            {/* Action Buttons with tactile active states */}
                            <div
                                className="flex flex-wrap items-center gap-3.5 mt-8 transition-all duration-600"
                                style={{
                                    opacity: pageLoaded ? 1 : 0,
                                    transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    transitionDelay: '300ms',
                                }}
                            >
                                <Link href={authUser ? '/user/dashboard' : '/register'}>
                                    <Button
                                        size="lg"
                                        className="bg-brand hover:bg-brand-hover active:scale-[0.96] text-brand-foreground font-semibold text-sm px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 group transition-colors duration-200"
                                    >
                                        <span>Get Started Free</span>
                                        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                                    </Button>
                                </Link>

                                <a href="#features">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="bg-white/90 dark:bg-bg-surface/90 hover:bg-neutral-50 dark:hover:bg-bg-surface-hover active:scale-[0.96] text-text-primary border-border-subtle font-semibold text-sm px-6 py-3 rounded-xl shadow-2xs backdrop-blur-xs transition-colors duration-200"
                                    >
                                        Explore Features
                                    </Button>
                                </a>
                            </div>

                            {/* Trust Features Strip */}
                            <div
                                className="flex flex-wrap items-center gap-6 sm:gap-8 mt-10 pt-2 text-xs font-semibold text-text-muted select-none transition-all duration-600"
                                style={{
                                    opacity: pageLoaded ? 1 : 0,
                                    transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    transitionDelay: '380ms',
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-brand shrink-0" />
                                    <span className="text-text-primary">Secure & Reliable</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe size={18} className="text-brand shrink-0" />
                                    <span className="text-text-primary">Global Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap size={18} className="text-brand shrink-0" />
                                    <span className="text-text-primary">24/7 Support</span>
                                </div>
                            </div>

                        </div>

                        {/* Right Visual Column (Lifestyle Photo + Floating Wallet Card) */}
                        <div
                            className="lg:col-span-6 xl:col-span-6 relative mt-4 lg:mt-0 transition-all duration-700"
                            style={{
                                opacity: pageLoaded ? 1 : 0,
                                transform: pageLoaded ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
                                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                transitionDelay: '260ms',
                            }}
                        >
                            
                            {/* Localized Radiant Backlight Halo behind the photo */}
                            <div 
                                className="absolute -inset-2 sm:-inset-4 bg-gradient-to-tr from-brand/35 via-rose-500/20 to-rose-200/15 dark:to-transparent rounded-[2.5rem] blur-2xl opacity-75 dark:opacity-45 -z-10"
                                aria-hidden="true"
                            />

                            {/* Main Lifestyle Photograph Container */}
                            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border-subtle bg-bg-surface shadow-[0_16px_40px_rgba(64,0,16,0.08)]">
                                <img
                                    src="/images/hero-woman.jpg"
                                    alt="Smiling professional using digital services"
                                    className="w-full h-[360px] sm:h-[450px] lg:h-[480px] xl:h-[500px] object-cover object-[center_20%]"
                                    loading="eager"
                                />

                                {/* Script Handwriting Overlay in Top-Right */}
                                <div className="absolute top-5 right-5 sm:top-6 sm:right-7 select-none pointer-events-none text-right z-10 hidden sm:block">
                                    <div
                                        className="text-white font-bold text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-tight tracking-wide"
                                        style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                                    >
                                        More freedom.<br />
                                        More possibilities.
                                    </div>
                                    <svg className="w-24 ml-auto mt-1 overflow-visible text-brand" height="12" viewBox="0 0 100 12" fill="none">
                                        <path d="M4 6C30 11 70 12 96 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Floating Wallet Balance & Quick-Action Card with Enhanced Elevation */}
                            <div className="relative -mt-[180px] sm:-mt-[225px] lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:-left-12 xl:-left-16 z-30 w-[calc(100%-24px)] max-w-[340px] mx-auto sm:w-[280px] md:w-[290px] lg:w-[280px] xl:w-[290px] lg:mx-0 bg-white/95 dark:bg-bg-surface/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-[0_20px_50px_rgba(64,0,16,0.12),0_4px_16px_rgba(128,0,32,0.08)] p-4 sm:p-5 transition-transform hover:scale-[1.01]">
                                
                                {/* Wallet Header */}
                                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-border-subtle/80">
                                    <div>
                                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                                            Wallet Balance
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xl font-black font-mono tabular-nums text-text-primary tracking-tight">
                                                {balanceVisible ? '$24.50' : '••••••'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setBalanceVisible(!balanceVisible)}
                                                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-0.5"
                                                title={balanceVisible ? 'Hide Balance' : 'Show Balance'}
                                                aria-label="Toggle balance visibility"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </div>
                                    </div>
                                    <Link
                                        href={authUser ? '/user/wallet/fund' : '/login'}
                                        className="w-7 h-7 rounded-full bg-brand text-brand-foreground flex items-center justify-center hover:bg-brand-hover transition-colors shadow-xs"
                                        title="Fund Wallet"
                                        aria-label="Fund Wallet"
                                    >
                                        <Plus size={15} strokeWidth={2.5} />
                                    </Link>
                                </div>

                                {/* Quick Service Links List */}
                                <div className="space-y-1">
                                    
                                    {/* Airtime */}
                                    <Link
                                        href={authUser ? '/user/services/airtime' : '/login'}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-bg-surface-hover transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                                <Phone size={15} strokeWidth={2.2} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-text-primary leading-tight group-hover:text-brand transition-colors">
                                                    Airtime
                                                </span>
                                                <span className="text-[10px] text-text-muted leading-tight">
                                                    Top up instantly
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-0.5 group-hover:text-text-primary transition-all shrink-0" />
                                    </Link>

                                    {/* Data */}
                                    <Link
                                        href={authUser ? '/user/services/data' : '/login'}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-bg-surface-hover transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-info-bg text-info flex items-center justify-center shrink-0">
                                                <Wifi size={15} strokeWidth={2.2} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-text-primary leading-tight group-hover:text-info transition-colors">
                                                    Data
                                                </span>
                                                <span className="text-[10px] text-text-muted leading-tight">
                                                    Stay connected
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-0.5 group-hover:text-text-primary transition-all shrink-0" />
                                    </Link>

                                    {/* Global eSIM (Coming Soon) */}
                                    <Link
                                        href={authUser ? '/user/services/esim' : '/login'}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-bg-surface-hover transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                                <Globe size={15} strokeWidth={2.2} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-text-primary leading-tight group-hover:text-brand transition-colors">
                                                        Global eSIM
                                                    </span>
                                                    <span className="text-[9px] font-bold text-brand bg-brand-subtle px-1.5 py-0.2 rounded-full border border-brand/20">
                                                        Soon
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-text-muted leading-tight">
                                                    International roaming
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-0.5 group-hover:text-text-primary transition-all shrink-0" />
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* ───────────────────────────────────────────────────────────
                SECTION: FEATURES (6-Card Product Capabilities Showcase)
            ─────────────────────────────────────────────────────────── */}
            <FeaturesSection authUser={authUser} />

            {/* ───────────────────────────────────────────────────────────
                SECTION: GLOBAL ACCESS / CONNECTIVITY
            ─────────────────────────────────────────────────────────── */}
            <GlobalAccessSection authUser={authUser} brandName={brandName} />

            {/* ───────────────────────────────────────────────────────────
                SECTION: HOW IT WORKS (Connected 3-Stage Process)
            ─────────────────────────────────────────────────────────── */}
            <HowItWorksSection authUser={authUser} brandName={brandName} />

            {/* ───────────────────────────────────────────────────────────
                SECTION: PLATFORM SHOWCASE (2-Column Editorial Split)
            ─────────────────────────────────────────────────────────── */}
            <PlatformSection authUser={authUser} brandName={brandName} />

            {/* ───────────────────────────────────────────────────────────
                SECTION 07: TRUST & FINAL CONVERSION CTA
            ─────────────────────────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-4 sm:px-8 border-t border-border-subtle bg-bg-surface select-none relative overflow-hidden">
                <ScrollReveal distance={20} duration={650}>
                    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                        
                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-text-secondary">
                            <span className="flex items-center gap-1.5 bg-bg-base border border-border-subtle px-3 py-1.5 rounded-full">
                                <ShieldCheck size={15} className="text-brand" />
                                <span>100% Automated Refund Policy</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-bg-base border border-border-subtle px-3 py-1.5 rounded-full">
                                <Lock size={14} className="text-brand" />
                                <span>Bank-grade 256-bit Encryption</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-bg-base border border-border-subtle px-3 py-1.5 rounded-full">
                                <Zap size={14} className="text-brand" />
                                <span>Sub-second Dispatch API</span>
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
                            Your digital world, simplified into one workspace.
                        </h2>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
                            Join digital marketers, businesses, and creators using {brandName} for instant telecom recharges, international virtual numbers, and secure digital tools.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            <Link href={authUser ? '/user/dashboard' : '/register'} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto font-black text-sm shadow-md px-8 py-3.5 active:scale-[0.96] transition-colors duration-150">
                                    {authUser ? 'Return to Workspace' : 'Create Free Account Now'} &rarr;
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold text-sm px-6 active:scale-[0.96] transition-colors duration-150">
                                    Sign In to Account
                                </Button>
                            </Link>
                        </div>

                        <div className="text-[11px] text-text-muted">
                            No setup fees • Instant account activation • Cancel or withdraw anytime
                        </div>

                    </div>
                </ScrollReveal>
            </section>

            {/* ───────────────────────────────────────────────────────────
                FOOTER: Structured Multi-column
            ─────────────────────────────────────────────────────────── */}
            <footer className="bg-bg-base border-t border-border-subtle px-6 sm:px-10 py-12 sm:py-16 text-xs text-text-secondary select-none">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
                    
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm">
                                K
                            </div>
                            <span className="text-base font-black text-text-primary tracking-tight">
                                {brandName}
                            </span>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                            {settings?.site_description || 'Global digital services platform for mobile airtime, telecom data, virtual verification numbers, digital accounts, and secure VPN connectivity.'}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span>All Platform Fulfillment Systems Operational</span>
                        </div>
                    </div>

                    {/* Column: Services */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Services
                        </h4>
                        <ul className="space-y-2 text-text-muted font-medium">
                            <li><Link href={authUser ? '/user/services/data' : '/register'} className="hover:text-brand transition-colors">Mobile Data</Link></li>
                            <li><Link href={authUser ? '/user/services/airtime' : '/register'} className="hover:text-brand transition-colors">Airtime Top-ups</Link></li>
                            <li><Link href={authUser ? '/user/services/esim' : '/register'} className="hover:text-brand transition-colors flex items-center gap-1.5"><span>Global eSIM</span><span className="text-[9px] font-bold bg-brand-subtle text-brand px-1.5 py-0.2 rounded-full border border-brand/20">Soon</span></Link></li>
                            <li><Link href={authUser ? '/user/services' : '/register'} className="hover:text-brand transition-colors">All Services Catalog</Link></li>
                        </ul>
                    </div>

                    {/* Column: Platform & Company */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Platform
                        </h4>
                        <ul className="space-y-2 text-text-muted font-medium">
                            <li><a href="#features" className="hover:text-brand transition-colors">Features</a></li>
                            <li><a href="#how-it-works" className="hover:text-brand transition-colors">How It Works</a></li>
                            <li><a href="#platform" className="hover:text-brand transition-colors">Platform</a></li>
                            <li><Link href="/login" className="hover:text-brand transition-colors">Customer Login</Link></li>
                            <li><Link href="/register" className="hover:text-brand transition-colors">Registration</Link></li>
                            <li><Link href="/user/support" className="hover:text-brand transition-colors">Help Desk</Link></li>
                        </ul>
                    </div>

                    {/* Column: Contact & Support */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Support & Contact
                        </h4>
                        <div className="space-y-2 text-text-muted font-medium">
                            <div>Email: <a href={`mailto:${settings?.site_email || 'support@korakdigital.com'}`} className="text-text-primary hover:underline">{settings?.site_email || 'support@korakdigital.com'}</a></div>
                            <div>Phone: <span className="text-text-primary font-mono">{settings?.site_phone || '+1 (800) 555-KORAK'}</span></div>
                            <div className="text-[11px] text-text-muted pt-2">
                                Hours: 24/7 Automated Processing • Active Human Support
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Legal & Theme Strip */}
                <div className="max-w-7xl mx-auto pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
                    <div>
                        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Refund Guarantee</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default function Welcome(props: WelcomeProps) {
    const siteTitle = props.settings?.site_name ? `${props.settings.site_name} — Digital Services Platform` : 'Korak Digitals — Global Digital Services & Access Platform';

    return (
        <ThemeProvider>
            <Head title={siteTitle} />
            <LandingPageContent {...props} />
        </ThemeProvider>
    );
}

