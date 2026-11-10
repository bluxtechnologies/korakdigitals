import * as React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { SupportIcon, CheckIcon } from '@/components/ui/Icons';
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
    latest_message?: SupportTicketMessage;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

const FAQ_ITEMS = [
    {
        question: "How do I rent a virtual number?",
        answer: "Navigate to the Numbers page from the dashboard. Select a country, choose a verification service (e.g. WhatsApp, Telegram), and click 'Rent Number'. The cost will be deducted from your wallet balance automatically."
    },
    {
        question: "How long does a rented number last?",
        answer: "Each rented number is active for 20 minutes. During this window, you can receive SMS verification codes. If no code arrives, the rental is automatically cancelled and you receive a full refund."
    },
    {
        question: "How do I fund my wallet?",
        answer: "Go to the Wallet page, tap 'Fund Account', select your target currency (NGN or USD), enter the amount, and follow the bank transfer instructions provided. Your balance updates instantly upon confirmation."
    },
    {
        question: "Can I get a refund for an unused number?",
        answer: "Yes. If you rent a number and no SMS code is received within the 20-minute window, the full rental fee is automatically refunded to your wallet. Cancelled orders also trigger instant refunds."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We currently support manual bank transfers (NGN via Wema Bank) and simulated USD deposits. Card payments and cryptocurrency options are coming soon."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. All verification codes are delivered in real-time and are not stored after your session expires. We use encrypted channels and do not share your information with third parties."
    }
];

