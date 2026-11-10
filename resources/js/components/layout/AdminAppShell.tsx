import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ToastProvider } from '../ui/Toast';
import { ThemeProvider, useTheme } from '../ThemeContext';
import {
    HomeIcon,
    UserGroupIcon,
    ListIcon,
    WalletIcon,
    ShieldIcon,
    CogIcon,
    SearchIcon,
    CloseIcon,
    LogOutIcon,
    SunIcon,
    MoonIcon,
    ComputerIcon,
    SupportIcon,
    BellIcon,
    GlobeIcon,
} from '../ui/Icons';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    indicator?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Overview',
        items: [{ name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon }],
    },
    {
        label: 'Operations',
        items: [
            { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
            { name: 'Services', href: '/admin/services', icon: CogIcon },
            { name: 'Integrations', href: '/admin/settings/suppliers', icon: GlobeIcon },
            { name: 'Support', href: '/admin/support', icon: SupportIcon },
        ],
    },
    {
        label: 'Communication',
        items: [
            { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
        ],
    },
    {
        label: 'System',
        items: [
            { name: 'Admins & Roles', href: '/admin/administrators', icon: UserGroupIcon },
            { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldIcon },
            { name: 'General Settings', href: '/admin/settings/general', icon: CogIcon },
            { name: 'Pricing & Markups', href: '/admin/settings/pricing', icon: WalletIcon },
        ],
    },
];

const SidebarNav: React.FC<{ isActive: (href: string) => boolean; onNavigate?: () => void }> = ({ isActive, onNavigate }) => (
    <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
                <div className="px-3 mb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{group.label}</div>
                <ul className="space-y-0.5">
                    {group.items.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    'flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-md transition-colors',
                                    isActive(item.href)
                                        ? 'bg-brand text-brand-foreground'
                                        : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                                )}
                            >
                                <div className="flex items-center gap-2.5">
                                    <item.icon className="shrink-0" size={17} />
                                    <span>{item.name}</span>
                                </div>
                                {item.indicator && (
                                    <span
                                        className={cn(
                                            'h-1.5 w-1.5 rounded-full shrink-0',
                                            isActive(item.href) ? 'bg-brand-foreground' : 'bg-brand'
                                        )}
                                        title="Pending items"
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </nav>
);

const AdminProfileFooter: React.FC<{ adminUser: { name: string; role?: string } }> = ({ adminUser }) => (
    <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center justify-between p-2.5 bg-bg-base border border-border-subtle rounded-md">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-brand-subtle text-brand flex items-center justify-center font-semibold text-xs shrink-0">
                    {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text-primary truncate">{adminUser.name}</span>
                    <span className="text-[10px] text-text-muted capitalize">{(adminUser.role || 'super_admin').replace('_', ' ')}</span>
                </div>
            </div>
            <Link href="/admin/logout" method="post" as="button" className="text-text-muted hover:text-error transition-colors p-1.5 shrink-0" title="Log Out">
                <LogOutIcon size={16} />
            </Link>
        </div>
    </div>
);

const AdminAppShellInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { url, props } = usePage<any>();
    const adminUser = props.auth?.user || { name: 'Super Admin', role: 'super_admin' };
    const { appearance, setAppearance } = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

    const isActive = (href: string) => url.startsWith(href);

    const cycleTheme = () => {
        setAppearance(appearance === 'light' ? 'dark' : appearance === 'dark' ? 'system' : 'light');
    };

    const ThemeIcon = appearance === 'light' ? SunIcon : appearance === 'dark' ? MoonIcon : ComputerIcon;

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close the mobile drawer whenever the route changes
    React.useEffect(() => {
        setDrawerOpen(false);
    }, [url]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-bg-base text-text-primary font-sans">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-bg-surface border-r border-border-subtle shrink-0 sticky top-0 h-screen select-none z-30">
                <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-brand-foreground font-semibold text-sm">
                            K
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold tracking-tight text-text-primary">Korak Admin</span>
                            <span className="text-[10px] text-text-muted">Control Suite</span>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-text-muted" title="Operational">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Online
                    </span>
                </div>

                <SidebarNav isActive={isActive} />
                <AdminProfileFooter adminUser={adminUser} />
            </aside>

            {/* Mobile Slide-over Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-bg-surface border-r border-border-subtle flex flex-col shadow-lg">
                        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-brand-foreground font-semibold text-sm">
                                    K
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold tracking-tight text-text-primary">Korak Admin</span>
                                    <span className="text-[10px] text-text-muted">Control Suite</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-bg-surface-hover transition-colors"
                                title="Close menu"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>

                        <SidebarNav isActive={isActive} onNavigate={() => setDrawerOpen(false)} />
                        <AdminProfileFooter adminUser={adminUser} />
                    </aside>
                </div>
            )}

            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Mobile Topnav */}
                <header className="grid grid-cols-3 items-center px-4 py-3 bg-bg-surface border-b border-border-subtle sticky top-0 z-20 md:hidden">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="justify-self-start p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-bg-surface-hover transition-colors"
                        title="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                        </svg>
                    </button>
                    <span className="justify-self-center text-xs font-bold tracking-tight text-text-primary">Korak Admin</span>
                    <div className="justify-self-end w-5" />
                </header>

                {/* Desktop Topnav */}
                <header className="hidden md:flex items-center justify-between px-6 py-3 bg-bg-surface border-b border-border-subtle sticky top-0 z-20">
                    <div className="w-72 relative">
                        <input
                            type="text"
                            placeholder="Search users, orders, logs…"
                            disabled
                            className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 pl-8 text-xs text-text-primary placeholder:text-text-muted cursor-not-allowed"
                        />
                        <SearchIcon size={14} className="text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={cycleTheme}
                            className="p-1.5 text-text-secondary hover:bg-bg-surface-hover rounded-md transition-colors"
                            title={`Theme: ${appearance}`}
                        >
                            <ThemeIcon size={16} />
                        </button>

                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setProfileMenuOpen((v) => !v)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-bg-surface-hover transition-colors"
                            >
                                <div className="w-7 h-7 rounded-md bg-brand-subtle text-brand flex items-center justify-center font-semibold text-xs">
                                    {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-text-muted">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-1.5 w-48 bg-bg-surface border border-border-subtle rounded-md shadow-md py-1 z-30">
                                    <div className="px-3 py-2 border-b border-border-subtle">
                                        <div className="text-xs font-semibold text-text-primary truncate">{adminUser.name}</div>
                                        <div className="text-[10px] text-text-muted capitalize">{(adminUser.role || 'super_admin').replace('_', ' ')}</div>
                                    </div>
                                    <Link
                                        href="/admin/logout"
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 px-3 py-2 w-full text-left text-xs text-error hover:bg-error-bg transition-colors"
                                    >
                                        <LogOutIcon size={14} />
                                        <span>Log Out</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>

        </div>
    );
};

export const AdminAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider>
        <ToastProvider>
            <AdminAppShellInner>{children}</AdminAppShellInner>
        </ToastProvider>
    </ThemeProvider>
);

export default AdminAppShell;