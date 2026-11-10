import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface SupplierItem {
    id: number;
    name: string;
    code: string;
}

interface SupplierServiceRecord {
    id: number;
    supplier_id: number;
    service_id: number;
    supplier_sku: string;
    supplier_cost: string;
    cost_currency_code: string;
    is_available: boolean;
    created_at: string;
    supplier?: SupplierItem;
}

interface ServiceRecord {
    id: number;
    category: string;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    metadata?: Record<string, any> | null;
    supplier_services?: SupplierServiceRecord[];
}

export default function AdminServiceEdit() {
    const { props } = usePage<any>();
    const service: ServiceRecord = props.service;
    const connectedSuppliers: SupplierServiceRecord[] = service.supplier_services || [];
    const stats = props.stats || {};
    const toast = useToast();

    // Service Info Form State
    const [name, setName] = React.useState(service.name);
    const [code, setCode] = React.useState(service.code);
    const [category, setCategory] = React.useState(service.category);
    const [description, setDescription] = React.useState(service.description || '');
    const [isActive, setIsActive] = React.useState(service.is_active);
    const [metadataJson, setMetadataJson] = React.useState(
        service.metadata ? JSON.stringify(service.metadata, null, 2) : '{\n  "featured": false\n}'
    );
    const [savingService, setSavingService] = React.useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    const handleSaveService = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingService(true);

        let parsedMetadata = null;
        try {
            if (metadataJson.trim()) {
                parsedMetadata = JSON.parse(metadataJson);
            }
        } catch (err) {
            setSavingService(false);
            toast.error('Invalid JSON in Service Metadata payload.');
            return;
        }

        router.put(`/admin/services/${service.id}`, {
            name,
            code,
            category,
            description,
            is_active: isActive,
            metadata: parsedMetadata,
        }, {
            onSuccess: () => {
                setSavingService(false);
                toast.success('Service catalogue details updated.');
            },
            onError: (err: any) => {
                setSavingService(false);
                toast.error(err.message || 'Failed to update service.');
            },
        });
    };

    const handleToggleStatus = () => {
        router.post(`/admin/services/${service.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsActive(!isActive);
                toast.success('Service status updated.');
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to toggle status.');
            },
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/admin/services/${service.id}`, {
            onSuccess: () => {
                setDeleting(false);
                setDeleteModalOpen(false);
                toast.success('Service deleted or deactivated.');
            },
            onError: (err: any) => {
                setDeleting(false);
                toast.error(err.message || 'Failed to delete service.');
            },
        });
    };

    return (
        <>
            <Head title={`${service.name} — Service Details`} />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header with Breadcrumb & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Link href="/admin/services" className="hover:text-brand transition-colors">
                                &larr; Back to Catalogue
                            </Link>
                            <span>•</span>
                            <span className="capitalize font-medium text-text-primary">{service.category}</span>
                            <span>•</span>
                            <span className="font-mono text-brand font-medium">{service.code}</span>
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary flex items-center gap-2.5">
                            <span>{service.name}</span>
                            <Badge variant={service.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                {service.is_active ? 'Active in Storefront' : 'Disabled'}
                            </Badge>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={service.is_active ? 'secondary' : 'primary'}
                            className="text-xs"
                            onClick={handleToggleStatus}
                        >
                            {service.is_active ? 'Deactivate Service' : 'Activate Service'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-xs text-error hover:bg-error-bg hover:text-error"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stat summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md">
                        <span className="text-xs text-text-muted font-medium">Connected Wholesale Sources</span>
                        <div className="text-2xl font-bold text-text-primary mt-1">{connectedSuppliers.length}</div>
                        <p className="text-[11px] text-text-muted mt-0.5">{stats.activeSuppliers || 0} currently marked in-stock and routable</p>
                    </div>
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md">
                        <span className="text-xs text-text-muted font-medium">Total Customer Order Items</span>
                        <div className="text-2xl font-bold text-text-primary mt-1">{stats.totalOrders || 0}</div>
                        <p className="text-[11px] text-text-muted mt-0.5">Historical order volume fulfilled</p>
                    </div>
                </div>

                {/* Section 1: Service Configuration Form (Merged View+Edit) */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Service Catalogue Properties</h2>
                        <p className="text-xs text-text-muted">Edit service naming, category classification, customer-facing description, and metadata.</p>
                    </div>

                    <form onSubmit={handleSaveService} className="p-6 space-y-5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Category</label>
                                <Select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    options={[
                                        { value: 'numbers', label: 'Virtual Numbers' },
                                        { value: 'growth', label: 'Social Growth' },
                                        { value: 'vpn', label: 'VPN Access' },
                                        { value: 'esim', label: 'eSIM Data' },
                                        { value: 'airtime', label: 'Airtime' },
                                        { value: 'accounts', label: 'Accounts' },
                                    ]}
                                />
                            </div>

                            <Input
                                label="Unique Code Identifier"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>

                        <Input
                            label="Service Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-xs font-medium text-text-primary mb-1">Customer-Facing Description</label>
                            <textarea
                                className="textarea-base text-xs h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-text-primary">Configuration Metadata (JSON)</label>
                                <span className="text-[10px] text-text-muted">Structured options like provider parameters</span>
                            </div>
                            <textarea
                                className="textarea-base font-mono text-[11px] h-28"
                                value={metadataJson}
                                onChange={(e) => setMetadataJson(e.target.value)}
                                spellCheck={false}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingService}
                            >
                                Save Service Properties
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Connected Wholesale Suppliers (Tier 1 Integration) */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">Connected Wholesale Supplier Sources</h2>
                            <p className="text-xs text-text-muted">Wholesale suppliers providing fulfillment for this service and their comparative wholesale costs.</p>
                        </div>

                        <Link
                            href="/admin/settings/suppliers"
                            className="text-xs text-brand hover:underline"
                        >
                            Manage Suppliers &rarr;
                        </Link>
                    </div>

                    {connectedSuppliers.length === 0 ? (
                        <div className="p-10 text-center text-xs text-text-muted space-y-2">
                            <p>No wholesale supplier has been mapped to fulfill this service yet.</p>
                            <Link
                                href="/admin/settings/suppliers"
                                className="inline-flex items-center text-xs text-brand font-medium hover:underline"
                            >
                                Go to Wholesale Suppliers to map this service &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Supplier Name</th>
                                        <th className="px-6 py-3">Supplier SKU</th>
                                        <th className="px-6 py-3 text-right font-mono">Wholesale Cost</th>
                                        <th className="px-6 py-3">Stock Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {connectedSuppliers.map((ss) => (
                                        <tr key={ss.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/admin/settings/suppliers/${ss.supplier_id}`}
                                                    className="font-medium text-text-primary hover:text-brand transition-colors"
                                                >
                                                    {ss.supplier?.name || `Supplier #${ss.supplier_id}`}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 font-mono font-medium text-brand">
                                                {ss.supplier_sku}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-semibold text-text-primary">
                                                {ss.cost_currency_code} {Number(ss.supplier_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={ss.is_available ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                                    {ss.is_available ? 'In Stock' : 'Out of Stock'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/settings/suppliers/${ss.supplier_id}`}
                                                    className="inline-flex items-center px-2 py-1 text-xs text-text-secondary hover:text-brand"
                                                >
                                                    Edit Supplier &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <Modal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        title={`Delete Service: ${service.name}`}
                    >
                        <div className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                Are you sure you want to delete <strong className="text-text-primary">{service.name}</strong>? If historical orders exist for this service, it will be deactivated instead of permanently deleted to protect order audit history.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleDelete}
                                    isLoading={deleting}
                                >
                                    Confirm Delete
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminServiceEdit.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;