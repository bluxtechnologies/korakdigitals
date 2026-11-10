import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { BellIcon, PlusIcon } from '@/components/ui/Icons';

export default function AdminNotificationsIndex() {
    const { props } = usePage<any>();
    const campaignsPage = props.campaigns || {};
    const campaignsList = campaignsPage.data || [];
    const counts = props.counts || {};
    const filters = props.filters || {};
    const toast = useToast();

    const [statusTab, setStatusTab] = React.useState(filters.status || 'all');
    const [search, setSearch] = React.useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    // Form state
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');
    const [type, setType] = React.useState('info');
    const [target, setTarget] = React.useState('all');
    const [scheduledAt, setScheduledAt] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const tabs = [
        { id: 'all', label: 'All', count: counts.all || 0 },
        { id: 'draft', label: 'Draft', count: counts.draft || 0 },
        { id: 'scheduled', label: 'Scheduled', count: counts.scheduled || 0 },
        { id: 'active', label: 'Active', count: counts.active || 0 },
        { id: 'paused', label: 'Paused', count: counts.paused || 0 },
        { id: 'completed', label: 'Completed', count: counts.completed || 0 },
    ];

    const applyFilters = (newParams: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            status: statusTab !== 'all' ? statusTab : undefined,
            search: search || undefined,
            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '' || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get('/admin/notifications', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTabChange = (tabId: string) => {
        setStatusTab(tabId);
        applyFilters({ status: tabId });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ search: val });
        }, 400);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/notifications', {
            title,
            body,
            type,
            target,
            scheduled_at: scheduledAt || null,
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setIsCreateModalOpen(false);
                setTitle('');
                setBody('');
                setType('info');
                setTarget('all');
                setScheduledAt('');
                toast.success('Campaign created successfully.');
            },
            onError: (err: any) => {
                setIsSubmitting(false);
                toast.error(err.message || 'Failed to create campaign.');
            },
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'paused':
                return 'warning';
            case 'scheduled':
                return 'neutral';
            case 'draft':
                return 'neutral';
            case 'completed':
                return 'success';
            default:
                return 'neutral';
        }
    };

    return (
        <>
            <Head title="Notification Campaigns — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary flex items-center gap-2">
                            <BellIcon size={20} className="text-brand" />
                            <span>Notification & Broadcast Campaigns</span>
                        </h1>
                        <p className="text-xs text-text-secondary">
                            Create, schedule, broadcast, and manage customer announcements, promotional alerts, and system notices.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        className="text-xs flex items-center gap-1.5"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusIcon size={14} />
                        New Campaign
                    </Button>
                </div>

                {/* Status Tabs and Search */}
                <div className="space-y-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border-subtle">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleTabChange(t.id)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
                                    statusTab === t.id
                                        ? 'bg-brand text-brand-foreground'
                                        : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                                }`}
                            >
                                <span>{t.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    statusTab === t.id ? 'bg-white/20 text-white' : 'bg-bg-base text-text-muted'
                                }`}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-72">
                        <Input
                            placeholder="Search campaign title, content…"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    {campaignsList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-text-muted">
                            No campaigns found in this view.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Campaign</th>
                                        <th className="px-6 py-3">Audience Target</th>
                                        <th className="px-6 py-3 text-center">Type</th>
                                        <th className="px-6 py-3 text-right font-mono">Recipients</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {campaignsList.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/admin/notifications/${c.id}`}
                                                    className="font-medium text-text-primary hover:text-brand transition-colors block"
                                                >
                                                    {c.title}
                                                </Link>
                                                <span className="text-[11px] text-text-muted line-clamp-1 max-w-sm">
                                                    {c.body}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 capitalize font-medium text-text-primary">
                                                {c.target === 'all' ? 'All Customers' : c.target === 'verified' ? 'Verified Only' : 'Custom'}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-bg-base border border-border-subtle text-text-secondary">
                                                    {c.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-medium text-text-primary">
                                                {c.sent_count?.toLocaleString() || 0}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={getStatusVariant(c.status)} dot className="text-[10px] uppercase font-bold">
                                                    {c.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/notifications/${c.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                >
                                                    Manage &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Campaign Modal */}
                {isCreateModalOpen && (
                    <Modal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        title="Create Notification Campaign"
                        size="lg"
                    >
                        <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
                            <Input
                                label="Campaign Title"
                                placeholder="e.g. Scheduled System Maintenance or Weekend 10% Bonus"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">
                                    Message Content <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="textarea-base text-xs h-28 w-full p-2.5 border border-border-subtle rounded-md bg-bg-base text-text-primary focus:outline-none focus:border-brand"
                                    placeholder="Write the full broadcast message..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Type Category</label>
                                    <Select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        options={[
                                            { value: 'info', label: 'Informational Notice' },
                                            { value: 'warning', label: 'Urgent Warning / Maintenance' },
                                            { value: 'promo', label: 'Promotional / Discount Offer' },
                                            { value: 'system', label: 'System Service Announcement' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Target Audience</label>
                                    <Select
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        options={[
                                            { value: 'all', label: 'All Registered Customers' },
                                            { value: 'verified', label: 'Verified Accounts Only' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-primary mb-1">
                                    Schedule Broadcast (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="w-full text-xs bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-brand"
                                />
                                <span className="text-[10px] text-text-muted block mt-1">
                                    Leave blank to create as a draft and manually activate whenever ready.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                >
                                    Create Campaign
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminNotificationsIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
