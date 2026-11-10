import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { useMockStore } from '@/mock/store';
import { useTheme } from '@/components/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { CopyIcon, UserIcon, LockIcon, ApiIcon, SunIcon, MoonIcon, ComputerIcon, SupportIcon, TrashIcon, LogOutIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

export default function Settings() {
    const { user, updateProfile, clearStore } = useMockStore();
    const { appearance, setAppearance } = useTheme();
    const toast = useToast();

    // Form states
    const [name, setName] = React.useState(user.name);
    const [email, setEmail] = React.useState(user.email);
    const [phone, setPhone] = React.useState(user.phone);
    const [currency, setCurrency] = React.useState(user.currency);

    const [password, setPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

    const [profileSaving, setProfileSaving] = React.useState(false);
    const [securitySaving, setSecuritySaving] = React.useState(false);

    // Mobile Subview Manager
    const [mobileSubView, setMobileSubView] = React.useState<string | null>(null);

    // Mock Developer API Credential Visibilities
    const [showApiKey, setShowApiKey] = React.useState(false);
    const mockApiKey = 'clq_live_49b1a03f8c829ef104bd91e0a294cf0a28';

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !phone) {
            toast.error("Please fill out all required profile details.");
            return;
        }

        setProfileSaving(true);
        setTimeout(() => {
            updateProfile({ name, email, phone, currency });
            setProfileSaving(false);
            toast.success("Profile preferences updated successfully.", "Saved");
            setMobileSubView(null); // return back to mobile menu
        }, 1000);
    };

    const handleSaveSecurity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !newPassword || !confirmNewPassword) {
            toast.error("Please fill out all required password fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setSecuritySaving(true);
        setTimeout(() => {
            setSecuritySaving(false);
            setPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            toast.success("Security credentials updated successfully.", "Saved");
            setMobileSubView(null); // return back to mobile menu
        }, 1200);
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard.`);
    };

    const handleClearState = () => {
        if (confirm("Are you sure you want to reset your local database state? This resets wallet balances, active orders, and deletes rented numbers history.")) {
            clearStore();
            toast.success("Workspace state has been reset to defaults.");
            // reload window to clear fields
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    return (
        <>
            <Head title="Account Settings" />
            
            {/* ========================================================================= */}
            {/* MOBILE LAYOUT: Full-page Fintech App Settings Menu (block lg:hidden)      */}
            {/* ========================================================================= */}
            <div className="block lg:hidden px-4 py-4 space-y-5 select-none animate-fadeIn pb-12">
                
                {mobileSubView === null ? (
                    /* Landing Options Menu List */
                    <div className="space-y-5">
                        {/* Account Brief Overview */}
                        <div className="bg-bg-surface border border-border-subtle p-4.5 rounded-md flex items-center gap-3.5 shadow-2xs">
                            <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-brand-foreground font-black text-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-text-primary truncate">{user.name}</h4>
                                <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-brand-subtle text-brand">
                                        Base: {user.currency}
                                    </span>
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-success-bg text-success border border-success-border">
                                        Verified Korak Client
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Dark/Light Mode Toggle */}
                        <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                    {appearance === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-text-primary">Dark Mode</span>
                                    <span className="text-[10px] text-text-muted">
                                        {appearance === 'dark' ? 'Currently enabled' : appearance === 'light' ? 'Currently disabled' : 'Following system'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setAppearance(appearance === 'dark' ? 'light' : 'dark')}
                                className={cn(
                                    "relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer",
                                    appearance === 'dark' ? "bg-brand" : "bg-bg-surface-active border border-border-subtle"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform duration-300",
                                    appearance === 'dark' && "translate-x-5"
                                )} />
                            </button>
                        </div>

                        {/* Settings Options List */}
                        <div className="bg-bg-surface border border-border-subtle rounded-md divide-y divide-border-subtle shadow-2xs overflow-hidden">
                            
                            {/* Profile settings toggler */}
                            <div 
                                onClick={() => setMobileSubView('profile')}
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                        <UserIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Profile Preferences</span>
                                        <span className="text-[10px] text-text-muted">Manage name, contact number, and currency</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </div>

                            {/* Security settings toggler */}
                            <div 
                                onClick={() => setMobileSubView('security')}
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                        <LockIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Account Security</span>
                                        <span className="text-[10px] text-text-muted">Update login passwords and credentials</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </div>

                            {/* API dev toggler */}
                            <div 
                                onClick={() => setMobileSubView('api')}
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                        <ApiIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Developer API Key</span>
                                        <span className="text-[10px] text-text-muted">View REST developer access credentials</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </div>

                            {/* Theme appearance toggler */}
                            <div 
                                onClick={() => setMobileSubView('theme')}
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                        <SunIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Appearance Theme</span>
                                        <span className="text-[10px] text-text-muted">Switch light, dark, or system modes</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </div>

                            {/* Help Desk trigger — now links to /user/support */}
                            <Link 
                                href="/user/support"
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                                        <SupportIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Help & Support Desk</span>
                                        <span className="text-[10px] text-text-muted">Get assistance from live software operators</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </Link>

                            {/* Reset state database */}
                            <div 
                                onClick={handleClearState}
                                className="p-4 flex items-center justify-between hover:bg-bg-surface-hover/50 cursor-pointer transition-all active:scale-[0.96]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-error-bg text-error flex items-center justify-center">
                                        <TrashIcon size={16} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-primary">Clear Local Storage</span>
                                        <span className="text-[10px] text-text-muted">Erase transaction records and reset mock balance</span>
                                    </div>
                                </div>
                                <span className="text-text-muted font-bold text-sm" aria-hidden="true">&gt;</span>
                            </div>
                        </div>

                        {/* Mobile Logout option */}
                        <Link
                            href="/user/logout"
                            method="post"
                            as="button"
                            className="w-full bg-bg-surface border border-error-border rounded-md p-4 flex items-center justify-center gap-2 text-error font-extrabold text-xs shadow-2xs hover:bg-error-bg/50 transition-colors active:scale-[0.96] text-center cursor-pointer ripple-btn"
                        >
                            <LogOutIcon size={14} className="inline-block mr-1" /> Log Out of Account
                        </Link>
                        
                    </div>
                ) : (
                    /* Mobile Form Subviews Container */
                    <div className="space-y-5">
                        {/* Subview Back Header Navigation */}
                        <button 
                            onClick={() => setMobileSubView(null)}
                            className="flex items-center gap-2 text-xs font-bold text-brand hover:underline cursor-pointer border border-brand/20 bg-brand-subtle px-3 py-1.5 rounded-full select-none"
                        >
                            &larr; Back to Settings Options
                        </button>

                        {/* SUBVIEW 1: Profile forms */}
                        {mobileSubView === 'profile' && (
                            <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-md flex flex-col gap-4 animate-scaleIn">
                                <h3 className="text-sm font-bold text-text-primary">Edit Profile Preferences</h3>
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                                    <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    <Select
                                        label="Display Currency preference"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}
                                        options={[
                                            { value: 'NGN', label: '₦ NGN - Nigerian Naira' },
                                            { value: 'USD', label: '$ USD - United States Dollar' }
                                        ]}
                                    />
                                    <Button type="submit" className="w-full text-xs font-bold shadow-sm" isLoading={profileSaving}>
                                        Save Changes
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* SUBVIEW 2: Security settings */}
                        {mobileSubView === 'security' && (
                            <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-md flex flex-col gap-4 animate-scaleIn">
                                <h3 className="text-sm font-bold text-text-primary">Update Account Password</h3>
                                <form onSubmit={handleSaveSecurity} className="space-y-4">
                                    <Input label="Current Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <Input label="New Password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                                    <Button type="submit" variant="secondary" className="w-full text-xs font-bold shadow-sm" isLoading={securitySaving}>
                                        Update Credentials
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* SUBVIEW 3: API keys */}
                        {mobileSubView === 'api' && (
                            <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-md flex flex-col gap-4 animate-scaleIn">
                                <h3 className="text-sm font-bold text-text-primary">API Developer Access Token</h3>
                                <div className="space-y-3">
                                    <div className="relative flex items-center">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={mockApiKey}
                                            readOnly
                                            className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-bg-base border border-border-subtle text-text-primary rounded-sm"
                                        />
                                        <div className="absolute right-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="p-1 text-text-muted hover:text-text-primary cursor-pointer text-[10px] font-bold uppercase"
                                            >
                                                {showApiKey ? 'Hide' : 'Reveal'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(mockApiKey, 'API Key')}
                                                className="p-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                                            >
                                                <CopyIcon size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">
                                        Integrate Korak digital purchases via cURL requests. Do not share live secret keys in codebases.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SUBVIEW 4: Theme selections */}
                        {mobileSubView === 'theme' && (
                            <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-md flex flex-col gap-4 animate-scaleIn">
                                <h3 className="text-sm font-bold text-text-primary">Choose Appearance Mode</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['light', 'dark', 'system'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setAppearance(mode);
                                                toast.success(`Theme mode set to ${mode.toUpperCase()}`);
                                            }}
                                            className={cn(
                                                "py-3 border text-xs font-semibold rounded-xs transition-colors flex flex-col items-center gap-1.5 capitalize cursor-pointer",
                                                appearance === mode ? "border-brand bg-brand-subtle text-brand" : "border-border-subtle bg-bg-base text-text-secondary"
                                            )}
                                        >
                                            <span className="flex items-center gap-1.5">{mode === 'light' ? <><SunIcon size={14} /> Light</> : mode === 'dark' ? <><MoonIcon size={14} /> Dark</> : <><ComputerIcon size={14} /> System</>}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP LAYOUT: Existing Approved Desktop Forms Layout (hidden lg:grid)    */}
            {/* ========================================================================= */}
            <div className="hidden lg:block max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Account Settings</h1>
                        <p className="text-xs text-text-secondary">
                            Manage your profile, security credentials, and workspace preferences.
                        </p>
                    </div>
                </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                
                {/* Left Columns (7/12): Profile details & Security */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Profile Information Block */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs flex flex-col gap-4">
                        <div className="flex flex-col gap-0.5 select-none">
                            <h2 className="text-base font-bold text-text-primary">Profile Information</h2>
                            <p className="text-xs text-text-secondary">Manage your account credentials and preferred display parameters</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Select
                                label="Default Payment & Display Currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}
                                options={[
                                    { value: 'NGN', label: '₦ NGN - Nigerian Naira' },
                                    { value: 'USD', label: '$ USD - United States Dollar' }
                                ]}
                            />

                            <div className="flex justify-end border-t border-border-subtle pt-4">
                                <Button type="submit" isLoading={profileSaving}>
                                    Save Profile Preferences
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Security Block */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs flex flex-col gap-4">
                        <div className="flex flex-col gap-0.5 select-none">
                            <h2 className="text-base font-bold text-text-primary">Security Settings</h2>
                            <p className="text-xs text-text-secondary">Change your password credentials periodically to secure your wallet</p>
                        </div>

                        <form onSubmit={handleSaveSecurity} className="flex flex-col gap-4">
                            <Input
                                label="Current Account Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end border-t border-border-subtle pt-4">
                                <Button type="submit" variant="secondary" isLoading={securitySaving}>
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Columns (5/12): Theme & Developer APIs */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Appearance theme selection block */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs flex flex-col gap-4">
                        <div className="flex flex-col gap-0.5 select-none">
                            <h2 className="text-base font-bold text-text-primary">Appearance Mode</h2>
                            <p className="text-xs text-text-secondary">Toggle between light, dark, and auto system styling</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 pt-2">
                            {(['light', 'dark', 'system'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setAppearance(mode);
                                        toast.success(`Theme mode set to ${mode.toUpperCase()}`);
                                    }}
                                    className={cn(
                                        "py-3 border text-xs font-semibold rounded-xs transition-colors select-none cursor-pointer flex flex-col items-center gap-1.5 capitalize",
                                        appearance === mode
                                            ? "border-brand bg-brand-subtle text-brand"
                                            : "border-border-subtle bg-bg-base text-text-secondary hover:bg-bg-surface-hover"
                                    )}
                                >
                                    {mode === 'light' ? (
                                        <SunIcon size={20} />
                                    ) : mode === 'dark' ? (
                                        <MoonIcon size={20} />
                                    ) : (
                                        <ComputerIcon size={20} />
                                    )}
                                    <span>{mode}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Developer integration API credentials panel */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs flex flex-col gap-4">
                        <div className="flex flex-col gap-0.5 select-none">
                            <h2 className="text-base font-bold text-text-primary">Developer Credentials</h2>
                            <p className="text-xs text-text-secondary">Integrate Korak number purchasing into your marketing web applications</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-secondary select-none">Live Access API Token</label>
                            <div className="relative flex items-center">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={mockApiKey}
                                    readOnly
                                    className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-bg-base border border-border-subtle text-text-primary rounded-sm"
                                />

                                <div className="absolute right-2 flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="p-1 text-text-muted hover:text-text-primary cursor-pointer text-[10px] font-bold uppercase"
                                    >
                                        {showApiKey ? 'Hide' : 'Reveal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(mockApiKey, 'API Key')}
                                        className="p-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                                        title="Copy Token"
                                    >
                                        <CopyIcon size={12} />
                                    </button>
                                </div>
                            </div>
                            <span className="text-[10px] text-text-muted">Do not share your live secret token in public version control channels.</span>
                        </div>

                        {/* Reset Local Data for Desktop */}
                        <div className="border-t border-border-subtle pt-4 flex justify-between items-center">
                            <span className="text-xs text-text-secondary">Reset database state</span>
                            <Button variant="outline" className="text-error border-error-border hover:bg-error-bg text-xs font-bold" onClick={handleClearState}>
                                Reset Store
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            </div>
        </>
    );
}

Settings.layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
