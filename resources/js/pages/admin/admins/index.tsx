import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PlusIcon } from '@/components/ui/Icons';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
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

export default function AdminStaffIndex() {
    const { props } = usePage<any>();
    const adminsPage = props.administrators || {};
    const adminsList: AdminUserRecord[] = adminsPage.data || [];
    const links: PaginationLink[] = adminsPage.links || [];
    const currentAdminId: number = props.currentAdminId;
    const filters = props.filters || {};
    const toast = useToast();

    const [search, setSearch] = React.useState(filters.search || '');
    const [role, setRole] = React.useState(filters.role || 'all');
    const [status, setStatus] = React.useState(filters.status || 'all');

    // Create Modal State
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [adminRole, setAdminRole] = React.useState('admin');
    const [password, setPassword] = React.useState('');
    const [adminStatus, setAdminStatus] = React.useState('active');
    const [creating, setCreating] = React.useState(false);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: search || undefined,
            role: role !== 'all' ? role : undefined,
            status: status !== 'all' ? status : undefined,
            sort: filters.sort,
            direction: filters.direction,
            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '' || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get('/admin/administrators', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ search: value });
        }, 400);
    };

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        applyFilters({ role: newRole });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        applyFilters({ status: newStatus });
    };

    const handleSort = (column: string) => {
        const isCurrent = filters.sort === column;
        const newDirection = isCurrent && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: column, direction: newDirection });
    };

    const handleToggleStatus = (adminUser: AdminUserRecord) => {
        if (adminUser.id === currentAdminId) {
            toast.error('You cannot deactivate your own active account session.');
            return;
        }

        router.post(`/admin/administrators/${adminUser.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Administrator '${adminUser.name}' status updated.`);
            },
            onError: (err: any) => {
                toast.error(err.message || 'Status toggle failed.');
            },
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        router.post('/admin/administrators', {
            name,
            email,
            phone: phone || null,
            role: adminRole,
            password,
            status: adminStatus,
        }, {
            onSuccess: () => {
                setCreating(false);
                setCreateModalOpen(false);
                setName('');
                setEmail('');
                setPhone('');
                setPassword('');
                toast.success('Administrator account created successfully.');
            },
            onError: (err: any) => {
                setCreating(false);
                toast.error(err.message || 'Failed to create administrator.');
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

    const renderSortArrow = (column: string) => {
        if (filters.sort !== column) {
            return <span className="opacity-30 ml-1">↕</span>;
        }
        return <span className="text-brand ml-1">{filters.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <>
            <Head title="Admin Staff & RBAC — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Administrator Staff Directory</h1>
                        <p className="text-xs text-text-secondary">Manage platform operators, role-based access permissions, and administrative credentials.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-56">
                            <Input
                                placeholder="Search name, email, phone…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="w-32">
                            <Select
                                value={role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Roles' },
                                    { value: 'super_admin', label: 'Super Admin' },
                                    { value: 'admin', label: 'Administrator' },
                                    { value: 'support_agent', label: 'Support Agent' },
                                ]}
                            />
                        </div>

                        <div className="w-32">
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'suspended', label: 'Suspended' },
                                ]}
                            />
                        </div>

                        <Button
                            variant="primary"
                            className="text-xs flex items-center gap-1.5"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            <PlusIcon size={14} />
                            Add Staff Member
                        </Button>
                    </div>
                </div>

                {/* Administrators Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {adminsList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No administrator accounts found matching the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            Staff Name {renderSortArrow('name')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('email')}
                                        >
                                            Email Address {renderSortArrow('email')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('role')}
                                        >
                                            Role {renderSortArrow('role')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status {renderSortArrow('status')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('last_login_at')}
                                        >
                                            Last Active {renderSortArrow('last_login_at')}
                                        </th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {adminsList.map((adm) => (
                                        <tr key={adm.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/admin/administrators/${adm.id}`}
                                                    className="font-medium text-text-primary hover:text-brand transition-colors flex items-center gap-2"
                                                >
                                                    <span>{adm.name}</span>
                                                    {adm.id === currentAdminId && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-brand-subtle text-brand font-semibold">
                                                            You
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-text-primary">
                                                {adm.email}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={roleBadgeVariant(adm.role)} className="text-[10px] capitalize font-bold">
                                                    {adm.role.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleToggleStatus(adm)}
                                                    disabled={adm.id === currentAdminId}
                                                    className={adm.id === currentAdminId ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                                                    title={adm.id === currentAdminId ? 'Current active session' : 'Click to toggle status'}
                                                >
                                                    <Badge variant={statusBadgeVariant(adm.status)} dot className="text-[10px] capitalize">
                                                        {adm.status}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                                                {adm.last_login_at
                                                    ? new Date(adm.last_login_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                                    : 'Never logged in'
                                                }
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/administrators/${adm.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                >
                                                    Configure &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                    link.active
                                        ? 'bg-brand text-brand-foreground border-brand font-medium'
                                        : link.url
                                        ? 'border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                                        : 'border-border-subtle text-text-muted cursor-not-allowed opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Register Admin Modal */}
                {createModalOpen && (
                    <Modal
                        isOpen={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        title="Register New Administrator"
                    >
                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            <Input
                                label="Staff Full Name"
                                placeholder="e.g. Alexander Vance"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="alex@cipher.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <Input
                                    label="Phone (Optional)"
                                    placeholder="+234 800 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Access Role</label>
                                    <Select
                                        value={adminRole}
                                        onChange={(e) => setAdminRole(e.target.value)}
                                        options={[
                                            { value: 'super_admin', label: 'Super Admin (Full Root)' },
                                            { value: 'admin', label: 'Administrator (Operations)' },
                                            { value: 'support_agent', label: 'Support Agent (Read / Orders)' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Initial Status</label>
                                    <Select
                                        value={adminStatus}
                                        onChange={(e) => setAdminStatus(e.target.value)}
                                        options={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' },
                                            { value: 'suspended', label: 'Suspended' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <Input
                                label="Temporary Password (Min 8 Chars)"
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setCreateModalOpen(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={creating}
                                >
                                    Create Staff Account
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminStaffIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;