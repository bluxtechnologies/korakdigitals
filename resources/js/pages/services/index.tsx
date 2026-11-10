import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import {
    Search,
    X,
    ArrowRight,
    Smartphone,
    Globe,
    TrendingUp,
    Users,
    ShieldCheck,
    Lock,
    Cpu,
    FolderX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceItem {
    id: string;
    name: string;
    descDesktop: string;
    descMobile: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    category: 'mobile' | 'social' | 'more';
    isComingSoon?: boolean;
    keywords: string[];
}

interface ServiceSection {
    id: 'mobile' | 'social' | 'more';
    title: string;
    subtitle: string;
    services: ServiceItem[];
}

const ALL_SERVICES: ServiceItem[] = [
    // Mobile & Internet
    {
        id: 'airtime',
        name: 'Airtime',
        descDesktop: 'Buy airtime for any supported network.',
        descMobile: 'Buy airtime for any network.',
        href: '/user/services/airtime',
        icon: Smartphone,
        category: 'mobile',
        keywords: ['airtime', 'recharge', 'vtu', 'mtn', 'airtel', 'glo', '9mobile', 'phone', 'call', 'credit']
    },
    {
        id: 'data',
        name: 'Mobile Data',
        descDesktop: 'Browse available data plans for your number.',
        descMobile: 'Browse data plans for your number.',
        href: '/user/services/data',
        icon: Globe,
        category: 'mobile',
        keywords: ['data', 'internet', 'browsing', 'sme', 'mtn', 'airtel', 'glo', '9mobile', 'bundle', 'gigabytes', 'gb']
    },

    // Social & Digital
    {
        id: 'growth',
        name: 'Social Growth',
        descDesktop: 'Boost your social media presence.',
        descMobile: 'Boost your presence.',
        href: '/user/services/growth',
        icon: TrendingUp,
        category: 'social',
        keywords: ['social growth', 'followers', 'likes', 'views', 'instagram', 'tiktok', 'twitter', 'telegram', 'youtube', 'boost', 'smm']
    },
    {
        id: 'accounts',
        name: 'Social Accounts',
        descDesktop: 'Get verified and active social media accounts.',
        descMobile: 'Get verified accounts.',
        href: '/user/services/accounts',
        icon: Users,
        category: 'social',
        keywords: ['social accounts', 'aged', 'pva', 'instagram accounts', 'tiktok accounts', 'twitter accounts', 'telegram accounts', 'bm250', 'facebook']
    },
    {
        id: 'numbers',
        name: 'Rent Numbers',
        descDesktop: 'Rent numbers for multi-day extended access.',
        descMobile: 'Rent numbers.',
        href: '/user/numbers/rent',
        icon: Smartphone,
        category: 'social',
        keywords: ['virtual numbers', 'sms', 'verification', 'rent number', 'temp number', 'usa number', 'uk number', 'receive sms']
    },
    {
        id: 'verification',
        name: 'One-Time Verification',
        descDesktop: 'Get verification access instantly.',
        descMobile: 'Get verification access.',
        href: '/user/numbers',
        icon: ShieldCheck,
        category: 'social',
        keywords: ['verification', 'otp', 'code', 'whatsapp code', 'telegram code', 'google verification', 'activation']
    },

    // More Services
    {
        id: 'vpn',
        name: 'VPN',
        descDesktop: 'Secure your connection and browse freely.',
        descMobile: 'Secure your connection.',
        href: '/user/services/vpn',
        icon: Lock,
        category: 'more',
        isComingSoon: true,
        keywords: ['vpn', 'virtual private network', 'wireguard', 'privacy', 'security', 'ip address', 'unblock']
    },
    {
        id: 'esim',
        name: 'eSIM',
        descDesktop: 'Get mobile data without a physical SIM card.',
        descMobile: 'Get mobile data without a physical SIM.',
        href: '/user/services/esim',
        icon: Cpu,
        category: 'more',
        isComingSoon: true,
        keywords: ['esim', 'digital sim', 'travel data', 'international roaming', 'qr sim']
    }
];

const CATEGORY_TABS = [
    { id: 'all', label: 'All' },
    { id: 'mobile', label: 'Mobile & Internet' },
    { id: 'social', label: 'Social & Digital' },
    { id: 'more', label: 'More' },
] as const;

type CategoryTabId = (typeof CATEGORY_TABS)[number]['id'];

const SECTION_CONFIGS: Array<{ id: 'mobile' | 'social' | 'more'; title: string; subtitle: string }> = [
    { id: 'mobile', title: 'Mobile & Internet', subtitle: 'Stay connected, always.' },
    { id: 'social', title: 'Social & Digital', subtitle: 'Grow your presence and access more.' },
    { id: 'more', title: 'More Services', subtitle: 'Additional services to meet your needs.' },
];

export default function ServicesIndex() {
    const { props } = usePage<any>();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState<CategoryTabId>('all');

    // Filter services based on active search query and category tab
    const filteredSections: ServiceSection[] = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return SECTION_CONFIGS.map(sec => {
            // Check if section matches active category tab
            if (activeCategory !== 'all' && activeCategory !== sec.id) {
                return { ...sec, services: [] };
            }

            const matchingServices = ALL_SERVICES.filter(service => {
                if (service.category !== sec.id) return false;
                if (!query) return true;

                return (
                    service.name.toLowerCase().includes(query) ||
                    service.descDesktop.toLowerCase().includes(query) ||
                    service.descMobile.toLowerCase().includes(query) ||
                    service.keywords.some(k => k.toLowerCase().includes(query))
                );
            });

            return {
                ...sec,
                services: matchingServices
            };
        }).filter(sec => sec.services.length > 0);
    }, [searchQuery, activeCategory]);

    const totalMatchingServices = filteredSections.reduce((acc, sec) => acc + sec.services.length, 0);

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveCategory('all');
    };

    return (
        <>
            <Head title="Services Hub — Korak Digitals" />

            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 select-none pb-12">
                
                {/* 1. Content Header (Desktop: primary header; Mobile: content subtitle below topbar) */}
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text-primary tracking-tight">
                        Find what you need
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Buy airtime, data, social services, virtual numbers and more &mdash; all in one place.
                    </p>
                </div>

                {/* 2. Search Field */}
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a service..."
                        aria-label="Search for a service"
                        className="w-full bg-bg-surface border border-border-subtle rounded-xl pl-11 pr-10 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all shadow-2xs"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary rounded-full transition-colors cursor-pointer"
                            aria-label="Clear search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* 3. Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none -mx-1 px-1">
                    {CATEGORY_TABS.map(tab => {
                        const isSelected = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveCategory(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none",
                                    isSelected
                                        ? "bg-brand text-brand-foreground shadow-2xs"
                                        : "bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-bg-surface-hover"
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* 4. Service Sections or Empty State */}
                {totalMatchingServices === 0 ? (
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                        <div className="w-12 h-12 rounded-full bg-bg-surface-hover border border-border-subtle flex items-center justify-center text-text-muted">
                            <FolderX size={22} />
                        </div>
                        <h3 className="text-sm font-bold text-text-primary">
                            No services match &ldquo;{searchQuery}&rdquo;
                        </h3>
                        <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                            We couldn&apos;t find any digital services matching your search or category filter.
                        </p>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-2 px-4 py-2 bg-brand text-brand-foreground text-xs font-bold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer shadow-2xs"
                        >
                            Reset Search &amp; Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 sm:space-y-10">
                        {filteredSections.map(section => (
                            <section key={section.id} className="space-y-3 sm:space-y-4">
                                {/* Section Header */}
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                                        {section.title}
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                                        {section.subtitle}
                                    </p>
                                </div>

                                {/* Responsive Card Grid:
                                    - Mobile & Internet: 2 cols on mobile, 2 cols on desktop
                                    - Social & Digital: 2 cols on mobile, 4 cols on desktop
                                    - More Services: 2 cols on mobile, 2 cols on desktop
                                */}
                                <div className={cn(
                                    "grid grid-cols-2 gap-3 sm:gap-4",
                                    section.id === 'social' && "lg:grid-cols-4"
                                )}>
                                    {section.services.map(service => (
                                        <Link
                                            key={service.id}
                                            href={service.href}
                                            className={cn(
                                                "relative bg-bg-surface border border-border-subtle rounded-xl p-3.5 sm:p-5 flex flex-col justify-between group transition-all",
                                                service.isComingSoon
                                                    ? "opacity-95 hover:border-border-strong cursor-pointer"
                                                    : "hover:border-brand/40 hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
                                            )}
                                        >
                                            {/* Coming Soon Badge */}
                                            {service.isComingSoon && (
                                                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[9px] sm:text-[10px] font-bold text-text-muted bg-bg-surface-hover border border-border-subtle px-2 py-0.5 rounded-full">
                                                    Coming Soon
                                                </span>
                                            )}

                                            <div>
                                                {/* Icon container */}
                                                <div className={cn(
                                                    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mb-2.5 sm:mb-3.5 transition-colors",
                                                    service.isComingSoon
                                                        ? "bg-bg-surface-hover text-text-muted border border-border-subtle"
                                                        : "bg-brand-subtle text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                                                )}>
                                                    <service.icon size={18} className="stroke-[2.2px]" />
                                                </div>

                                                {/* Service Name */}
                                                <h3 className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-brand transition-colors">
                                                    {service.name}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-[11px] sm:text-xs text-text-secondary mt-1 leading-snug line-clamp-2">
                                                    <span className="hidden sm:inline">{service.descDesktop}</span>
                                                    <span className="sm:hidden">{service.descMobile}</span>
                                                </p>
                                            </div>

                                            {/* Action Arrow */}
                                            <div className="flex justify-end items-center mt-3 sm:mt-4 pt-1">
                                                <div className={cn(
                                                    "transition-transform group-hover:translate-x-1",
                                                    service.isComingSoon ? "text-text-muted" : "text-brand"
                                                )}>
                                                    <ArrowRight size={14} className="stroke-[2.5px]" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* 5. Reassurance / Trust Banner */}
                <div className="bg-brand-subtle/70 border border-brand/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden select-none">
                    <div className="flex items-center gap-3.5 z-10">
                        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} className="stroke-[2.2px]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                                Safe. Reliable. Always.
                            </h4>
                            <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                                Your security and satisfaction are our top priority.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 z-10 self-end sm:self-auto">
                        <Link
                            href="/user/support"
                            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 group py-1"
                        >
                            <span>Learn more</span>
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {/* Subtle shield watermark in background */}
                    <div className="absolute -right-3 -bottom-3 sm:right-2 sm:-bottom-4 opacity-[0.07] pointer-events-none">
                        <ShieldCheck size={95} className="text-brand" />
                    </div>
                </div>

            </div>
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppShell title="Services">
        {page}
    </AppShell>
);
