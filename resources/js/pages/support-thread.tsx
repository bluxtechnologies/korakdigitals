import * as React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { SupportIcon } from '@/components/ui/Icons';
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
    messages: SupportTicketMessage[];
}

export default function SupportThread() {
    const { props } = usePage<any>();
    const ticket: SupportTicketRecord = props.ticket;
    const toast = useToast();

    const [previewAttachment, setPreviewAttachment] = React.useState<string | null>(null);

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

        post(`/user/support/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                toast.success('Your reply has been sent.');
            },
            onError: () => {
                toast.error('Failed to send reply. Please try again.');
            },
        });
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
            <Head title={`Ticket #${ticket.id} — ${ticket.subject}`} />

            <div className="max-w-4xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Header & Back Link */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Link href="/user/support" className="hover:text-text-primary transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            <span>Back to Support Hub</span>
                        </Link>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-sm font-bold text-text-muted">#{ticket.id}</span>
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
                        <div className="text-xs text-text-secondary flex items-center gap-2">
                            <span>Opened {formatDate(ticket.created_at)}</span>
                            <span>•</span>
                            <span>Last active {formatDate(ticket.updated_at || ticket.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Conversation Container */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden flex flex-col min-h-[420px]">
                    {/* Thread Header */}
                    <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-base/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Messages ({ticket.messages?.length || 0})
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <SupportIcon size={14} className="text-brand" />
                            <span>Support Chat</span>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[580px] bg-bg-base/20">
                        {ticket.messages.map((msg) => {
                            const isUser = msg.sender_type === 'user';
                            const hasAttachment = Boolean(msg.attachment_path);

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex flex-col max-w-[85%] sm:max-w-[75%]',
                                        isUser ? 'ml-auto items-end' : 'mr-auto items-start'
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[11px] font-bold text-text-primary">
                                            {isUser ? 'You' : 'Korak Support Team'}
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            {formatDate(msg.created_at)}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'p-4 rounded-md shadow-2xs text-xs leading-relaxed whitespace-pre-wrap',
                                            isUser
                                                ? 'bg-brand text-brand-foreground rounded-tr-xs'
                                                : 'bg-bg-surface text-text-primary border border-border-subtle rounded-tl-xs'
                                        )}
                                    >
                                        {msg.message}

                                        {/* Optional Attachment on Opening Message */}
                                        {hasAttachment && (
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block mb-1.5">
                                                    Attached Screenshot
                                                </span>
                                                <div
                                                    onClick={() => setPreviewAttachment(`/user/support/${ticket.id}/attachment`)}
                                                    className="inline-block cursor-pointer rounded overflow-hidden border border-white/20 hover:opacity-90 transition-opacity"
                                                >
                                                    <img
                                                        src={`/user/support/${ticket.id}/attachment`}
                                                        alt="Attached Screenshot"
                                                        className="max-h-48 max-w-full object-contain bg-black/10 rounded"
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

                    {/* Customer Reply Box (Bottom) */}
                    <div className="p-4 border-t border-border-subtle bg-bg-surface">
                        {isResolved ? (
                            <div className="p-3 bg-bg-base border border-border-subtle rounded text-center space-y-2">
                                <span className="text-xs text-text-muted block">
                                    This ticket was marked as <strong>Resolved</strong>. If you still need help with this issue, reply below to reopen it.
                                </span>
                            </div>
                        ) : null}

                        <form onSubmit={handleReply} className="space-y-3 mt-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                    {isResolved ? 'Reply to Reopen Ticket' : 'Send a Reply'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="w-full px-3 py-2 text-xs bg-bg-base border border-border-subtle rounded-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                                    required
                                />
                                {errors.message && (
                                    <p className="text-[11px] text-error font-medium">{errors.message}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-text-muted">
                                    Our support team will be notified when you send a message.
                                </span>
                                <Button
                                    type="submit"
                                    size="sm"
                                    isLoading={processing}
                                    disabled={!data.message.trim()}
                                    className="text-xs font-bold px-5"
                                >
                                    Send Message
                                </Button>
                            </div>
                        </form>
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
                            alt="Attachment Preview"
                            className="max-h-[70vh] w-auto object-contain rounded border border-border-subtle"
                        />
                        <a
                            href={previewAttachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand font-bold hover:underline"
                        >
                            Open Full Image in New Tab
                        </a>
                    </div>
                )}
            </Modal>
        </>
    );
}

SupportThread.layout = (page: React.ReactNode) => (
    <AppShell title="Support Ticket" backUrl="/user/support">
        {page}
    </AppShell>
);
