import * as React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function SettingsSecurity() {
    const { props } = usePage<any>();
    const user = props.user;
    const toast = useToast();

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/user/settings/security/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Password updated successfully.');
            },
        });
    };

    return (
        <>
            <Head title="Security Settings" />
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
                    <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">Account Status</h2>
                            <p className="text-xs text-text-secondary">Current standing of your Korak account.</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'success' : 'warning'} dot className="capitalize">
                            {user.status || 'active'}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-1">Change Password</h3>
                        <p className="text-xs text-text-secondary mb-4">Choose a strong password you don't use elsewhere.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                error={errors.current_password}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                required
                            />

                            <Button type="submit" className="w-full sm:w-auto px-6" isLoading={processing}>
                                Update Password
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

SettingsSecurity.layout = (page: React.ReactNode) => (
    <AppShell title="Security Settings" backUrl="/user/settings">
        {page}
    </AppShell>
);