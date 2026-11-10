import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface OrderItem {
    id: number;
    item_title: string;
    quantity: number;
    unit_selling_price: string;
    subtotal: string;
    status: string;
}

interface OrderRecord {
    id: number;
    public_reference: string;
    service_category: string;
    total_amount: string;
    currency_code: string;
    status: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items?: OrderItem[];
}

export default function AdminOrders() {
    const { props } = usePage<any>();
    const ordersPage = props.orders || {};
    const ordersList: OrderRecord[] = ordersPage.data || [];
    const links: PaginationLink[] = ordersPage.links || [];
    const filters = props.filters || {};
    const toast = useToast();

    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || 'all');
    const [category, setCategory] = React.useState(filters.category || 'all');
    const [selectedRefundOrder, setSelectedRefundOrder] = React.useState<OrderRecord | null>(null);
    const [refundReason, setRefundReason] = React.useState('');
    const [refunding, setRefunding] = React.useState(false);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            category: category !== 'all' ? category : undefined,
            sort: filters.sort,
            direction: filters.direction,
            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '' || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get('/admin/orders', query, {
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

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        applyFilters({ category: newCategory });
    };

    const handleSort = (column: string) => {
        const isCurrent = filters.sort === column;
        const newDirection = isCurrent && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: column, direction: newDirection });
    };

    const handleRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundOrder) return;

        setRefunding(true);
        router.post(`/admin/orders/${selectedRefundOrder.id}/refund`, {
            reason: refundReason || 'Admin manual refund',
        }, {
            onSuccess: () => {
                setRefunding(false);
                setSelectedRefundOrder(null);
                setRefundReason('');
                toast.success('Order refunded and customer wallet credited.');
            },
            onError: (err: any) => {
                setRefunding(false);
                toast.error(err.message || 'Refund processing failed.');
            },
        });
    };

    const statusVariant = (st: string) => {
        switch (st) {
            case 'completed':
            case 'active':
                return 'success';
            case 'pending':
            case 'processing':
                return 'warning';
            case 'refunded':
            case 'cancelled':
            case 'failed':
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
            <Head title="Platform Orders — Admin" />
            <div className="space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Platform Order Inspector</h1>
                        <p className="text-xs text-text-secondary">Monitor digital purchases across all categories and process manual refunds safely.</p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-60">
                            <Input
                                placeholder="Search ref, customer, category…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="w-36">
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'processing', label: 'Processing' },
                                    { value: 'refunded', label: 'Refunded' },
                                    { value: 'failed', label: 'Failed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                            />
                        </div>

                        <div className="w-36">
                            <Select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Categories' },
                                    { value: 'numbers', label: 'Virtual Numbers' },
                                    { value: 'growth', label: 'Social Growth' },
                                    { value: 'vpn', label: 'VPN Access' },
                                    { value: 'esim', label: 'eSIM Data' },
                                    { value: 'airtime', label: 'Airtime' },
                                    { value: 'accounts', label: 'Accounts' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {ordersList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No orders found matching the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('public_reference')}
                                        >
                                            Reference {renderSortArrow('public_reference')}
                                        </th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th
                                            className="px-6 py-3 text-right font-mono cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('total_amount')}
                                        >
                                            Total Amount {renderSortArrow('total_amount')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status {renderSortArrow('status')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Date {renderSortArrow('created_at')}
                                        </th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {ordersList.map((o) => (
                                        <tr key={o.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-mono font-medium text-brand">
                                                {o.public_reference}
                                            </td>
                                            <td className="px-6 py-3">
                                                {o.user ? (
                                                    <Link
                                                        href={`/admin/users/${o.user.id}`}
                                                        className="flex flex-col group w-fit"
                                                    >
                                                        <span className="font-medium text-text-primary group-hover:text-brand transition-colors">
                                                            {o.user.name}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted font-mono">
                                                            {o.user.email}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 capitalize text-text-primary font-medium">
                                                {o.service_category}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-semibold text-text-primary">
                                                {o.currency_code} {Number(o.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={statusVariant(o.status)} dot className="text-[10px] capitalize">
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-text-muted text-[11px] font-mono whitespace-nowrap">
                                                {new Date(o.created_at).toLocaleString([], {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {o.status !== 'refunded' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs text-error hover:bg-error-bg hover:text-error transition-colors"
                                                        onClick={() => setSelectedRefundOrder(o)}
                                                    >
                                                        Refund
                                                    </Button>
                                                ) : (
                                                    <span className="text-[11px] text-text-muted font-medium">Refunded</span>
                                                )}
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

                {/* Refund Confirmation Modal */}
                {selectedRefundOrder && (
                    <Modal
                        isOpen={!!selectedRefundOrder}
                        onClose={() => setSelectedRefundOrder(null)}
                        title={`Refund Order: ${selectedRefundOrder.public_reference}`}
                    >
                        <form onSubmit={handleRefund} className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                This will credit <strong className="text-text-primary">{selectedRefundOrder.currency_code} {Number(selectedRefundOrder.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> back to the customer's wallet and update order status to <span className="text-error font-medium">refunded</span>.
                            </p>

                            <Input
                                label="Reason for Refund"
                                placeholder="e.g. Service activation failed on upstream provider"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setSelectedRefundOrder(null)}
                                    disabled={refunding}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    isLoading={refunding}
                                >
                                    Confirm Refund
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminOrders.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;