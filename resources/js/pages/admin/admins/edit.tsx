import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface AuditLogRecord {
    id: number;
    action: string;
    target_type?: string;
    target_id?: number;
    reference?: string;
    reason?: string;
    ip_address?: string;
    created_at: string;
}

interface AdminUserRecord {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    last_login_at?: string;
    last_login_ip?: string;
    created_at: string;
}

export default function AdminStaffEdit() {
    const { props } = usePage<any>();
    const adminUser: AdminUserRecord = props.adminUser;
    const currentAdminId: number = props.currentAdminId;
    const recentActivity: AuditLogRecord[] = props.recentActivity || [];
    const toast = useToast();

    const isSelf = adminUser.id === currentAdminId;

    // Form State
    const [name, setName] = React.useState(adminUser.name);
    const [email, setEmail] = React.useState(adminUser.email);
    const [phone, setPhone] = React.useState(adminUser.phone || '');
    const [role, setRole] = React.useState(adminUser.role);
    const [status, setStatus] = React.useState(adminUser.status);
    const [newPassword, setNewPassword] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    // Deactivate Modal State
    const [deactivateModalOpen, setDeactivateModalOpen] = React.useState(false);
    const [deactivating, setDeactivating] = React.useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: Record<string, any> = {
            name,
            email,
            phone: phone || null,
            role,
            status,
        };

        if (newPassword.trim()) {
            payload.password = newPassword;
        }

        router.put(`/admin/administrators/${adminUser.id}`, payload, {
            onSuccess: () => {
                setSaving(false);
                setNewPassword('');
                toast.success(`Administrator '${name}' updated successfully.`);
            },
            onError: (err: any) => {
                setSaving(false);
                toast.error(err.message || 'Failed to update administrator.');
            },
        });
    };

    const handleToggleStatus = () => {
        if (isSelf) {
            toast.error('You cannot deactivate your own active account session.');
            return;
        }

        router.post(`/admin/administrators/${adminUser.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                const updated = status === 'active' ? 'inactive' : 'active';
                setStatus(updated);
                toast.success(`Status updated to ${updated}.`);
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to toggle status.');
            },
        });
    };

    const handleDeactivate = () => {
        if (isSelf) {
            toast.error('You cannot deactivate your own active account.');
            return;
        }

        setDeactivating(true);
        router.delete(`/admin/administrators/${adminUser.id}`, {
            onSuccess: () => {
                setDeactivating(false);
                setDeactivateModalOpen(false);
                toast.success(`Administrator '${adminUser.name}' deactivated.`);
            },
            onError: (err: any) => {
                setDeactivating(false);
                toast.error(err.message || 'Failed to deactivate account.');
            },
        });
    };

    const roleBadgeVariant = (r: string) => {
        switch (r) {
            case 'super_admin':
                return 'primary';
            case 'admin':
                return 'success';
            case 'support_agent':
                return 'warning';
            default:
                return 'neutral';
        }
    };

    const statusBadgeVariant = (st: string) => {
        switch (st) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'neutral';
            case 'suspended':
                return 'error';
            default:
                return 'neutral';
        }
    };

    return (
        <>
            <Head title={`${adminUser.name} — Staff Configuration`} />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header with Breadcrumb & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Link href="/admin/administrators" className="hover:text-brand transition-colors">
                                &larr; Back to Staff Directory
                            </Link>
                            <span>•</span>
                            <span className="font-mono text-brand font-medium">#{adminUser.id}</span>
                            {isSelf && (
                                <>
                                    <span>•</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-brand-subtle text-brand font-semibold">
                                        Your Active Profile
                                    </span>
                                </>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary flex items-center gap-2.5">
                            <span>{adminUser.name}</span>
                            <Badge variant={roleBadgeVariant(adminUser.role)} className="text-[10px] capitalize font-bold">
                                {adminUser.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={statusBadgeVariant(adminUser.status)} dot className="text-[10px] capitalize">
                                {adminUser.status}
                            </Badge>
                        </h1>
                    </div>

                    {!isSelf && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={status === 'active' ? 'secondary' : 'primary'}
                                className="text-xs"
                                onClick={handleToggleStatus}
                            >
                                {status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-xs text-error hover:bg-error-bg hover:text-error"
                                onClick={() => setDeactivateModalOpen(true)}
                            >
                                Suspend Staff
                            </Button>
                        </div>
                    )}
                </div>

                {/* Session Snapshot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md">
                        <span className="text-xs text-text-muted font-medium">Last Login Timestamp</span>
                        <div className="text-sm font-mono font-semibold text-text-primary mt-1">
                            {adminUser.last_login_at
                                ? new Date(adminUser.last_login_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })
                                : 'Never'
                            }
                        </div>
                    </div>
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md">
                        <span className="text-xs text-text-muted font-medium">Last Login IP Address</span>
                        <div className="text-sm font-mono font-semibold text-brand mt-1">
                            {adminUser.last_login_ip || 'N/A'}
                        </div>
                    </div>
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md">
                        <span className="text-xs text-text-muted font-medium">Account Created</span>
                        <div className="text-sm font-mono font-semibold text-text-primary mt-1">
                            {new Date(adminUser.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                        </div>
                    </div>
                </div>

                {/* Section 1: Staff Profile & Credentials Form (Merged View+Edit) */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Staff Profile & RBAC Permissions</h2>
                        <p className="text-xs text-text-muted">Update administrative contact information, role access tier, and login credentials.</p>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Staff Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <Input
                                label="Email Address (Login Username)"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Phone Number"
                                placeholder="+234 800 000 0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Access Role</label>
                                <Select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    disabled={isSelf && adminUser.role === 'super_admin'}
                                    options={[
                                        { value: 'super_admin', label: 'Super Admin (Full Root)' },
                                        { value: 'admin', label: 'Administrator (Operations)' },
                                        { value: 'support_agent', label: 'Support Agent (Read / Orders)' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Account Status</label>
                                <Select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={isSelf}
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive (Disabled)' },
                                        { value: 'suspended', label: 'Suspended' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border-subtle">
                            <Input
                                label="Reset Password (Leave blank to keep existing password unchanged)"
                                type="password"
                                placeholder="New password (minimum 8 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={saving}
                            >
                                Save Administrator Profile
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Recent Security & Operation Audit Trail */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Recent Administrative Actions Log</h2>
                        <p className="text-xs text-text-muted">Audit trail of security and configuration changes performed by this operator.</p>
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="p-10 text-center text-xs text-text-muted">
                            No recent administrative actions recorded for this operator.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">Action Executed</th>
                                        <th className="px-6 py-3">Reference / Target</th>
                                        <th className="px-6 py-3">Reason / Context</th>
                                        <th className="px-6 py-3 font-mono">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {recentActivity.map((act) => (
                                        <tr key={act.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                                                {new Date(act.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-6 py-3 font-mono font-medium text-text-primary">
                                                {act.action}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-brand font-medium">
                                                {act.reference || '—'}
                                            </td>
                                            <td className="px-6 py-3 text-text-secondary max-w-xs truncate" title={act.reason || ''}>
                                                {act.reason || '—'}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted">
                                                {act.ip_address || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Deactivate Modal */}
                {deactivateModalOpen && (
                    <Modal
                        isOpen={deactivateModalOpen}
                        onClose={() => setDeactivateModalOpen(false)}
                        title={`Deactivate Staff Account: ${adminUser.name}`}
                    >
                        <div className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                Are you sure you want to deactivate <strong className="text-text-primary">{adminUser.name}</strong>? Their session will be revoked immediately and they will not be able to log in to the admin suite.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setDeactivateModalOpen(false)}
                                    disabled={deactivating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleDeactivate}
                                    isLoading={deactivating}
                                >
                                    Confirm Deactivation
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminStaffEdit.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;