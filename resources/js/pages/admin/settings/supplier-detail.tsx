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

interface ServiceItem {
    id: number;
    name: string;
    category: string;
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
    service?: ServiceItem;
}

interface SupplierRecord {
    id: number;
    name: string;
    code: string;
    driver_class: string;
    is_active: boolean;
    credentials?: Record<string, any> | null;
    metadata?: Record<string, any> | null;
    supplier_services?: SupplierServiceRecord[];
}

export default function AdminSupplierDetail() {
    const { props } = usePage<any>();
    const supplier: SupplierRecord = props.supplier;
    const mappedServices: SupplierServiceRecord[] = supplier.supplier_services || [];
    const availableServices: ServiceItem[] = props.availableServices || [];
    const toast = useToast();

    // Supplier Info Form State
    const [name, setName] = React.useState(supplier.name);
    const [code, setCode] = React.useState(supplier.code);
    const [driverClass, setDriverClass] = React.useState(supplier.driver_class);
    const [isActive, setIsActive] = React.useState(supplier.is_active);
    const [credentialsJson, setCredentialsJson] = React.useState(
        supplier.credentials ? JSON.stringify(supplier.credentials, null, 2) : '{\n  "api_key": "",\n  "endpoint": ""\n}'
    );
    const [savingSupplier, setSavingSupplier] = React.useState(false);

    // Map New Service Modal State
    const [mapModalOpen, setMapModalOpen] = React.useState(false);
    const [selectedServiceId, setSelectedServiceId] = React.useState(
        availableServices.length > 0 ? String(availableServices[0].id) : ''
    );
    const [supplierSku, setSupplierSku] = React.useState('');
    const [supplierCost, setSupplierCost] = React.useState('0.50');
    const [costCurrency, setCostCurrency] = React.useState('USD');
    const [isAvailable, setIsAvailable] = React.useState(true);
    const [mappingService, setMappingService] = React.useState(false);

    // Edit Mapped Service Modal State
    const [editService, setEditService] = React.useState<SupplierServiceRecord | null>(null);
    const [editSku, setEditSku] = React.useState('');
    const [editCost, setEditCost] = React.useState('');
    const [editCurrency, setEditCurrency] = React.useState('USD');
    const [editAvailable, setEditAvailable] = React.useState(true);
    const [savingMappedService, setSavingMappedService] = React.useState(false);

    // Unmap Modal State
    const [unmapService, setUnmapService] = React.useState<SupplierServiceRecord | null>(null);
    const [unmapping, setUnmapping] = React.useState(false);

    const handleSaveSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSupplier(true);

        let parsedCredentials = null;
        try {
            if (credentialsJson.trim()) {
                parsedCredentials = JSON.parse(credentialsJson);
            }
        } catch (err) {
            setSavingSupplier(false);
            toast.error('Invalid JSON in Driver Credentials payload.');
            return;
        }

        router.put(`/admin/settings/suppliers/${supplier.id}`, {
            name,
            code,
            driver_class: driverClass,
            is_active: isActive,
            credentials: parsedCredentials,
        }, {
            onSuccess: () => {
                setSavingSupplier(false);
                toast.success('Supplier details and API credentials updated.');
            },
            onError: (err: any) => {
                setSavingSupplier(false);
                toast.error(err.message || 'Failed to update supplier.');
            },
        });
    };

    const handleToggleStatus = () => {
        router.post(`/admin/settings/suppliers/${supplier.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsActive(!isActive);
                toast.success('Supplier status updated.');
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to update status.');
            },
        });
    };

    const handleMapService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedServiceId) return;

        setMappingService(true);
        router.post(`/admin/settings/suppliers/${supplier.id}/services`, {
            service_id: parseInt(selectedServiceId, 10),
            supplier_sku: supplierSku,
            supplier_cost: parseFloat(supplierCost),
            cost_currency_code: costCurrency.toUpperCase(),
            is_available: isAvailable,
        }, {
            onSuccess: () => {
                setMappingService(false);
                setMapModalOpen(false);
                setSupplierSku('');
                toast.success('Service mapped to supplier.');
            },
            onError: (err: any) => {
                setMappingService(false);
                toast.error(err.message || 'Failed to map service.');
            },
        });
    };

    const handleOpenEditService = (ss: SupplierServiceRecord) => {
        setEditService(ss);
        setEditSku(ss.supplier_sku);
        setEditCost(ss.supplier_cost);
        setEditCurrency(ss.cost_currency_code);
        setEditAvailable(ss.is_available);
    };

    const handleSaveEditService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editService) return;

        setSavingMappedService(true);
        router.put(`/admin/settings/suppliers/${supplier.id}/services/${editService.id}`, {
            supplier_sku: editSku,
            supplier_cost: parseFloat(editCost),
            cost_currency_code: editCurrency.toUpperCase(),
            is_available: editAvailable,
        }, {
            onSuccess: () => {
                setSavingMappedService(false);
                setEditService(null);
                toast.success('Wholesale pricing updated.');
            },
            onError: (err: any) => {
                setSavingMappedService(false);
                toast.error(err.message || 'Failed to update pricing.');
            },
        });
    };

    const handleUnmapService = () => {
        if (!unmapService) return;
        setUnmapping(true);

        router.delete(`/admin/settings/suppliers/${supplier.id}/services/${unmapService.id}`, {
            onSuccess: () => {
                setUnmapping(false);
                setUnmapService(null);
                toast.success('Service mapping removed.');
            },
            onError: (err: any) => {
                setUnmapping(false);
                toast.error(err.message || 'Failed to remove service mapping.');
            },
        });
    };

    return (
        <>
            <Head title={`${supplier.name} — Integration Configuration`} />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header with Breadcrumb & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Link href="/admin/settings/suppliers" className="hover:text-brand transition-colors">
                                &larr; Back to Service Integrations
                            </Link>
                            <span>•</span>
                            <span className="font-mono text-brand font-medium">{supplier.code}</span>
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary flex items-center gap-2.5">
                            <span>{supplier.name}</span>
                            <Badge variant={supplier.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                {supplier.is_active ? 'Active Integration' : 'Disabled'}
                            </Badge>
                        </h1>
                    </div>

                    <Button
                        type="button"
                        variant={supplier.is_active ? 'secondary' : 'primary'}
                        className="text-xs"
                        onClick={handleToggleStatus}
                    >
                        {supplier.is_active ? 'Deactivate Supplier' : 'Activate Supplier'}
                    </Button>
                </div>

                {/* Section 1: Supplier Configuration & Credentials Form */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="text-sm font-semibold text-text-primary">Supplier Details & Driver Handler</h2>
                        <p className="text-xs text-text-muted">Configure company details, PHP driver class handler, and upstream API credentials.</p>
                    </div>

                    <form onSubmit={handleSaveSupplier} className="p-6 space-y-5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Supplier Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <Input
                                label="Unique Code Identifier"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>

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

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-text-primary">Driver API Credentials (JSON)</label>
                                <span className="text-[10px] text-text-muted">Structured payload parsed by driver class</span>
                            </div>
                            <textarea
                                className="textarea-base font-mono text-[11px] h-32"
                                value={credentialsJson}
                                onChange={(e) => setCredentialsJson(e.target.value)}
                                spellCheck={false}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={savingSupplier}
                            >
                                Save Configuration & Credentials
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Wholesale Mapped Services Matrix (Tier 1) */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">Wholesale Service Catalogue Mappings</h2>
                            <p className="text-xs text-text-muted">Platform services fulfilled through this supplier along with raw wholesale cost.</p>
                        </div>

                        {availableServices.length > 0 && (
                            <Button
                                variant="secondary"
                                className="text-xs flex items-center gap-1.5"
                                onClick={() => setMapModalOpen(true)}
                            >
                                <PlusIcon size={14} />
                                Map Service
                            </Button>
                        )}
                    </div>

                    {mappedServices.length === 0 ? (
                        <div className="p-10 text-center text-xs text-text-muted space-y-3">
                            <p>No platform services are currently mapped to this supplier.</p>
                            {availableServices.length > 0 && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setMapModalOpen(true)}
                                >
                                    Map First Service
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Service Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Supplier SKU</th>
                                        <th className="px-6 py-3 text-right font-mono">Wholesale Cost</th>
                                        <th className="px-6 py-3">Availability</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {mappedServices.map((ss) => (
                                        <tr key={ss.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-medium text-text-primary">
                                                {ss.service?.name || `Service #${ss.service_id}`}
                                            </td>
                                            <td className="px-6 py-3 capitalize text-text-muted">
                                                {ss.service?.category || '—'}
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
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2 py-1"
                                                        onClick={() => handleOpenEditService(ss)}
                                                    >
                                                        Edit Price
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2 py-1 text-error hover:bg-error-bg hover:text-error"
                                                        onClick={() => setUnmapService(ss)}
                                                    >
                                                        Unmap
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Map New Service Modal */}
                {mapModalOpen && (
                    <Modal
                        isOpen={mapModalOpen}
                        onClose={() => setMapModalOpen(false)}
                        title={`Map Catalogue Service to ${supplier.name}`}
                    >
                        <form onSubmit={handleMapService} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Select Service</label>
                                <Select
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    options={availableServices.map((s) => ({
                                        value: String(s.id),
                                        label: `${s.name} (${s.category})`,
                                    }))}
                                />
                            </div>

                            <Input
                                label="Supplier Provider SKU / Identifier"
                                placeholder="e.g. tg_otp_us, ig_followers_v1"
                                value={supplierSku}
                                onChange={(e) => setSupplierSku(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Wholesale Cost"
                                    type="number"
                                    step="0.0001"
                                    value={supplierCost}
                                    onChange={(e) => setSupplierCost(e.target.value)}
                                    required
                                />

                                <Input
                                    label="Cost Currency (3 Letters)"
                                    maxLength={3}
                                    value={costCurrency}
                                    onChange={(e) => setCostCurrency(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="serviceAvailableCheckbox"
                                    className="checkbox-base"
                                    checked={isAvailable}
                                    onChange={(e) => setIsAvailable(e.target.checked)}
                                />
                                <label htmlFor="serviceAvailableCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Service is Available & Routable
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setMapModalOpen(false)}
                                    disabled={mappingService}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={mappingService}
                                >
                                    Map Service
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Edit Mapped Service Modal */}
                {editService && (
                    <Modal
                        isOpen={!!editService}
                        onClose={() => setEditService(null)}
                        title={`Edit Wholesale Pricing: ${editService.service?.name || 'Service'}`}
                    >
                        <form onSubmit={handleSaveEditService} className="space-y-4 text-xs">
                            <Input
                                label="Supplier Provider SKU / Identifier"
                                value={editSku}
                                onChange={(e) => setEditSku(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Wholesale Cost"
                                    type="number"
                                    step="0.0001"
                                    value={editCost}
                                    onChange={(e) => setEditCost(e.target.value)}
                                    required
                                />

                                <Input
                                    label="Cost Currency"
                                    maxLength={3}
                                    value={editCurrency}
                                    onChange={(e) => setEditCurrency(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="editAvailableCheckbox"
                                    className="checkbox-base"
                                    checked={editAvailable}
                                    onChange={(e) => setEditAvailable(e.target.checked)}
                                />
                                <label htmlFor="editAvailableCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Service is In-Stock & Routable
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setEditService(null)}
                                    disabled={savingMappedService}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={savingMappedService}
                                >
                                    Save Wholesale Pricing
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Unmap Service Confirmation Modal */}
                {unmapService && (
                    <Modal
                        isOpen={!!unmapService}
                        onClose={() => setUnmapService(null)}
                        title={`Unmap Service: ${unmapService.service?.name || 'Service'}`}
                    >
                        <div className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                Are you sure you want to remove <strong className="text-text-primary">{unmapService.service?.name || 'this service'}</strong> from <strong className="text-text-primary">{supplier.name}</strong>? Orders for this service will route to other available suppliers.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setUnmapService(null)}
                                    disabled={unmapping}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleUnmapService}
                                    isLoading={unmapping}
                                >
                                    Confirm Unmap
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminSupplierDetail.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;