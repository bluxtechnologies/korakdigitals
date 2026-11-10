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

interface SupplierRecord {
    id: number;
    name: string;
    code: string;
    driver_class: string;
    is_active: boolean;
    supplier_services_count: number;
    created_at: string;
}

export default function AdminSuppliersIndex() {
    const { props } = usePage<any>();
    const suppliersPage = props.suppliers || {};
    const suppliersList: SupplierRecord[] = suppliersPage.data || [];
    const links: PaginationLink[] = suppliersPage.links || [];
    const filters = props.filters || {};
    const toast = useToast();

    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || 'all');
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [code, setCode] = React.useState('');
    const [driverClass, setDriverClass] = React.useState('App\\Domain\\Services\\Drivers\\MockSupplierDriver');
    const [isActive, setIsActive] = React.useState(true);
    const [creating, setCreating] = React.useState(false);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: search || undefined,
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

        router.get('/admin/settings/suppliers', query, {
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

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        applyFilters({ status: newStatus });
    };

    const handleSort = (column: string) => {
        const isCurrent = filters.sort === column;
        const newDirection = isCurrent && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: column, direction: newDirection });
    };

    const handleToggleStatus = (supplier: SupplierRecord) => {
        router.post(`/admin/settings/suppliers/${supplier.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Supplier '${supplier.name}' status updated.`);
            },
            onError: (err: any) => {
                toast.error(err.message || 'Status toggle failed.');
            },
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        router.post('/admin/settings/suppliers', {
            name,
            code,
            driver_class: driverClass,
            is_active: isActive,
        }, {
            onSuccess: () => {
                setCreating(false);
                setCreateModalOpen(false);
                setName('');
                setCode('');
                toast.success('Supplier created successfully.');
            },
            onError: (err: any) => {
                setCreating(false);
                toast.error(err.message || 'Failed to create supplier.');
            },
        });
    };

    const renderSortArrow = (column: string) => {
        if (filters.sort !== column) {
            return <span className="opacity-30 ml-1">↕</span>;
        }
        return <span className="text-brand ml-1">{filters.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <>
            <Head title="Service Integrations — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Service Integrations & Adapters</h1>
                        <p className="text-xs text-text-secondary">Manage upstream fulfillment adapters, API connections, and automated service routing.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-56">
                            <Input
                                placeholder="Search integrations…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="w-32">
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Disabled' },
                                ]}
                            />
                        </div>

                        <Button
                            variant="primary"
                            className="text-xs flex items-center gap-1.5"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            <PlusIcon size={14} />
                            Register Integration
                        </Button>
                    </div>
                </div>

                {/* Suppliers Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {suppliersList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No suppliers found matching the selected filters.
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
                                            Integration Name {renderSortArrow('name')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('code')}
                                        >
                                            Code Identifier {renderSortArrow('code')}
                                        </th>
                                        <th className="px-6 py-3">Driver Handler</th>
                                        <th className="px-6 py-3 text-center">Mapped Services</th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('is_active')}
                                        >
                                            Status {renderSortArrow('is_active')}
                                        </th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {suppliersList.map((sup) => (
                                        <tr key={sup.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/admin/settings/suppliers/${sup.id}`}
                                                    className="font-medium text-text-primary hover:text-brand transition-colors"
                                                >
                                                    {sup.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-brand font-medium">
                                                {sup.code}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted">
                                                {sup.driver_class.split('\\').pop()}
                                            </td>
                                            <td className="px-6 py-3 text-center font-mono font-medium text-text-primary">
                                                {sup.supplier_services_count || 0}
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleToggleStatus(sup)}
                                                    className="cursor-pointer"
                                                    title="Click to toggle active status"
                                                >
                                                    <Badge variant={sup.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                                        {sup.is_active ? 'Active' : 'Disabled'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/settings/suppliers/${sup.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                >
                                                    Configure & Services &rarr;
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

                {/* Register Supplier Modal */}
                {createModalOpen && (
                    <Modal
                        isOpen={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        title="Register New Wholesale Supplier"
                    >
                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            <Input
                                label="Supplier Company / Service Name"
                                placeholder="e.g. 5sim Virtual Numbers"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!code) {
                                        setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                                    }
                                }}
                                required
                            />

                            <Input
                                label="System Identifier Code"
                                placeholder="e.g. fivesim"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Integration Driver Class</label>
                                <Select
                                    value={driverClass}
                                    onChange={(e) => setDriverClass(e.target.value)}
                                    options={[
                                        { value: 'App\\Domain\\Services\\Drivers\\MockSupplierDriver', label: 'MockSupplierDriver (Simulation / Test)' },
                                        { value: 'App\\Domain\\Services\\Drivers\\FiveSimDriver', label: 'FiveSimDriver (Virtual OTP Numbers)' },
                                        { value: 'App\\Domain\\Services\\Drivers\\SmmPanelDriver', label: 'SmmPanelDriver (Social Growth APIs)' },
                                    ]}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="supplierActiveCheckbox"
                                    className="checkbox-base"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <label htmlFor="supplierActiveCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Supplier is Active & Routing Orders
                                </label>
                            </div>

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
                                    Register & Configure
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminSuppliersIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;

