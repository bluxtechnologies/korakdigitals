import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AuditLogRecord {
    id: number;
    actor_type: string;
    actor_id?: number;
    action: string;
    target_type?: string;
    target_id?: number;
    reference?: string;
    reason?: string;
    metadata?: Record<string, any>;
    ip_address?: string;
    created_at: string;
}

export default function AdminAuditLogs() {
    const { props } = usePage<any>();
    const logsPage = props.auditLogs || {};
    const logsList: AuditLogRecord[] = logsPage.data || [];
    const links: PaginationLink[] = logsPage.links || [];
    const filters = props.filters || {};

    const [search, setSearch] = React.useState(filters.search || '');
    const [actorType, setActorType] = React.useState(filters.actor_type || 'all');
    const [selectedLog, setSelectedLog] = React.useState<AuditLogRecord | null>(null);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: search || undefined,
            actor_type: actorType !== 'all' ? actorType : undefined,
            sort: filters.sort,
            direction: filters.direction,
            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '' || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get('/admin/audit-logs', query, {
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

    const handleActorTypeChange = (newType: string) => {
        setActorType(newType);
        applyFilters({ actor_type: newType });
    };

    const handleSort = (column: string) => {
        const isCurrent = filters.sort === column;
        const newDirection = isCurrent && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: column, direction: newDirection });
    };

    const renderSortArrow = (column: string) => {
        if (filters.sort !== column) {
            return <span className="opacity-30 ml-1">↕</span>;
        }
        return <span className="text-brand ml-1">{filters.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const actorBadgeVariant = (type: string) => {
        switch (type) {
            case 'admin':
                return 'primary';
            case 'user':
                return 'success';
            case 'system':
                return 'warning';
            default:
                return 'neutral';
        }
    };

    return (
        <>
            <Head title="Audit Trail — Admin" />
            <div className="space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Security & Operational Audit Trail</h1>
                        <p className="text-xs text-text-secondary">Immutable event log recording administrative operations, system actions, and user security events.</p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-64">
                            <Input
                                placeholder="Search action, ref, IP or reason…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="w-36">
                            <Select
                                value={actorType}
                                onChange={(e) => handleActorTypeChange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Actors' },
                                    { value: 'admin', label: 'Admin Staff' },
                                    { value: 'user', label: 'Customer' },
                                    { value: 'system', label: 'System' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {logsList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No audit log events found matching the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Timestamp {renderSortArrow('created_at')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('actor_type')}
                                        >
                                            Actor {renderSortArrow('actor_type')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer hover:text-text-primary transition-colors"
                                            onClick={() => handleSort('action')}
                                        >
                                            Action {renderSortArrow('action')}
                                        </th>
                                        <th className="px-6 py-3">Reference / Target</th>
                                        <th className="px-6 py-3">Reason / Details</th>
                                        <th className="px-6 py-3 font-mono">IP Address</th>
                                        <th className="px-6 py-3 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {logsList.map((log) => (
                                        <tr key={log.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString([], {
                                                    dateStyle: 'short',
                                                    timeStyle: 'medium',
                                                })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge
                                                    variant={actorBadgeVariant(log.actor_type)}
                                                    className="text-[9px] uppercase font-bold"
                                                >
                                                    {log.actor_type} {log.actor_id ? `#${log.actor_id}` : ''}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-text-primary font-mono text-[11px]">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-brand font-medium">
                                                {log.reference || (log.target_type ? `${log.target_type.split('\\').pop()} #${log.target_id || ''}` : '—')}
                                            </td>
                                            <td className="px-6 py-3 text-text-secondary max-w-xs truncate" title={log.reason || ''}>
                                                {log.reason || '—'}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted">
                                                {log.ip_address || '—'}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {log.metadata ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2 py-1"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        Inspect
                                                    </Button>
                                                ) : (
                                                    <span className="text-[11px] text-text-muted">—</span>
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

                {/* Metadata Inspector Modal */}
                {selectedLog && (
                    <Modal
                        isOpen={!!selectedLog}
                        onClose={() => setSelectedLog(null)}
                        title={`Audit Event Details: ${selectedLog.action} (#${selectedLog.id})`}
                    >
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-bg-base border border-border-subtle rounded-md">
                                <div>
                                    <span className="text-text-muted text-[10px] uppercase font-semibold">Actor</span>
                                    <p className="font-medium text-text-primary capitalize">{selectedLog.actor_type} {selectedLog.actor_id ? `(#${selectedLog.actor_id})` : ''}</p>
                                </div>
                                <div>
                                    <span className="text-text-muted text-[10px] uppercase font-semibold">IP Address</span>
                                    <p className="font-mono text-text-primary">{selectedLog.ip_address || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-text-muted text-[10px] uppercase font-semibold">Reason / Context</span>
                                    <p className="text-text-secondary">{selectedLog.reason || 'None provided'}</p>
                                </div>
                            </div>

                            {selectedLog.metadata && (
                                <div className="space-y-1.5">
                                    <span className="text-text-muted text-[10px] uppercase font-semibold">Event Payload / Snapshot</span>
                                    <pre className="p-3 bg-bg-base border border-border-subtle rounded-md overflow-x-auto font-mono text-[11px] text-text-primary">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminAuditLogs.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;

