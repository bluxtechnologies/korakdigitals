import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { useTheme } from '@/components/ThemeContext';
import { SunIcon, MoonIcon, ComputerIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

const THEMES = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerIcon },
] as const;

export default function SettingsAppearance() {
    const { appearance, setAppearance } = useTheme();

    return (
        <>
            <Head title="Appearance Settings" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                <div>
                    <Link href="/user/settings" className="text-xs font-medium text-text-muted hover:text-brand transition-colors">
                        &larr; Settings
                    </Link>
                    <h1 className="text-xl font-semibold text-text-primary tracking-tight mt-1">Settings</h1>
                    <p className="text-xs text-text-secondary">Manage your profile, security, and account preferences.</p>
                </div>

                <SettingsTabs />

                <div className="bg-bg-surface border border-border-subtle rounded-md p-6 shadow-xs space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
                        <p className="text-xs text-text-secondary mt-0.5">Choose how Korak looks on this device.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {THEMES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setAppearance(t.value)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-5 rounded-md border text-xs font-medium transition-all cursor-pointer',
                                    appearance === t.value
                                        ? 'border-brand bg-brand-subtle text-brand'
                                        : 'border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                                )}
                            >
                                <t.icon size={22} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

SettingsAppearance.layout = (page: React.ReactNode) => (
    <AppShell title="Appearance" backUrl="/user/settings">
        {page}
    </AppShell>
);