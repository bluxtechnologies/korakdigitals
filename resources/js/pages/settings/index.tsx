import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { 
    UserIcon, 
    LockIcon, 
    ListIcon, 
    SunIcon, 
    SupportIcon, 
    ApiIcon, 
    LogOutIcon,
    BellIcon,
    WalletIcon,
    KeyIcon,
    PhoneIcon,
    WifiIcon,
    SparklesIcon
} from '@/components/ui/Icons';

interface MenuRow {
    name: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
    badgeVariant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral';
}

interface MenuGroup {
    label: string;
    rows: MenuRow[];
}

const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export default function SettingsIndex() {
    const { props } = usePage<any>();
    const user = props.user || props.auth?.user || { name: 'User', email: '' };
    const authCurrency = props.auth?.currency || { code: 'NGN', symbol: '₦' };
    const unreadCount = props.auth?.unread_notifications_count || 0;

    const GROUPS: MenuGroup[] = [
        {
            label: 'Activity & Finance',
            rows: [
                { 
                    name: 'Order History', 
                    description: 'Track purchases, verification codes, and download digital receipts', 
                    href: '/user/orders', 
                    icon: ListIcon 
                },
                { 
                    name: 'Notifications', 
                    description: 'Account alerts, wallet funding notices, and system announcements', 
                    href: '/user/notifications', 
                    icon: BellIcon,
                    badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
                    badgeVariant: 'error'
                },
                { 
                    name: 'Wallet & Funding', 
                    description: 'Check available balance, funding accounts, and ledger audit logs', 
                    href: '/user/wallet', 
                    icon: WalletIcon 
                },
            ],
        },
        {
            label: 'Digital Services',
            rows: [
                { 
                    name: 'Rent Phone Numbers', 
                    description: 'Temporary non-VoIP SMS numbers for 500+ global apps', 
                    href: '/user/numbers', 
                    icon: KeyIcon 
                },
                { 
                    name: 'Mobile Data Bundles', 
                    description: 'Instant data bundles for MTN, Airtel, Glo & 9mobile', 
                    href: '/user/services/data', 
                    icon: WifiIcon 
                },
                { 
                    name: 'Airtime Top-up', 
                    description: 'Direct telecom VTU airtime recharge for all networks', 
                    href: '/user/services/airtime', 
                    icon: PhoneIcon 
                },
                { 
                    name: 'Social Growth & Marketing', 
                    description: 'Engagement boosts, followers, global eSIM roaming, and VPN services', 
                    href: '/user/services/growth', 
                    icon: SparklesIcon 
                },
            ],
        },
        {
            label: 'Account & Security',
            rows: [
                { 
                    name: 'Edit Profile', 
                    description: 'Personal details, phone number, and default base currency', 
                    href: '/user/settings/profile', 
                    icon: UserIcon 
                },
                { 
                    name: 'Security & Password', 
                    description: 'Change password, two-factor settings, and active sessions', 
                    href: '/user/settings/security', 
                    icon: LockIcon 
                },
                { 
                    name: 'Account Activity Audit', 
                    description: 'Comprehensive audit trail of recent sign-ins and sensitive events', 
                    href: '/user/settings/activity', 
                    icon: ListIcon 
                },
                { 
                    name: 'Theme & Appearance', 
                    description: 'Switch between Light, Dark, or System interface themes', 
                    href: '/user/settings/appearance', 
                    icon: SunIcon 
                },
            ],
        },
        {
            label: 'Support & Developer',
            rows: [
                { 
                    name: 'Help & Support Desk', 
                    description: 'Submit support tickets and get 24/7 dedicated assistance', 
                    href: '/user/support', 
                    icon: SupportIcon 
                },
                { 
                    name: 'Developer API Keys', 
                    description: 'Manage REST API credentials and webhooks for programmatic access', 
                    href: '/user/developer', 
                    icon: ApiIcon 
                },
            ],
        },
    ];

    return (
        <>
            <Head title="Menu & Settings" />
            <div className="max-w-4xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Menu & Account Hub</h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Access all Korak services, order records, notifications, preferences, and developer tools.
                    </p>
                </div>

                {/* Identity Summary Card */}
                <div className="bg-bg-surface border border-border-subtle rounded-md p-5 flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-brand-foreground font-black text-lg shrink-0 shadow-2xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-text-primary truncate">{user.name}</h2>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-subtle text-brand border border-brand/20">
                                    Base: {authCurrency.code || 'NGN'} ({authCurrency.symbol || '₦'})
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={user.status === 'active' ? 'success' : 'warning'} dot className="capitalize shrink-0 text-[10px] font-bold">
                        {user.status || 'Active Client'}
                    </Badge>
                </div>

                {/* Grouped Menu Sections */}
                {GROUPS.map((group) => (
                    <div key={group.label} className="space-y-2">
                        <div className="px-1 text-[11px] font-bold text-text-muted uppercase tracking-wider">{group.label}</div>
                        <div className="bg-bg-surface border border-border-subtle rounded-md divide-y divide-border-subtle overflow-hidden shadow-2xs">
                            {group.rows.map((row) => (
                                <Link
                                    key={row.name}
                                    href={row.href}
                                    className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-bg-surface-hover transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-9 h-9 rounded-md bg-brand-subtle text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <row.icon size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-text-primary">{row.name}</span>
                                                {row.badge && (
                                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-error text-white">
                                                        {row.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-text-muted truncate mt-0.5">{row.description}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-muted group-hover:text-text-primary shrink-0 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Action */}
                <Link
                    href="/user/logout"
                    method="post"
                    as="button"
                    className="w-full bg-bg-surface border border-error-border rounded-md p-4 flex items-center justify-center gap-2 text-error font-bold text-xs hover:bg-error-bg transition-colors cursor-pointer shadow-2xs active:scale-[0.96]"
                >
                    <LogOutIcon size={16} />
                    <span>Log Out of Korak Account</span>
                </Link>
            </div>
        </>
    );
}

SettingsIndex.layout = (page: React.ReactNode) => (
    <AppShell title="Account & Settings">
        {page}
    </AppShell>
);