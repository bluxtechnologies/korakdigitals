import * as React from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

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
        created_at: string;
    };
    messages: SupportTicketMessage[];
}

export default function AdminSupportShow() {
    const { props } = usePage<any>();
    const ticket: SupportTicketRecord = props.ticket;
    const toast = useToast();

    const [previewAttachment, setPreviewAttachment] = React.useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = React.useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages?.length]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        post(`/admin/support/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                toast.success('Reply sent successfully to the customer.');
            },
            onError: () => {
                toast.error('Failed to send reply. Please try again.');
            },
        });
    };

    const handleToggleStatus = () => {
        const nextStatus = ticket.status === 'open' ? 'resolved' : 'open';
        setStatusUpdating(true);

        router.post(
            `/admin/support/${ticket.id}/status`,
            { status: nextStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStatusUpdating(false);
                    toast.success(`Ticket #${ticket.id} marked as ${nextStatus}.`);
                },
                onError: () => {
                    setStatusUpdating(false);
                    toast.error('Failed to update ticket status.');
                },
            }
        );
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

    const isResolved = ticket.status === 'resolved';

    return (
        <>
            <Head title={`Ticket #${ticket.id} — ${ticket.subject} — Admin`} />

            <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
                {/* Header & Breadcrumb */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Link href="/admin/support" className="hover:text-text-primary transition-colors">
                            Support Inbox
                        </Link>
                        <span>/</span>
                        <span className="text-text-primary font-bold">Ticket #{ticket.id}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg md:text-xl font-black text-text-primary tracking-tight">
                                    {ticket.subject}
                                </h1>
                                <Badge
                                    variant={isResolved ? 'success' : 'warning'}
                                    className="capitalize font-bold text-[10px]"
                                >
                                    {ticket.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                                <span>
                                    Customer:{' '}
                                    <strong className="text-text-primary">
                                        {ticket.user?.name || 'Unknown'}
                                    </strong>{' '}
                                    ({ticket.user?.email || '—'})
                                </span>
                                <span>•</span>
                                <span>Opened {formatDate(ticket.created_at)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={isResolved ? 'outline' : 'primary'}
                                size="sm"
                                onClick={handleToggleStatus}
                                isLoading={statusUpdating}
                                className="text-xs font-bold"
                            >
                                {isResolved ? 'Reopen Ticket' : 'Mark as Resolved'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Conversation Stream (View + Respond Merged Surface) */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden flex flex-col min-h-[450px]">
                    {/* Thread Header */}
                    <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-base/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Conversation History ({ticket.messages?.length || 0} messages)
                        </span>
                        <span className="text-[11px] text-text-muted">
                            Last updated {formatDate(ticket.updated_at || ticket.created_at)}
                        </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[600px] bg-bg-base/20">
                        {ticket.messages.map((msg, index) => {
                            const isAdmin = msg.sender_type === 'admin';
                            const hasAttachment = Boolean(msg.attachment_path);

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex flex-col max-w-[85%] sm:max-w-[75%]',
                                        isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[11px] font-bold text-text-primary">
                                            {isAdmin ? `${msg.sender_name} (Staff)` : msg.sender_name}
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            {formatDate(msg.created_at)}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'p-4 rounded-md shadow-2xs text-xs leading-relaxed whitespace-pre-wrap',
                                            isAdmin
                                                ? 'bg-brand text-brand-foreground rounded-tr-xs'
                                                : 'bg-bg-surface text-text-primary border border-border-subtle rounded-tl-xs'
                                        )}
                                    >
                                        {msg.message}

                                        {/* Optional Attachment on Opening Message */}
                                        {hasAttachment && (
                                            <div className="mt-3 pt-3 border-t border-border-subtle/30">
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block mb-1.5">
                                                    Attached Screenshot
                                                </span>
                                                <div
                                                    onClick={() => setPreviewAttachment(`/admin/support/${ticket.id}/attachment`)}
                                                    className="inline-block cursor-pointer rounded overflow-hidden border border-border-subtle/50 hover:opacity-90 transition-opacity"
                                                >
                                                    <img
                                                        src={`/admin/support/${ticket.id}/attachment`}
                                                        alt="Attachment thumbnail"
                                                        className="max-h-48 max-w-full object-contain bg-black/5 rounded"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Admin Reply Area (Bottom of merged surface) */}
                    <div className="p-4 border-t border-border-subtle bg-bg-surface">
                        {isResolved ? (
                            <div className="p-3 bg-bg-base border border-border-subtle rounded text-center space-y-2">
                                <span className="text-xs text-text-muted block">
                                    This ticket is marked as <strong>Resolved</strong>. You can reopen it if the customer requires further assistance.
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleToggleStatus}
                                    isLoading={statusUpdating}
                                    className="text-xs font-bold"
                                >
                                    Reopen Ticket to Reply
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleReply} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                        Post Staff Reply
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Type your reply to the customer..."
                                        className="w-full px-3 py-2 text-xs bg-bg-base border border-border-subtle rounded-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                                        required
                                    />
                                    {errors.message && (
                                        <p className="text-[11px] text-error font-medium">{errors.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-text-muted">
                                        The customer will receive an in-app notification when you reply.
                                    </span>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        isLoading={processing}
                                        disabled={!data.message.trim()}
                                        className="text-xs font-bold px-5"
                                    >
                                        Send Reply
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Attachment Preview Modal */}
            <Modal
                isOpen={Boolean(previewAttachment)}
                onClose={() => setPreviewAttachment(null)}
                title="Attached Screenshot"
            >
                {previewAttachment && (
                    <div className="flex flex-col items-center gap-4 py-2">
                        <img
                            src={previewAttachment}
                            alt="Attachment Full View"
                            className="max-h-[70vh] w-auto object-contain rounded border border-border-subtle"
                        />
                        <a
                            href={previewAttachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand font-bold hover:underline"
                        >
                            Open Original in New Tab
                        </a>
                    </div>
                )}
            </Modal>
        </>
    );
}

AdminSupportShow.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
