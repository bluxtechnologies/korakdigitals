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

interface ServiceRecord {
    id: number;
    category: string;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    supplier_services_count: number;
    created_at: string;
}

export default function AdminServicesIndex() {
    const { props } = usePage<any>();
    const servicesPage = props.services || {};
    const servicesList: ServiceRecord[] = servicesPage.data || [];
    const links: PaginationLink[] = servicesPage.links || [];
    const categoryCounts: Record<string, number> = props.categoryCounts || {};
    const filters = props.filters || {};
    const toast = useToast();

    const [search, setSearch] = React.useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(filters.category || 'all');
    const [status, setStatus] = React.useState(filters.status || 'all');

    // Create Service Modal
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [code, setCode] = React.useState('');
    const [category, setCategory] = React.useState('numbers');
    const [description, setDescription] = React.useState('');
    const [isActive, setIsActive] = React.useState(true);
    const [creating, setCreating] = React.useState(false);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const categories = [
        { id: 'all', label: 'All Services', count: categoryCounts.all || 0 },
        { id: 'numbers', label: 'Virtual Numbers', count: categoryCounts.numbers || 0 },
        { id: 'growth', label: 'Social Growth', count: categoryCounts.growth || 0 },
        { id: 'vpn', label: 'VPN Access', count: categoryCounts.vpn || 0 },
        { id: 'esim', label: 'eSIM Data', count: categoryCounts.esim || 0 },
        { id: 'airtime', label: 'Airtime', count: categoryCounts.airtime || 0 },
        { id: 'accounts', label: 'Accounts', count: categoryCounts.accounts || 0 },
    ];

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: search || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
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

        router.get('/admin/services', query, {
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

    const handleCategoryClick = (catId: string) => {
        setSelectedCategory(catId);
        applyFilters({ category: catId });
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

    const handleToggleStatus = (service: ServiceRecord) => {
        router.post(`/admin/services/${service.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Service '${service.name}' status updated.`);
            },
            onError: (err: any) => {
                toast.error(err.message || 'Status toggle failed.');
            },
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        router.post('/admin/services', {
            name,
            code,
            category,
            description,
            is_active: isActive,
        }, {
            onSuccess: () => {
                setCreating(false);
                setCreateModalOpen(false);
                setName('');
                setCode('');
                setDescription('');
                toast.success('Service created successfully.');
            },
            onError: (err: any) => {
                setCreating(false);
                toast.error(err.message || 'Failed to create service.');
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
            <Head title="Service Catalogue — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Digital Service Catalogue</h1>
                        <p className="text-xs text-text-secondary">Manage platform services catalogue, categorisation, availability, and fulfillment routing.</p>
                    </div>

                    <Button
                        variant="primary"
                        className="text-xs flex items-center gap-1.5"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <PlusIcon size={14} />
                        Add New Service
                    </Button>
                </div>

                {/* Service Availability Notice */}
                <div className="p-3 bg-brand-subtle border border-brand/20 rounded-md text-xs text-text-secondary flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                        <span>
                            <strong className="text-text-primary">System Notice:</strong> Disabling any service here immediately hides it from customer storefronts and strictly rejects newly submitted purchase transactions at the backend layer.
                        </span>
                    </div>
                </div>

                {/* Category Tabs & Search Bar */}
                <div className="space-y-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border-subtle">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
                                    selectedCategory === cat.id
                                        ? 'bg-brand text-brand-foreground'
                                        : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                                }`}
                            >
                                <span>{cat.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-bg-base text-text-muted'
                                }`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="w-full sm:w-72">
                            <Input
                                placeholder="Search service name, code, description…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="w-36">
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active Only' },
                                    { value: 'inactive', label: 'Disabled Only' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {servicesList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No services found matching the selected filters.
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
                                            Service Name {renderSortArrow('name')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('category')}
                                        >
                                            Category {renderSortArrow('category')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('code')}
                                        >
                                            Code Identifier {renderSortArrow('code')}
                                        </th>
                                        <th className="px-6 py-3 text-center">Connected Integrations</th>
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
                                    {servicesList.map((srv) => (
                                        <tr key={srv.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/admin/services/${srv.id}`}
                                                    className="flex flex-col group w-fit"
                                                >
                                                    <span className="font-medium text-text-primary group-hover:text-brand transition-colors">
                                                        {srv.name}
                                                    </span>
                                                    {srv.description && (
                                                        <span className="text-[11px] text-text-muted line-clamp-1 max-w-xs">
                                                            {srv.description}
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 capitalize font-medium text-text-primary">
                                                {srv.category}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-brand font-medium">
                                                {srv.code}
                                            </td>
                                            <td className="px-6 py-3 text-center font-mono font-medium text-text-primary">
                                                {srv.supplier_services_count || 0}
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleToggleStatus(srv)}
                                                    className="cursor-pointer"
                                                    title="Click to toggle status"
                                                >
                                                    <Badge variant={srv.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                                        {srv.is_active ? 'Active' : 'Disabled'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/services/${srv.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                >
                                                    Manage Service &rarr;
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

                {/* Register Service Modal */}
                {createModalOpen && (
                    <Modal
                        isOpen={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        title="Add New Service to Catalogue"
                    >
                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Service Category</label>
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
                                    label="Code Identifier"
                                    placeholder="e.g. tg_otp, ig_followers"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>

                            <Input
                                label="Service Display Name"
                                placeholder="e.g. Telegram Virtual Phone Number"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!code) {
                                        setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                                    }
                                }}
                                required
                            />

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">Description</label>
                                <textarea
                                    className="textarea-base text-xs h-20"
                                    placeholder="Brief customer-facing explanation of what this service offers..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="serviceActiveCheckbox"
                                    className="checkbox-base"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <label htmlFor="serviceActiveCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Service is Active & Visible in Customer Storefront
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
                                    Create Service
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminServicesIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;