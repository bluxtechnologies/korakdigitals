import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { ToastProvider, useToast } from '../ui/Toast';
import { MockStoreProvider } from '../../mock/store';
import {
    Home,
    Smartphone,
    Wifi,
    Phone,
    TrendingUp,
    ShoppingBag,
    ShieldCheck,
    Globe,
    Wallet,
    Receipt,
    Bell,
    Settings,
    Headphones,
    Search,
    ChevronDown,
    Sun,
    Moon,
    Monitor,
    LogOut,
    MoreHorizontal,
    Layers,
    ArrowLeft,
    LayoutGrid,
    Clock
} from 'lucide-react';
import { CookieConsent } from '../ui/CookieConsent';
import { UtmTracker } from '../ui/UtmTracker';
import { BrandLogo } from '@/components/common/BrandLogo';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    badge?: string;
}

const OVERVIEW_NAV: NavItem[] = [
    { name: 'Home', href: '/user/dashboard', icon: Home },
    { name: 'Services', href: '/user/services', icon: LayoutGrid }
];

const SERVICES_NAV: NavItem[] = [
    { name: 'Mobile Data', href: '/user/services/data', icon: Wifi, badge: 'Active' },
    { name: 'Airtime', href: '/user/services/airtime', icon: Phone, badge: 'Active' },
    { name: 'Global eSIM', href: '/user/services/esim', icon: Globe, badge: 'Soon' },
    { name: 'Numbers (OTP)', href: '/user/numbers', icon: Smartphone, badge: 'Paused' },
    { name: 'Rent Numbers', href: '/user/numbers/rent', icon: Clock, badge: 'Paused' },
    { name: 'Social Growth', href: '/user/services/growth', icon: TrendingUp, badge: 'Paused' },
    { name: 'Social Accounts', href: '/user/services/accounts', icon: ShoppingBag, badge: 'Paused' },
    { name: 'VPN', href: '/user/services/vpn', icon: ShieldCheck, badge: 'Paused' },
];

const ACCOUNT_NAV: NavItem[] = [
    { name: 'Transactions', href: '/user/wallet/history', icon: Receipt },
    { name: 'Wallet', href: '/user/wallet', icon: Wallet },
    { name: 'Support', href: '/user/support', icon: Headphones },
    { name: 'Settings', href: '/user/settings', icon: Settings },
];

