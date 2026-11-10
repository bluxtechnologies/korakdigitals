import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { BellIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

interface NotificationItem {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
        title: string;
        message: string;
        category?: string;
        reference?: string;
    };
}

export default function Notifications() {
    const { props } = usePage<any>();
    const notificationsPage = props.notifications || {};
    const notifications: NotificationItem[] = notificationsPage.data || [];
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read_at : true));
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    const handleMarkRead = (id: string) => {
        router.post(`/user/notifications/${id}/read`, {}, { preserveScroll: true, preserveState: true });
    };

    const handleMarkAllRead = () => {
        router.post('/user/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Notifications Inbox" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-text-primary tracking-tight">Notifications</h1>
                        <p className="text-xs text-text-secondary">
                            Stay updated on wallet activity, order statuses, and system alerts.
                        </p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border-subtle p-4.5 rounded-md shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                'flex-1 md:flex-none px-4.5 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer text-center',
                                filter === 'all'
                                    ? 'bg-brand text-brand-foreground border-brand'
                                    : 'bg-bg-base border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                            )}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                'flex-1 md:flex-none px-4.5 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer text-center',
                                filter === 'unread'
                                    ? 'bg-brand text-brand-foreground border-brand'
                                    : 'bg-bg-base border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                            )}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold text-brand cursor-pointer shrink-0"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs divide-y divide-border-subtle overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                <BellIcon size={28} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-semibold text-text-primary block">Inbox is Empty</span>
                                <span className="text-xs text-text-muted leading-relaxed block max-w-xs mx-auto">
                                    {filter === 'unread' ? 'You have no unread notifications.' : 'You have no notifications yet.'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        filtered.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => !item.read_at && handleMarkRead(item.id)}
                                className={cn(
                                    'p-4.5 flex gap-4 transition-colors cursor-pointer text-xs items-start',
                                    item.read_at ? 'bg-bg-surface hover:bg-bg-surface-hover/50' : 'bg-brand-subtle/40 hover:bg-bg-surface-hover/80'
                                )}
                                title={item.read_at ? undefined : 'Click to mark as read'}
                            >
                                <div className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-border-subtle',
                                    item.read_at ? 'bg-bg-base text-text-secondary' : 'bg-brand-subtle text-brand border-brand/20'
                                )}>
                                    <BellIcon size={16} />
                                </div>

                                <div className="flex-1 flex flex-col gap-0.5">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className={cn('font-semibold text-xs tracking-tight', item.read_at ? 'text-text-primary' : 'text-brand')}>
                                            {item.data.title}
                                        </span>
                                        <span className="text-[9px] text-text-muted font-mono shrink-0">
                                            {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-text-secondary leading-relaxed mt-1">
                                        {item.data.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
}

Notifications.layout = (page: React.ReactNode) => (
    <AppShell title="Notifications" backUrl="/user/dashboard">
        {page}
    </AppShell>
);