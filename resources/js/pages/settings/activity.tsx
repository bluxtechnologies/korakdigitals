import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

const ACTION_LABELS: Record<string, string> = {
    login: 'Logged in',
    profile_updated: 'Updated profile details',
    password_changed: 'Changed password',
};

export default function SettingsActivity() {
    const { props } = usePage<any>();
    const activitiesPage = props.activities || {};
    const activities = activitiesPage.data || [];
    const links: PaginationLink[] = activitiesPage.links || [];

    return (
        <>
            <Head title="Activity Settings" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                <div>
                    <Link href="/user/settings" className="text-xs font-medium text-text-muted hover:text-brand transition-colors">
                        &larr; Settings
                    </Link>
                    <h1 className="text-xl font-semibold text-text-primary tracking-tight mt-1">Settings</h1>
                    <p className="text-xs text-text-secondary">Manage your profile, security, and account preferences.</p>
                </div>

                <SettingsTabs />

                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-subtle bg-bg-base">
                        <h2 className="text-sm font-semibold text-text-primary">Account Activity</h2>
                        <p className="text-xs text-text-secondary mt-0.5">A record of logins and changes made to your account.</p>
                    </div>

                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-xs text-text-muted">No account activity recorded yet.</div>
                    ) : (
                        <div className="divide-y divide-border-subtle">
                            {activities.map((a: any) => (
                                <div key={a.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <div className="font-medium text-text-primary">{ACTION_LABELS[a.action] || a.action}</div>
                                        {a.ip_address && <div className="text-text-muted font-mono text-[11px] mt-0.5">{a.ip_address}</div>}
                                    </div>
                                    <div className="text-text-muted font-mono text-[11px] shrink-0">
                                        {new Date(a.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                    link.active
                                        ? 'bg-brand text-brand-foreground border-brand'
                                        : link.url
                                        ? 'border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                                        : 'border-border-subtle text-text-muted cursor-not-allowed opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

SettingsActivity.layout = (page: React.ReactNode) => (
    <AppShell title="Activity Audit" backUrl="/user/settings">
        {page}
    </AppShell>
);