import * as React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { SupportIcon, ApiIcon } from '@/components/ui/Icons';

export default function SettingsProfile() {
    const { props } = usePage<any>();
    const user = props.user;
    const currencies: { id: number; code: string; name: string; symbol: string }[] = props.currencies || [];
    const toast = useToast();

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        user_currency_id: user.user_currency_id ? String(user.user_currency_id) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/user/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully.');
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            },
        });
    };

    return (
        <>
            <Head title="Profile Settings" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                <div>
                    <Link href="/user/settings" className="text-xs font-medium text-text-muted hover:text-brand transition-colors">
                        &larr; Settings
                    </Link>
                    <h1 className="text-xl font-semibold text-text-primary tracking-tight mt-1">Settings</h1>
                    <p className="text-xs text-text-secondary">Manage your profile, security, and account preferences.</p>
                </div>

                <SettingsTabs />

                <div className="bg-bg-surface border border-border-subtle rounded-md p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-3.5 pb-5 border-b border-border-subtle">
                        <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-brand-foreground font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">{user.name}</h2>
                            <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                            required
                        />
                        <Select
                            label="Preferred Currency"
                            value={data.user_currency_id}
                            onChange={(e) => setData('user_currency_id', e.target.value)}
                            options={currencies.map((c) => ({ value: c.id, label: `${c.code} (${c.symbol}) — ${c.name}` }))}
                        />

                        <Button type="submit" className="w-full sm:w-auto px-6" isLoading={processing}>
                            Save Changes
                        </Button>
                    </form>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-md p-4 flex flex-col sm:flex-row gap-3 text-xs">
                    <Link href="/user/support" className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors">
                        <SupportIcon size={15} />
                        <span>Help & Support</span>
                    </Link>
                    <Link href="/user/developer" className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors">
                        <ApiIcon size={15} />
                        <span>Developer API Keys</span>
                    </Link>
                </div>
            </div>
        </>
    );
}

SettingsProfile.layout = (page: React.ReactNode) => (
    <AppShell title="Profile Settings" backUrl="/user/settings">
        {page}
    </AppShell>
);