import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { CopyIcon, CheckIcon, InboxIcon } from '@/components/ui/Icons';

interface Message {
    id: number;
    sender: string;
    subject: string;
    body_text: string;
    body_html: string;
    verification_code?: string;
    received_at: string;
}

export default function TempEmail() {
    const { props } = usePage<any>();
    const toast = useToast();

    const [activeEmail, setActiveEmail] = React.useState<any>(props.activeEmail || null);
    const [messages, setMessages] = React.useState<Message[]>(props.messages || []);
    const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
    const [generating, setGenerating] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [copiedEmail, setCopiedEmail] = React.useState(false);
    const [copiedCode, setCopiedCode] = React.useState(false);

    const handleGenerateEmail = () => {
        setGenerating(true);
        router.post('/user/temp-email/generate', {}, {
            onSuccess: (page: any) => {
                setGenerating(false);
                toast.success("New 10-minute temporary email generated!", "Inbox Ready");
            },
            onError: () => setGenerating(false)
        });
    };

    const handleRefreshMessages = () => {
        if (!activeEmail) return;
        setRefreshing(true);
        router.reload({
            onSuccess: () => {
                setRefreshing(false);
                toast.success("Inbox refreshed");
            },
            onError: () => setRefreshing(false)
        });
    };

    const handleCopyEmail = () => {
        if (!activeEmail) return;
        navigator.clipboard.writeText(activeEmail.email_address);
        setCopiedEmail(true);
        toast.success("Email address copied to clipboard!");
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        toast.success("Verification code copied!");
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <>
            <Head title="Disposable Temp Email Desk" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Disposable Temp Email Desk</h1>
                        <p className="text-xs text-text-secondary">
                            Generate instant 10-minute temp emails to receive activation links and OTP verification codes.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column (5/12): Generator & Active Email Control */}
                    <div className="lg:col-span-5 space-y-5">
                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Temporary Address</span>
                                <Badge variant={activeEmail ? "success" : "neutral"}>
                                    {activeEmail ? "Active 10-Min Inbox" : "No Address"}
                                </Badge>
                            </div>

                            {activeEmail ? (
                                <div className="space-y-4">
                                    <div className="bg-bg-base border border-border-subtle p-4 rounded-md flex items-center justify-between gap-3">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] text-text-muted font-semibold uppercase">Email Address</span>
                                            <span className="text-sm font-bold font-mono text-brand truncate">{activeEmail.email_address}</span>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={handleCopyEmail} className="shrink-0 text-xs">
                                            {copiedEmail ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                                            {copiedEmail ? "Copied" : "Copy"}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span>Status: <strong className="text-success font-semibold">Ready for incoming OTPs</strong></span>
                                        <span>Auto-Expires: <strong className="font-mono text-text-primary">10:00</strong></span>
                                    </div>

                                    <div className="flex gap-2.5 pt-2">
                                        <Button variant="outline" className="flex-1 text-xs font-bold flex items-center justify-center gap-1.5" onClick={handleRefreshMessages} isLoading={refreshing}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                            Refresh Inbox
                                        </Button>
                                        <Button variant="secondary" className="flex-1 text-xs font-bold" onClick={handleGenerateEmail} isLoading={generating}>
                                            + New Address
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-subtle text-brand mx-auto flex items-center justify-center">
                                        <InboxIcon size={24} />
                                    </div>
                                    <p className="text-xs text-text-muted max-w-xs mx-auto">
                                        No active disposable inbox. Click below to generate a temporary email address.
                                    </p>
                                    <Button onClick={handleGenerateEmail} isLoading={generating} className="w-full text-xs font-bold shadow-sm">
                                        Generate 10-Minute Temp Email
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (7/12): Live Incoming Messages List */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-bg-surface border border-border-subtle rounded-md shadow-xs overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-4 border-b border-border-subtle">
                                <h3 className="text-sm font-bold text-text-primary">Incoming Messages Inbox</h3>
                                <span className="text-xs font-semibold text-text-muted">{messages.length} received</span>
                            </div>

                            {messages.length === 0 ? (
                                <div className="p-12 text-center text-xs text-text-muted space-y-2">
                                    <p>Waiting for incoming emails or verification codes...</p>
                                    <p className="text-[11px]">Send an email to your temporary address to test real-time reception.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {messages.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            onClick={() => setSelectedMessage(msg)}
                                            className="p-4 hover:bg-bg-surface-hover/60 transition-colors cursor-pointer space-y-2"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-xs font-bold text-text-primary">{msg.sender}</span>
                                                <span className="text-[10px] text-text-muted font-mono">
                                                    {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="text-xs font-semibold text-text-secondary">{msg.subject}</div>

                                            {msg.verification_code && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-subtle text-brand rounded-md border border-brand/20">
                                                    <span className="text-xs font-mono font-bold tracking-wider">OTP CODE: {msg.verification_code}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyCode(msg.verification_code!);
                                                        }} 
                                                        className="text-[10px] underline font-bold hover:text-brand-hover cursor-pointer"
                                                    >
                                                        Copy Code
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TempEmail.layout = (page: React.ReactNode) => (
    <AppShell title="Temporary Email" backUrl="/user/services">
        {page}
    </AppShell>
);