export default function Support() {
    const { props } = usePage<any>();
    const ticketsPage = props.tickets || {};
    const tickets: SupportTicketRecord[] = ticketsPage.data || [];
    const links: PaginationLink[] = ticketsPage.links || [];

    const toast = useToast();
    const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
    const [attachmentPreview, setAttachmentPreview] = React.useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm<{
        subject: string;
        message: string;
        attachment: File | null;
    }>({
        subject: '',
        message: '',
        attachment: null,
    });

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Screenshot must be 5MB or smaller.');
                return;
            }
            setData('attachment', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachmentPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('attachment', null);
            setAttachmentPreview(null);
        }
    };

    const removeAttachment = () => {
        setData('attachment', null);
        setAttachmentPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.subject.trim() || !data.message.trim()) {
            toast.error('Please enter a subject and describe your issue.');
            return;
        }

        post('/user/support', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setAttachmentPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                toast.success('Your support ticket has been created. Our team will respond shortly.', 'Ticket Created');
            },
            onError: () => {
                toast.error('Failed to submit ticket. Please check the form.');
            },
        });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Help & Support" />

            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Help & Support</h1>
                        <p className="text-xs text-text-secondary">
                            Browse FAQs or open a support ticket. Our team is available 24/7.
                        </p>
                    </div>
                </div>

                {/* Support Hero Banner */}
                <div className="bg-brand text-brand-foreground p-6 rounded-md shadow-sm flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                        <SupportIcon size={28} className="text-white" />
                    </div>
                    <h2 className="text-lg font-extrabold tracking-tight">How can we help you?</h2>
                    <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                        Browse our frequently asked questions below or start a conversation ticket with our support agents.
                    </p>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href="mailto:support@korakdigital.com"
                        className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex flex-col items-center gap-2 text-center hover:bg-bg-surface-hover transition-colors cursor-pointer active:scale-[0.96]"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-text-primary">Email Support</span>
                        <span className="text-[10px] text-text-muted">support@korakdigital.com</span>
                    </a>
                    <a
                        href="https://wa.me/2341234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex flex-col items-center gap-2 text-center hover:bg-bg-surface-hover transition-colors cursor-pointer active:scale-[0.96]"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-text-primary">WhatsApp Chat</span>
                        <span className="text-[10px] text-text-muted">Live Chat Available</span>
                    </a>
                </div>

                {/* FAQ Section */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-subtle bg-bg-base">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Frequently Asked Questions</span>
                    </div>
                    <div className="divide-y divide-border-subtle">
                        {FAQ_ITEMS.map((faq, idx) => (
                            <div key={idx}>
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-surface-hover/50 transition-colors active:bg-bg-surface-hover"
                                >
                                    <span className="text-xs font-bold text-text-primary pr-4">{faq.question}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.5}
                                        stroke="currentColor"
                                        className={cn(
                                            "w-4 h-4 text-text-muted shrink-0 transition-transform duration-200",
                                            expandedFaq === idx && "rotate-180"
                                        )}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                                {expandedFaq === idx && (
                                    <div className="px-4 pb-4 text-xs text-text-secondary leading-relaxed animate-fadeIn">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start a New Ticket Form */}
                <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-2xs flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-text-primary">Start a Support Ticket</h3>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                            Can't find an answer above? Submit a new ticket with optional screenshots, and our team will get back to you directly.
                        </p>
                    </div>

                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                        <Input
                            label="Subject / Issue Summary"
                            placeholder="e.g. Question about order refund, SMS not arriving..."
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            error={errors.subject}
                            required
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-secondary">Describe Your Issue</label>
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Tell us what happened in detail..."
                                rows={4}
                                required
                                className="w-full px-3 py-2.5 text-xs bg-bg-base border border-border-subtle rounded-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                            />
                            {errors.message && (
                                <p className="text-[11px] text-error font-medium">{errors.message}</p>
                            )}
                        </div>

                        {/* Optional Screenshot Attachment */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-text-secondary">
                                Screenshot / Attachment (Optional, max 5MB)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="ticket-attachment-input"
                                />
                                <label
                                    htmlFor="ticket-attachment-input"
                                    className="px-3 py-2 bg-bg-base border border-border-subtle hover:bg-bg-surface-hover text-text-secondary text-xs font-semibold rounded-xs cursor-pointer transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                    </svg>
                                    <span>{data.attachment ? 'Change Image' : 'Attach Screenshot'}</span>
                                </label>

                                {data.attachment && (
                                    <button
                                        type="button"
                                        onClick={removeAttachment}
                                        className="text-xs text-error font-bold hover:underline cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {attachmentPreview && (
                                <div className="mt-2 relative inline-block">
                                    <img
                                        src={attachmentPreview}
                                        alt="Preview"
                                        className="h-28 w-auto rounded border border-border-subtle object-cover shadow-2xs"
                                    />
                                    <span className="text-[10px] text-text-muted block mt-1">
                                        {data.attachment?.name} ({(data.attachment!.size / 1024).toFixed(0)} KB)
                                    </span>
                                </div>
                            )}
                            {errors.attachment && (
                                <p className="text-[11px] text-error font-medium">{errors.attachment}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full text-xs font-bold shadow-sm" isLoading={processing}>
                            Submit Ticket
                        </Button>
                    </form>
                </div>

                {/* My Tickets Section */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-subtle bg-bg-base flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">My Support Tickets</span>
                        <span className="text-[11px] text-text-muted">
                            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} total
                        </span>
                    </div>

                    <div className="divide-y divide-border-subtle">
                        {tickets.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">
                                <span className="text-xs font-medium">You haven't opened any support tickets yet.</span>
                            </div>
                        ) : (
                            tickets.map((ticket) => {
                                const isResolved = ticket.status === 'resolved';
                                const lastMsg = ticket.latest_message;
                                const isLastFromAdmin = lastMsg?.sender_type === 'admin';
                                const hasUnreadAdminReply = !isResolved && isLastFromAdmin;

                                return (
                                    <Link
                                        key={ticket.id}
                                        href={`/user/support/${ticket.id}`}
                                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-surface-hover transition-colors block cursor-pointer"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-text-muted">#{ticket.id}</span>
                                                <span className="text-xs font-bold text-text-primary truncate">{ticket.subject}</span>
                                                <Badge
                                                    variant={isResolved ? 'success' : 'warning'}
                                                    className="capitalize font-bold text-[10px]"
                                                >
                                                    {ticket.status}
                                                </Badge>
                                                {hasUnreadAdminReply && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand text-brand-foreground animate-pulse">
                                                        New Reply
                                                    </span>
                                                )}
                                            </div>

                                            {lastMsg && (
                                                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                    <span className="font-semibold text-text-muted text-[11px]">
                                                        {isLastFromAdmin ? 'Staff:' : 'You:'}
                                                    </span>
                                                    <span className="truncate max-w-md text-[11px]">
                                                        {lastMsg.message}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                            <span className="text-[11px] text-text-muted">
                                                {formatDate(ticket.updated_at || ticket.created_at)}
                                            </span>
                                            <Button size="sm" variant="outline" className="text-xs font-bold pointer-events-none">
                                                View Thread
                                            </Button>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {links.length > 3 && (
                        <div className="px-4 py-3 border-t border-border-subtle bg-bg-base/40 flex items-center justify-between">
                            <span className="text-xs text-text-muted">
                                Showing {ticketsPage.from || 0} to {ticketsPage.to || 0} of {ticketsPage.total || 0} tickets
                            </span>
                            <div className="flex items-center gap-1">
                                {links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'px-2.5 py-1 text-xs rounded-sm transition-colors',
                                            link.active
                                                ? 'bg-brand text-brand-foreground font-bold'
                                                : link.url
                                                ? 'hover:bg-bg-surface-hover text-text-secondary'
                                                : 'text-text-muted/40 pointer-events-none'
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

Support.layout = (page: React.ReactNode) => (
    <AppShell title="Help & Support" backUrl="/user/dashboard">
        {page}
    </AppShell>
);
