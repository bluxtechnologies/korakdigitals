import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

interface GroupedSettings {
    general?: Record<string, any>;
    financial?: Record<string, any>;
    security?: Record<string, any>;
    notifications?: Record<string, any>;
}

export default function AdminGeneralSettings() {
    const { props } = usePage<any>();
    const initialSettings: GroupedSettings = props.settings || {};
    const toast = useToast();

    // General Group State
    const [siteName, setSiteName] = React.useState(initialSettings.general?.site_name || 'Korak Digitals');
    const [supportEmail, setSupportEmail] = React.useState(initialSettings.general?.support_email || 'support@korakdigital.com');
    const [supportPhone, setSupportPhone] = React.useState(initialSettings.general?.support_phone || '+234 800 000 0000');
    const [maintenanceMode, setMaintenanceMode] = React.useState(!!initialSettings.general?.maintenance_mode);
    const [savingGeneral, setSavingGeneral] = React.useState(false);

    // Financial Group State
    const [defaultCurrency, setDefaultCurrency] = React.useState(initialSettings.financial?.default_currency || 'NGN');
    const [minFunding, setMinFunding] = React.useState(String(initialSettings.financial?.min_wallet_funding || 500));
    const [maxFunding, setMaxFunding] = React.useState(String(initialSettings.financial?.max_wallet_funding || 1000000));
    const [fundingInstructions, setFundingInstructions] = React.useState(initialSettings.financial?.manual_funding_instructions || '');
    const [savingFinancial, setSavingFinancial] = React.useState(false);

    // Security Group State
    const [requireEmailVerification, setRequireEmailVerification] = React.useState(
        initialSettings.security?.require_email_verification !== false
    );
    const [maxLoginAttempts, setMaxLoginAttempts] = React.useState(String(initialSettings.security?.max_login_attempts || 5));
    const [sessionLifetime, setSessionLifetime] = React.useState(String(initialSettings.security?.session_lifetime_minutes || 120));
    const [savingSecurity, setSavingSecurity] = React.useState(false);

    // Notifications Group State
    const [adminNotifyEmail, setAdminNotifyEmail] = React.useState(initialSettings.notifications?.admin_notification_email || 'admin@korakdigital.com');
    const [notifyNewOrder, setNotifyNewOrder] = React.useState(initialSettings.notifications?.notify_on_new_order !== false);
    const [notifyFundingRequest, setNotifyFundingRequest] = React.useState(initialSettings.notifications?.notify_on_funding_request !== false);
    const [savingNotifications, setSavingNotifications] = React.useState(false);

    const handleSaveGroup = (groupName: string, settingsPayload: Record<string, any>, setSavingState: (s: boolean) => void) => {
        setSavingState(true);

        router.put('/admin/settings/general', {
            group: groupName,
            settings: settingsPayload,
        }, {
            onSuccess: () => {
                setSavingState(false);
                toast.success(`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} settings updated.`);
            },
            onError: (err: any) => {
                setSavingState(false);
                toast.error(err.message || `Failed to save ${groupName} settings.`);
            },
        });
    };

    return (
        <>
            <Head title="System Settings — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-text-primary">System Settings & Parameters</h1>
                    <p className="text-xs text-text-secondary">Configure global platform operations, financial rules, verification security, and alert notifications.</p>
                </div>

                {/* Section 1: Site & Brand Information */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Platform Brand & Customer Contact</h2>
                        <p className="text-xs text-text-muted">Public-facing brand identity, support contact endpoints, and emergency maintenance toggle.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveGroup('general', {
                                site_name: siteName,
                                support_email: supportEmail,
                                support_phone: supportPhone,
                                maintenance_mode: maintenanceMode,
                            }, setSavingGeneral);
                        }}
                        className="p-6 space-y-5 text-xs"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Platform Site Name"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                required
                            />

                            <Input
                                label="Customer Support Email"
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Customer Support Phone"
                                value={supportPhone}
                                onChange={(e) => setSupportPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
                            <input
                                type="checkbox"
                                id="maintenanceModeCheckbox"
                                className="checkbox-base"
                                checked={maintenanceMode}
                                onChange={(e) => setMaintenanceMode(e.target.checked)}
                            />
                            <label htmlFor="maintenanceModeCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                Enable Maintenance Mode (Temporarily disables storefront ordering)
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingGeneral}
                            >
                                Save General Settings
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Financial & Wallet Parameters */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Financial & Funding Parameters</h2>
                        <p className="text-xs text-text-muted">Thresholds for automated and manual wallet deposits, and customer bank transfer notes.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveGroup('financial', {
                                default_currency: defaultCurrency,
                                min_wallet_funding: parseFloat(minFunding),
                                max_wallet_funding: parseFloat(maxFunding),
                                manual_funding_instructions: fundingInstructions,
                            }, setSavingFinancial);
                        }}
                        className="p-6 space-y-5 text-xs"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Default Reference Currency (ISO)"
                                maxLength={3}
                                value={defaultCurrency}
                                onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                                required
                            />

                            <Input
                                label="Minimum Deposit Amount"
                                type="number"
                                step="1"
                                value={minFunding}
                                onChange={(e) => setMinFunding(e.target.value)}
                                required
                            />

                            <Input
                                label="Maximum Deposit Amount"
                                type="number"
                                step="1"
                                value={maxFunding}
                                onChange={(e) => setMaxFunding(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-primary mb-1">Manual Bank Deposit Instructions (Shown to customers)</label>
                            <textarea
                                className="textarea-base text-xs font-mono h-24"
                                value={fundingInstructions}
                                onChange={(e) => setFundingInstructions(e.target.value)}
                                placeholder="Bank transfer account details..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingFinancial}
                            >
                                Save Financial Settings
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 3: Security & Access Rules */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Security & Access Safeguards</h2>
                        <p className="text-xs text-text-muted">Account verification enforcement and session protection rules.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveGroup('security', {
                                require_email_verification: requireEmailVerification,
                                max_login_attempts: parseInt(maxLoginAttempts, 10),
                                session_lifetime_minutes: parseInt(sessionLifetime, 10),
                            }, setSavingSecurity);
                        }}
                        className="p-6 space-y-5 text-xs"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Max Failed Login Attempts Before Lockout"
                                type="number"
                                min="1"
                                max="20"
                                value={maxLoginAttempts}
                                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                                required
                            />

                            <Input
                                label="Session Timeout Duration (Minutes)"
                                type="number"
                                min="15"
                                max="1440"
                                value={sessionLifetime}
                                onChange={(e) => setSessionLifetime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
                            <input
                                type="checkbox"
                                id="emailVerificationCheckbox"
                                className="checkbox-base"
                                checked={requireEmailVerification}
                                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                            />
                            <label htmlFor="emailVerificationCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                Require Email Verification Before First Wallet Funding / Purchase
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingSecurity}
                            >
                                Save Security Settings
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 4: Notifications & Admin Alerts */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">System Alerts & Notifications</h2>
                        <p className="text-xs text-text-muted">Routing destinations for operational emails and administrative notifications.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveGroup('notifications', {
                                admin_notification_email: adminNotifyEmail,
                                notify_on_new_order: notifyNewOrder,
                                notify_on_funding_request: notifyFundingRequest,
                            }, setSavingNotifications);
                        }}
                        className="p-6 space-y-5 text-xs"
                    >
                        <Input
                            label="Administrative Alert Email Address"
                            type="email"
                            value={adminNotifyEmail}
                            onChange={(e) => setAdminNotifyEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-2 pt-1 border-t border-border-subtle">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="notifyOrderCheckbox"
                                    className="checkbox-base"
                                    checked={notifyNewOrder}
                                    onChange={(e) => setNotifyNewOrder(e.target.checked)}
                                />
                                <label htmlFor="notifyOrderCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Send Email Alert on New Order Failure / Exception
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="notifyFundingCheckbox"
                                    className="checkbox-base"
                                    checked={notifyFundingRequest}
                                    onChange={(e) => setNotifyFundingRequest(e.target.checked)}
                                />
                                <label htmlFor="notifyFundingCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Send Email Alert on New Manual Bank Transfer Funding Request
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingNotifications}
                            >
                                Save Notification Settings
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </>
    );
}

AdminGeneralSettings.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;