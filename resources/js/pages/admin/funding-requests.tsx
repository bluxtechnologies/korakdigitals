import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FundingRequestRecord {
    id: number;
    public_reference: string;
    provider_reference?: string;
    provider: string;
    amount: string;
    currency_code: string;
    status: string;
    payment_method: string;
    sender_name?: string;
    sender_bank_name?: string;
    sender_account_number?: string;
    proof_path?: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export default function AdminFundingRequests() {
    const { props } = usePage<any>();
    const requestsPage = props.fundingRequests || {};
    const requestsList: FundingRequestRecord[] = requestsPage.data || [];
    const links: PaginationLink[] = requestsPage.links || [];
    const filters = props.filters || {};
    const toast = useToast();

    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || 'all');
    const [selectedRequest, setSelectedRequest] = React.useState<FundingRequestRecord | null>(null);
    const [actionType, setActionType] = React.useState<'approve' | 'reject'>('approve');
    const [reason, setReason] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

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

        router.get('/admin/funding-requests', query, {
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

    const handleProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setSubmitting(true);
        const endpoint = actionType === 'approve'
            ? `/admin/funding-requests/${selectedRequest.id}/approve`
            : `/admin/funding-requests/${selectedRequest.id}/reject`;

        router.post(endpoint, { reason: reason || (actionType === 'approve' ? 'Bank deposit confirmed' : 'Declined by admin') }, {
            onSuccess: () => {
                setSubmitting(false);
                setSelectedRequest(null);
                setReason('');
                toast.success(`Funding request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`);
            },
            onError: (err: any) => {
                setSubmitting(false);
                toast.error(err.message || 'Processing failed.');
            },
        });
    };

    const statusVariant = (st: string) => {
        switch (st) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
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
            <Head title="Funding Queue — Admin" />
            <div className="space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Manual Funding Queue</h1>
                        <p className="text-xs text-text-secondary">Verify customer bank transfer deposits, match receipts, and approve wallet credits.</p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-64">
                            <Input
                                placeholder="Search ref, sender, customer…"
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
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {requestsList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No funding requests found matching the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            Reference {renderSortArrow('id')}
                                        </th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Bank & Sender</th>
                                        <th
                                            className="px-6 py-3 text-right font-mono cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('amount')}
                                        >
                                            Amount {renderSortArrow('amount')}
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
                                    {requestsList.map((req) => (
                                        <tr key={req.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col font-mono">
                                                    <span className="font-medium text-brand">
                                                        {req.provider_reference || req.public_reference}
                                                    </span>
                                                    {req.provider_reference && req.public_reference && (
                                                        <span className="text-[10px] text-text-muted">
                                                            {req.public_reference}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                {req.user ? (
                                                    <Link
                                                        href={`/admin/users/${req.user.id}`}
                                                        className="flex flex-col group w-fit"
                                                    >
                                                        <span className="font-medium text-text-primary group-hover:text-brand transition-colors">
                                                            {req.user.name}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted font-mono">
                                                            {req.user.email}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-text-primary">
                                                        {req.sender_name || 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted font-mono">
                                                        {req.sender_bank_name ? `${req.sender_bank_name} • ${req.sender_account_number || ''}` : req.payment_method}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-semibold text-text-primary">
                                                {req.currency_code} {Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={statusVariant(req.status)} dot className="text-[10px] capitalize">
                                                    {req.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-text-muted text-[11px] font-mono whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleString([], {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            className="text-xs px-2.5 py-1"
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setActionType('approve');
                                                                setReason('Bank deposit verified');
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-xs px-2.5 py-1 text-error hover:bg-error-bg hover:text-error"
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setActionType('reject');
                                                                setReason('');
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-text-muted font-medium capitalize">
                                                        {req.status}
                                                    </span>
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

                {/* Process Modal */}
                {selectedRequest && (
                    <Modal
                        isOpen={!!selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Funding Request: ${selectedRequest.public_reference}`}
                    >
                        <form onSubmit={handleProcess} className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                {actionType === 'approve'
                                    ? `This will credit ${selectedRequest.currency_code} ${Number(selectedRequest.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} directly into the wallet of ${selectedRequest.user?.name || 'Customer'}.`
                                    : `This will mark transfer request ${selectedRequest.public_reference} as rejected.`
                                }
                            </p>

                            <Input
                                label="Verification Note / Reason"
                                placeholder={actionType === 'approve' ? "e.g. Bank deposit verified in platform ledger" : "e.g. Deposit not found on bank statement"}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setSelectedRequest(null)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant={actionType === 'approve' ? 'primary' : 'danger'}
                                    isLoading={submitting}
                                >
                                    Confirm {actionType === 'approve' ? 'Approval & Credit Wallet' : 'Rejection'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminFundingRequests.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;

