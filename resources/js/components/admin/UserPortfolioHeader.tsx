import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
    HomeIcon,
    WalletIcon,
    ListIcon,
    CreditCardIcon,
    InboxIcon,
    KeyIcon,
    ShieldIcon,
    UserIcon,
    SupportIcon,
} from '@/components/ui/Icons';

interface UserPortfolioHeaderProps {
    user: any;
}

export const UserPortfolioHeader: React.FC<UserPortfolioHeaderProps> = ({ user }) => {
    const { url } = usePage();

    const tabs = [
        { name: 'Overview', href: `/admin/users/${user.id}`, icon: HomeIcon, exact: true },
        { name: 'Wallet', href: `/admin/users/${user.id}/wallet`, icon: WalletIcon },
        { name: 'Orders', href: `/admin/users/${user.id}/orders`, icon: ListIcon },
        { name: 'Funding', href: `/admin/users/${user.id}/funding`, icon: CreditCardIcon },
        { name: 'Support', href: `/admin/users/${user.id}/support`, icon: SupportIcon },
        { name: 'Temp Emails', href: `/admin/users/${user.id}/temp-emails`, icon: InboxIcon },
        { name: 'API Keys', href: `/admin/users/${user.id}/api-keys`, icon: KeyIcon },
        { name: 'Activity', href: `/admin/users/${user.id}/audit-logs`, icon: ShieldIcon },
        { name: 'Account', href: `/admin/users/${user.id}/edit`, icon: UserIcon },
    ];

    const isTabActive = (href: string, exact = false) => {
        if (exact) return url === href;
        return url.startsWith(href);
    };

    const statusVariant = user.status === 'active' ? 'success' : user.status === 'suspended' ? 'neutral' : 'error';

    return (
        <div className="bg-bg-surface border border-border-subtle rounded-md p-6 shadow-xs space-y-6 select-none animate-fadeIn">
            
            {/* Upper User Identity Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-md bg-brand text-brand-foreground font-black text-xl flex items-center justify-center shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-black text-text-primary tracking-tight">{user.name}</h2>
                            <Badge variant={statusVariant} className="text-[10px] font-extrabold uppercase">
                                {user.status || 'Active'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                            <span className="font-mono">{user.email}</span>
                            {user.phone && <span>• {user.phone}</span>}
                            <span>• Customer #{user.id}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Financial Summary Bar */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end bg-bg-base p-2.5 border border-border-subtle rounded-md">
                    <div className="px-3 border-r border-border-subtle">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Wallet Balance</span>
                        <span className="text-base font-black font-mono text-success">
                            {user.currency?.symbol || '₦'}{(Number(user.account?.available_balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="px-3">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Total Deposited</span>
                        <span className="text-base font-black font-mono text-text-primary">
                            {user.currency?.symbol || '₦'}{(Number(user.account?.total_deposit) || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Portfolio Sub-Navigation Tabs */}
            <div className="flex overflow-x-auto gap-1 border-b border-border-subtle pb-1 scrollbar-none">
                {tabs.map((t) => {
                    const active = isTabActive(t.href, t.exact);
                    return (
                        <Link
                            key={t.name}
                            href={t.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                                active
                                    ? "bg-brand text-brand-foreground shadow-xs"
                                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                            )}
                        >
                            <t.icon size={16} />
                            <span>{t.name}</span>
                        </Link>
                    );
                })}
            </div>

        </div>
    );
};