import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export default function AdminNotificationShow() {
    const { props } = usePage<any>();
    const campaign = props.campaign;
    const toast = useToast();

    const [title, setTitle] = React.useState(campaign.title);
    const [body, setBody] = React.useState(campaign.body);
    const [type, setType] = React.useState(campaign.type);
    const [target, setTarget] = React.useState(campaign.target);
    const [scheduledAt, setScheduledAt] = React.useState(
        campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : ''
    );
    const [isSaving, setIsSaving] = React.useState(false);
    const [isActionBusy, setIsActionBusy] = React.useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        router.patch(`/admin/notifications/${campaign.id}`, {
            title,
            body,
            type,
            target,
            scheduled_at: scheduledAt || null,
        }, {
            onSuccess: () => {
                setIsSaving(false);
                toast.success('Campaign details saved.');
            },
            onError: (err: any) => {
                setIsSaving(false);
                toast.error(err.message || 'Failed to save changes.');
            },
        });
    };

    const handleActivate = () => {
        setIsActionBusy(true);
        router.post(`/admin/notifications/${campaign.id}/activate`, {}, {
            onSuccess: () => {
                setIsActionBusy(false);
                toast.success('Campaign activated and delivered to audience.');
            },
            onError: (err: any) => {
                setIsActionBusy(false);
                toast.error(err.message || 'Failed to activate.');
            },
        });
    };

    const handlePause = () => {
        setIsActionBusy(true);
        router.post(`/admin/notifications/${campaign.id}/pause`, {}, {
            onSuccess: () => {
                setIsActionBusy(false);
                toast.success('Campaign paused.');
            },
            onError: (err: any) => {
                setIsActionBusy(false);
                toast.error(err.message || 'Failed to pause.');
            },
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this notification campaign? This cannot be undone.')) {
            return;
        }

        router.delete(`/admin/notifications/${campaign.id}`, {
            onSuccess: () => {
                toast.success('Campaign deleted.');
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to delete.');
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
            <Head title={`${campaign.title} — Campaign Manager`} />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header with Breadcrumb and Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Link href="/admin/notifications" className="hover:text-brand transition-colors">
                                &larr; Back to Campaigns
                            </Link>
                            <span>•</span>
                            <span className="font-mono text-brand font-medium">CAMP-{campaign.id}</span>
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary flex items-center gap-2.5">
                            <span>{campaign.title}</span>
                            <Badge variant={getStatusVariant(campaign.status)} dot className="text-[10px] uppercase font-bold">
                                {campaign.status}
                            </Badge>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {campaign.status !== 'active' ? (
                            <Button
                                type="button"
                                variant="primary"
                                className="text-xs"
                                isLoading={isActionBusy}
                                onClick={handleActivate}
                            >
                                Activate & Broadcast
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-xs"
                                isLoading={isActionBusy}
                                onClick={handlePause}
                            >
                                Pause Campaign
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="destructive"
                            className="text-xs"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Campaign Analytics / Details Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Audience Reach</span>
                        <div className="text-xl font-black font-mono text-text-primary">
                            {campaign.sent_count?.toLocaleString() || 0} Accounts
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Message Type</span>
                        <div className="text-xl font-black uppercase text-brand font-mono">
                            {campaign.type}
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Created By</span>
                        <div className="text-sm font-semibold text-text-primary">
                            {campaign.created_by?.name || 'System Administrator'}
                        </div>
                    </div>
                </div>

                {/* Campaign Edit Form */}
                <div className="bg-bg-surface border border-border-subtle rounded-md p-6 shadow-xs">
                    <h3 className="text-sm font-extrabold text-text-primary mb-4 pb-2 border-b border-border-subtle uppercase tracking-wider">
                        Campaign Content & Settings
                    </h3>

                    <form onSubmit={handleSave} className="space-y-4 text-xs max-w-2xl">
                        <Input
                            label="Campaign Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-xs font-medium text-text-primary mb-1">
                                Message Content <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="textarea-base text-xs h-32 w-full p-2.5 border border-border-subtle rounded-md bg-bg-base text-text-primary focus:outline-none focus:border-brand"
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
                                Scheduled Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full text-xs bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-brand"
                            />
                        </div>

                        <div className="pt-3">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSaving}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </>
    );
}

AdminNotificationShow.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
