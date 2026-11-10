import * as React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { SupportIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SupportTicketMessage {
    id: number;
    support_ticket_id: number;
    sender_type: 'user' | 'admin';
    sender_id: number;
    sender_name: string;
    message: string;
    attachment_path: string | null;
    created_at: string;
}

interface SupportTicketRecord {
    id: number;
    user_id: number;
    subject: string;
    status: 'open' | 'resolved';
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    latest_message?: SupportTicketMessage;
}

export default function AdminSupportIndex() {
    const { props } = usePage<any>();
    const ticketsPage = props.tickets || {};
    const ticketsList: SupportTicketRecord[] = ticketsPage.data || [];
    const links: PaginationLink[] = ticketsPage.links || [];
    const stats = props.stats || { total: 0, open: 0, resolved: 0 };
    const filters = props.filters || {};

    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || 'all');

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

        router.get('/admin/support', query, {
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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Support Inbox — Admin" />

            <div className="space-y-6 animate-fadeIn pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Support Inbox</h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-subtle text-brand">
                                Queue
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Triage customer tickets, review screenshots, and respond to conversation threads.
                        </p>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md shadow-2xs">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Tickets</span>
                        <div className="text-2xl font-black text-text-primary mt-1">{stats.total}</div>
                    </div>
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-warning uppercase tracking-wider">Open Tickets</span>
                            {stats.open > 0 && (
                                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                            )}
                        </div>
                        <div className="text-2xl font-black text-text-primary mt-1">{stats.open}</div>
                    </div>
                    <div className="p-4 bg-bg-surface border border-border-subtle rounded-md shadow-2xs">
                        <span className="text-[11px] font-bold text-success uppercase tracking-wider">Resolved</span>
                        <div className="text-2xl font-black text-text-primary mt-1">{stats.resolved}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Search by ID, customer, subject..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-40">
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'open', label: 'Open' },
                                    { value: 'resolved', label: 'Resolved' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-border-subtle bg-bg-base/60 text-text-secondary font-bold select-none">
                                    <th
                                        className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>#ID</span>
                                            {filters.sort === 'id' && (
                                                <span className="text-[10px]">{filters.direction === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Latest Message</th>
                                    <th
                                        className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Status</span>
                                            {filters.sort === 'status' && (
                                                <span className="text-[10px]">{filters.direction === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                                        onClick={() => handleSort('updated_at')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Updated</span>
                                            {filters.sort === 'updated_at' && (
                                                <span className="text-[10px]">{filters.direction === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {ticketsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-text-muted">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <SupportIcon size={32} className="text-text-muted/60" />
                                                <span className="text-sm font-semibold">No support tickets found</span>
                                                <span className="text-xs">Adjust your search or filter criteria.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ticketsList.map((ticket) => {
                                        const isResolved = ticket.status === 'resolved';
                                        const lastMsg = ticket.latest_message;
                                        const isLastMsgAdmin = lastMsg?.sender_type === 'admin';

                                        return (
                                            <tr
                                                key={ticket.id}
                                                className="hover:bg-bg-surface-hover/60 transition-colors"
                                            >
                                                <td className="py-3.5 px-4 font-mono font-bold text-text-primary">
                                                    #{ticket.id}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-text-primary">
                                                            {ticket.user?.name || 'Unknown'}
                                                        </span>
                                                        <span className="text-[11px] text-text-muted">
                                                            {ticket.user?.email || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 max-w-xs">
                                                    <span className="font-bold text-text-primary line-clamp-1">
                                                        {ticket.subject}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 max-w-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={cn(
                                                                'px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0',
                                                                isLastMsgAdmin
                                                                    ? 'bg-brand-subtle text-brand'
                                                                    : 'bg-bg-base text-text-secondary border border-border-subtle'
                                                            )}
                                                        >
                                                            {isLastMsgAdmin ? 'Staff' : 'User'}
                                                        </span>
                                                        <span className="text-text-secondary truncate text-[11px]">
                                                            {lastMsg ? lastMsg.message : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge
                                                        variant={isResolved ? 'success' : 'warning'}
                                                        className="capitalize font-bold text-[10px]"
                                                    >
                                                        {ticket.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-text-muted text-[11px] whitespace-nowrap">
                                                    {formatDate(ticket.updated_at || ticket.created_at)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Link href={`/admin/support/${ticket.id}`}>
                                                        <Button size="sm" variant="outline" className="text-xs font-bold">
                                                            View Thread
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {links.length > 3 && (
                        <div className="px-4 py-3 border-t border-border-subtle bg-bg-base/40 flex items-center justify-between">
                            <span className="text-xs text-text-muted">
                                Showing {ticketsPage.from || 0} to {ticketsPage.to || 0} of {ticketsPage.total || 0} tickets
                            </span>
                            <div className="flex items-center gap-1">
                                {links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'px-2.5 py-1 text-xs rounded-sm transition-colors',
                                            link.active
                                                ? 'bg-brand text-brand-foreground font-bold'
                                                : link.url
                                                ? 'hover:bg-bg-surface-hover text-text-secondary cursor-pointer'
                                                : 'text-text-muted/40 cursor-not-allowed'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminSupportIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