const AppLayoutInner: React.FC<{ children: React.ReactNode; title?: string; backUrl?: string }> = ({ children, title: customTitle, backUrl: customBackUrl }) => {
    const { url, props } = usePage<any>();
    const authUser = props.auth?.user || { name: 'Customer', email: '' };
    const authAccount = props.auth?.account || { available_balance: 0 };
    const userCurrencyId = Number(authUser.user_currency_id || props.auth?.currency?.id || props.stats?.currencyId || 1);
    const authCurrency = props.auth?.currency || props.stats?.currency || (props.currencies?.find((c: any) => Number(c.id) === userCurrencyId)) || (userCurrencyId === 1 ? { code: 'USD', symbol: '$' } : { code: 'NGN', symbol: '₦' });

    const { appearance, setAppearance } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [showThemeMenu, setShowThemeMenu] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    const unreadCount = props.auth?.unread_notifications_count || 0;

    const isActive = (href: string) => {
        if (href === '/user/dashboard') return url === '/user/dashboard' || url === '/';
        if (href === '/user/services') return url === '/user/services' || url === '/services';
        return url.startsWith(href);
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setAppearance(newTheme);
        setShowThemeMenu(false);
    };

    const getThemeLabel = () => {
        if (appearance === 'light') return 'Light';
        if (appearance === 'dark') return 'Dark';
        return 'System';
    };

    const getPageTitle = (path: string) => {
        if (customTitle) return customTitle;
        if (props.title) return props.title;
        if (props.pageTitle) return props.pageTitle;
        if (props.headerTitle) return props.headerTitle;

        if (path === '/user/dashboard' || path === '/') return 'Dashboard';
        if (path === '/user/services' || path === '/services') return 'Services';
        if (path === '/user/numbers') return 'Virtual Numbers';
        if (path === '/user/numbers/rent') return 'Rent Numbers';
        if (path === '/user/wallet/fund') return 'Fund Wallet';
        if (path === '/user/wallet/history') return 'Transaction History';
        if (path === '/user/wallet') return 'Wallet';
        if (path === '/user/orders') return 'Orders';
        if (path === '/user/notifications') return 'Notifications';
        if (path === '/user/support') return 'Support';
        if (path.startsWith('/user/support/')) return 'Support Ticket';
        if (path === '/user/developer') return 'Developer API Keys';
        if (path === '/user/settings') return 'Settings';
        if (path.startsWith('/user/settings/')) return 'Settings';
        if (path === '/user/services/data') return 'Mobile Data';
        if (path === '/user/services/airtime') return 'Airtime';
        if (path === '/user/services/growth') return 'Social Growth';
        if (path === '/user/services/accounts') return 'Social Accounts';
        if (path === '/user/services/vpn') return 'Secure VPN';
        if (path === '/user/services/esim') return 'eSIM';

        return 'Korak Digitals';
    };

    const handleDynamicBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (customBackUrl) {
            router.visit(customBackUrl);
            return;
        }
        if (url === '/user/services' || url === '/services') {
            router.visit('/user/dashboard');
            return;
        }
        if (url.startsWith('/user/services/')) {
            router.visit('/user/services');
            return;
        }
        if (url.startsWith('/user/settings/')) {
            router.visit('/user/settings');
            return;
        }
        if (url.startsWith('/user/wallet/')) {
            router.visit('/user/wallet');
            return;
        }
        if (url.startsWith('/user/support/')) {
            router.visit('/user/support');
            return;
        }
        if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
            window.history.back();
            return;
        }
        router.visit('/user/dashboard');
    };

    const isDashboard = url === '/user/dashboard' || url === '/';

    const allServices = [
        { name: 'Mobile Data', desc: 'Affordable SME & Direct data', href: '/user/services/data', icon: Wifi },
        { name: 'Airtime', desc: 'Buy airtime for all networks', href: '/user/services/airtime', icon: Phone },
        { name: 'Global eSIM', desc: 'International data roaming (Coming Soon)', href: '/user/services/esim', icon: Globe },
        { name: 'Virtual Numbers', desc: 'SMS verification numbers (Paused)', href: '/user/numbers', icon: Smartphone },
        { name: 'Social Growth', desc: 'Followers, likes, boosting (Paused)', href: '/user/services/growth', icon: TrendingUp },
        { name: 'Social Accounts', desc: 'Verified social accounts (Paused)', href: '/user/services/accounts', icon: ShoppingBag },
        { name: 'Secure VPN', desc: 'Fast, secure private browsing (Paused)', href: '/user/services/vpn', icon: ShieldCheck },
    ];

    const filteredServices = searchQuery.trim()
        ? allServices.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-bg-base text-text-primary antialiased font-sans">
            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-bg-surface border-r border-border-subtle shrink-0 sticky top-0 h-screen select-none z-30">
                {/* Brand Logo matching new Burgundy Design */}
                <div className="px-6 py-5 border-b border-border-subtle flex items-center">
                    <BrandLogo href="/user/dashboard" size="md" showSubtitle subtitleText="Digital Solutions" />
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    {/* Overview Group */}
                    <div>
                        <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Overview</div>
                        <ul className="space-y-1">
                            {OVERVIEW_NAV.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                                            isActive(item.href)
                                                ? "bg-brand-subtle text-brand"
                                                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                                        )}
                                    >
                                        <item.icon className="shrink-0" size={17} />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Group */}
                    <div>
                        <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Services</div>
                        <ul className="space-y-1">
                            {SERVICES_NAV.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                                            isActive(item.href)
                                                ? "bg-brand-subtle text-brand"
                                                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <item.icon className="shrink-0" size={17} />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                                                item.badge === 'Active'
                                                    ? "bg-success-bg text-success"
                                                    : item.badge === 'Soon'
                                                    ? "bg-brand-subtle text-brand border border-brand/20"
                                                    : "bg-bg-base text-text-muted border border-border-subtle"
                                            )}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account Group */}
                    <div>
                        <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Account</div>
                        <ul className="space-y-1">
                            {ACCOUNT_NAV.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                                            isActive(item.href)
                                                ? "bg-brand-subtle text-brand"
                                                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                                        )}
                                    >
                                        <item.icon className="shrink-0" size={17} />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Trust & Reliability Card (from Mockup) */}
                    <div className="p-3.5 rounded-lg bg-brand-subtle/70 border border-brand/20 flex flex-col gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-text-primary">Secure &amp; Reliable</div>
                            <p className="text-[11px] text-text-secondary leading-snug mt-0.5">
                                Your transactions are always protected with Korak.
                            </p>
                        </div>
                    </div>
                </nav>

                {/* Sidebar Bottom / Theme Selector */}
                <div className="p-4 border-t border-border-subtle relative">
                    <button
                        type="button"
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        aria-haspopup="menu"
                        aria-expanded={showThemeMenu}
                        aria-label="Select interface theme"
                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-text-secondary hover:bg-bg-surface-hover rounded-md transition-colors border border-border-subtle cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            {appearance === 'light' ? (
                                <Sun size={15} className="text-warning" aria-hidden="true" />
                            ) : appearance === 'dark' ? (
                                <Moon size={15} className="text-brand" aria-hidden="true" />
                            ) : (
                                <Monitor size={15} className="text-text-secondary" aria-hidden="true" />
                            )}
                            <span>Theme: {getThemeLabel()}</span>
                        </div>
                        <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-150", showThemeMenu && "rotate-180")} aria-hidden="true" />
                    </button>

                    {/* Theme selector popover */}
                    {showThemeMenu && (
                        <div
                            role="menu"
                            aria-label="Theme options"
                            onKeyDown={(e) => { if (e.key === 'Escape') setShowThemeMenu(false); }}
                            className="absolute bottom-16 left-4 right-4 bg-bg-surface border border-border-subtle rounded-lg shadow-lg p-1 z-50 space-y-0.5 animate-fadeIn"
                            style={{ overscrollBehavior: 'contain' }}
                        >
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleThemeChange('light')}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-left transition-colors cursor-pointer",
                                    appearance === 'light' ? "bg-brand-subtle text-brand font-bold" : "text-text-secondary hover:bg-bg-surface-hover"
                                )}
                            >
                                <Sun size={14} aria-hidden="true" />
                                <span>Light Theme</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleThemeChange('dark')}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-left transition-colors cursor-pointer",
                                    appearance === 'dark' ? "bg-brand-subtle text-brand font-bold" : "text-text-secondary hover:bg-bg-surface-hover"
                                )}
                            >
                                <Moon size={14} aria-hidden="true" />
                                <span>Dark Theme</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleThemeChange('system')}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-left transition-colors cursor-pointer",
                                    appearance === 'system' ? "bg-brand-subtle text-brand font-bold" : "text-text-secondary hover:bg-bg-surface-hover"
                                )}
                            >
                                <Monitor size={14} aria-hidden="true" />
                                <span>System Default</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Top Header */}
            <header className="md:hidden flex items-center px-4 h-14 sm:h-16 bg-bg-surface border-b border-border-subtle sticky top-0 z-40 select-none">
                {isDashboard ? (
                    <div className="w-full flex items-center justify-between">
                        <BrandLogo href="/user/dashboard" size="sm" />
                        <div className="flex items-center gap-2.5">
                            {/* Notification Bell */}
                            <Link
                                href="/user/notifications"
                                className="relative p-2 text-text-secondary hover:bg-bg-surface-hover rounded-full transition-colors cursor-pointer"
                                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
                            >
                                <Bell size={18} aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-error ring-2 ring-bg-surface" aria-hidden="true" />
                                )}
                            </Link>

                            {/* User Avatar */}
                            <Link href="/user/settings" className="w-8 h-8 rounded-full bg-brand text-brand-foreground font-black text-xs flex items-center justify-center">
                                {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-[44px_1fr_44px] items-center">
                        <button
                            type="button"
                            onClick={handleDynamicBack}
                            aria-label="Go back"
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-border-subtle bg-bg-surface text-text-primary hover:bg-bg-surface-hover active:scale-[0.96] transition-transform duration-150 flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Go back"
                        >
                            <ArrowLeft size={19} className="stroke-[2.2px]" aria-hidden="true" />
                        </button>
                        <h1 className="text-sm sm:text-base font-bold text-text-primary text-center truncate tracking-tight px-1">
                            {getPageTitle(url)}
                        </h1>
                        <div className="flex items-center justify-end w-11 h-11 min-w-[44px] min-h-[44px]">
                            <Link
                                href="/user/notifications"
                                className="relative w-9 h-9 flex items-center justify-center text-text-secondary hover:bg-bg-surface-hover rounded-full transition-colors"
                                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
                            >
                                <Bell size={18} aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-error ring-2 ring-bg-surface" aria-hidden="true" />
                                )}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Central Workspace Panel */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Desktop Top Header Bar matching reference mockup */}
                <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-bg-surface border-b border-border-subtle sticky top-0 z-20 select-none">
                    {/* Left: Optional Service Search / Breadcrumb */}
                    <div className="flex-1 max-w-md relative">
                        <div className="relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search for services..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                                onBlur={() => setTimeout(() => setIsSearchOpen(false), 250)}
                                aria-label="Search for services"
                                role="combobox"
                                aria-expanded={isSearchOpen && searchQuery.trim().length > 0}
                                aria-autocomplete="list"
                                aria-controls="service-search-results"
                                className="w-full bg-bg-base border border-border-subtle rounded-md pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                            />
                        </div>

                        {/* Search Dropdown Results */}
                        {isSearchOpen && searchQuery.trim() && (
                            <div
                                id="service-search-results"
                                role="listbox"
                                aria-label="Service search results"
                                className="absolute left-0 right-0 top-11 bg-bg-surface border border-border-subtle rounded-lg shadow-lg p-2 z-50 animate-fadeIn"
                                style={{ overscrollBehavior: 'contain' }}
                            >
                                {filteredServices.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredServices.map(service => (
                                            <Link
                                                key={service.name}
                                                href={service.href}
                                                className="flex items-center gap-3 p-2 rounded-md hover:bg-bg-surface-hover transition-colors"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                                    <service.icon size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-text-primary">{service.name}</div>
                                                    <div className="text-[11px] text-text-muted truncate">{service.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-xs text-text-muted">
                                        No services matching &ldquo;{searchQuery}&rdquo;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Notification Bell, Wallet Balance Pill, User Dropdown */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Link
                            href="/user/notifications"
                            className="relative p-2 text-text-secondary hover:bg-bg-surface-hover rounded-full transition-colors cursor-pointer"
                            aria-label={unreadCount > 0 ? `Notifications — ${unreadCount} unread` : 'Notifications'}
                        >
                            <Bell size={18} aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-error ring-2 ring-bg-surface" aria-hidden="true" />
                            )}
                        </Link>

                        {/* Wallet Balance Shortcut Pill (Matching Mockup e.g. ₦82.00) */}
                        <Link
                            href="/user/wallet"
                            className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle hover:border-brand/40 text-text-primary rounded-md text-xs font-bold shadow-xs hover:bg-bg-surface-hover transition-colors cursor-pointer"
                            title="View Wallet Ledger"
                        >
                            <Wallet size={14} className="text-brand" aria-hidden="true" />
                            <span className="font-mono tabular-nums text-brand">
                                {authCurrency.symbol || (userCurrencyId === 1 ? '$' : '₦')}{(Number(authAccount.available_balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </Link>

                        {/* User Avatar & Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                aria-haspopup="menu"
                                aria-expanded={showProfileMenu}
                                aria-label="User account menu"
                                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-bg-surface-hover transition-colors cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand text-brand-foreground font-black text-xs flex items-center justify-center">
                                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="text-xs font-bold text-text-primary hidden xl:inline">{authUser.name}</span>
                                <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-150", showProfileMenu && "rotate-180")} aria-hidden="true" />
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div
                                    role="menu"
                                    aria-label="User options"
                                    onKeyDown={(e) => { if (e.key === 'Escape') setShowProfileMenu(false); }}
                                    className="absolute right-0 top-11 w-52 bg-bg-surface border border-border-subtle rounded-lg shadow-lg py-1.5 z-50 animate-fadeIn"
                                    style={{ overscrollBehavior: 'contain' }}
                                >
                                    <div className="px-4 py-2 border-b border-border-subtle">
                                        <span className="text-xs font-bold text-text-primary block truncate">{authUser.name}</span>
                                        <span className="text-[10px] text-text-muted block truncate">{authUser.email}</span>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/user/wallet"
                                            role="menuitem"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                                        >
                                            <Wallet size={15} aria-hidden="true" />
                                            <span>My Wallet</span>
                                        </Link>
                                        <Link
                                            href="/user/settings"
                                            role="menuitem"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                                        >
                                            <Settings size={15} aria-hidden="true" />
                                            <span>Settings</span>
                                        </Link>
                                        <Link
                                            href="/user/support"
                                            role="menuitem"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                                        >
                                            <Headphones size={15} aria-hidden="true" />
                                            <span>Need Help?</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-border-subtle pt-1">
                                        <Link
                                            href="/user/logout"
                                            role="menuitem"
                                            method="post"
                                            as="button"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-xs text-error hover:bg-error-bg font-bold transition-colors cursor-pointer"
                                        >
                                            <LogOut size={15} aria-hidden="true" />
                                            <span>Log Out</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Primary Content Container */}
                <div className="flex-1 p-3 sm:p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar (5 Items: Home, Services, Transactions, Wallet, More) */}
            <nav
                className="md:hidden flex border-t border-border-subtle bg-bg-surface/95 backdrop-blur-md sticky bottom-0 z-40 select-none h-[60px] pb-safe justify-around items-center px-2"
                aria-label="Mobile Navigation"
            >
                <Link
                    href="/user/dashboard"
                    aria-current={isActive('/user/dashboard') ? 'page' : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center text-[10px] font-bold gap-1 transition-transform duration-150 active:scale-[0.96] px-3 py-1 rounded-md",
                        isActive('/user/dashboard') ? "text-brand" : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    <Home size={19} className={cn(isActive('/user/dashboard') && "stroke-[2.5px]")} aria-hidden="true" />
                    <span>Home</span>
                </Link>

                <Link
                    href="/user/services"
                    aria-current={(url === '/user/services' || url.startsWith('/user/services') || url === '/user/numbers') ? 'page' : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center text-[10px] font-bold gap-1 transition-transform duration-150 active:scale-[0.96] px-3 py-1 rounded-md",
                        (url === '/user/services' || url.startsWith('/user/services') || url === '/user/numbers') ? "text-brand" : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    <LayoutGrid size={19} className={cn((url === '/user/services' || url.startsWith('/user/services') || url === '/user/numbers') && "stroke-[2.5px]")} aria-hidden="true" />
                    <span>Services</span>
                </Link>

                <Link
                    href="/user/wallet/history"
                    aria-current={isActive('/user/wallet/history') ? 'page' : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center text-[10px] font-bold gap-1 transition-transform duration-150 active:scale-[0.96] px-3 py-1 rounded-md",
                        isActive('/user/wallet/history') ? "text-brand" : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    <Receipt size={19} className={cn(isActive('/user/wallet/history') && "stroke-[2.5px]")} aria-hidden="true" />
                    <span>Transactions</span>
                </Link>

                <Link
                    href="/user/wallet"
                    aria-current={(url === '/user/wallet' || url === '/user/wallet/fund') ? 'page' : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center text-[10px] font-bold gap-1 transition-transform duration-150 active:scale-[0.96] px-3 py-1 rounded-md",
                        url === '/user/wallet' || url === '/user/wallet/fund' ? "text-brand" : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    <Wallet size={19} className={cn((url === '/user/wallet' || url === '/user/wallet/fund') && "stroke-[2.5px]")} aria-hidden="true" />
                    <span>Wallet</span>
                </Link>

                <Link
                    href="/user/settings"
                    aria-current={url.startsWith('/user/settings') ? 'page' : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center text-[10px] font-bold gap-1 transition-transform duration-150 active:scale-[0.96] px-3 py-1 rounded-md",
                        url.startsWith('/user/settings') ? "text-brand" : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    <MoreHorizontal size={19} className={cn(url.startsWith('/user/settings') && "stroke-[2.5px]")} aria-hidden="true" />
                    <span>More</span>
                </Link>
            </nav>

            {/* Global Privacy & Attribution Utilities */}
            <CookieConsent />
            <UtmTracker />
        </div>
    );
};

export const AppShell: React.FC<{ children: React.ReactNode; title?: string; backUrl?: string }> = ({ children, title, backUrl }) => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <MockStoreProvider>
                    <AppLayoutInner title={title} backUrl={backUrl}>{children}</AppLayoutInner>
                </MockStoreProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};
export default AppShell;