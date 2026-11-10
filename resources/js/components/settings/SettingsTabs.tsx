import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { UserIcon, LockIcon, ListIcon, SunIcon } from '@/components/ui/Icons';

const TABS = [
    { name: 'Profile', href: '/user/settings/profile', icon: UserIcon },
    { name: 'Security', href: '/user/settings/security', icon: LockIcon },
    { name: 'Activity', href: '/user/settings/activity', icon: ListIcon },
    { name: 'Appearance', href: '/user/settings/appearance', icon: SunIcon },
];

export const SettingsTabs: React.FC = () => {
    const { url } = usePage();

    return (
        <div className="flex overflow-x-auto gap-1 border-b border-border-subtle pb-px scrollbar-none">
            {TABS.map((tab) => {
                const active = url.startsWith(tab.href);
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-md transition-colors whitespace-nowrap border-b-2 -mb-px',
                            active
                                ? 'text-brand border-brand'
                                : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-surface-hover'
                        )}
                    >
                        <tab.icon size={15} />
                        <span>{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
};