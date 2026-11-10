import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CopyIcon, CheckIcon, KeyIcon } from '@/components/ui/Icons';

interface ApiKeyItem {
    id: number;
    name: string;
    key_prefix: string;
    is_active: boolean;
    created_at: string;
    last_used_at?: string;
}

export default function Developer() {
    const { props } = usePage<any>();
    const toast = useToast();

    const [apiKeys, setApiKeys] = React.useState<ApiKeyItem[]>(props.apiKeys || []);
    const [keyName, setKeyName] = React.useState('');
    const [generating, setGenerating] = React.useState(false);
    const [newSecretToken, setNewSecretToken] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<'keys' | 'docs'>('keys');
    const [copiedToken, setCopiedToken] = React.useState(false);

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyName) return;

        setGenerating(true);
        router.post('/user/developer/keys', { name: keyName }, {
            onSuccess: (page: any) => {
                setGenerating(false);
                setKeyName('');
                if (page.props?.rawToken) {
                    setNewSecretToken(page.props.rawToken);
                }
                toast.success("API key generated successfully!");
            },
            onError: () => setGenerating(false)
        });
    };

    const handleRevokeKey = (id: number) => {
        router.post(`/user/developer/keys/${id}/revoke`, {}, {
            onSuccess: () => {
                toast.success("API key revoked.");
            }
        });
    };

    const handleCopyToken = () => {
        if (!newSecretToken) return;
        navigator.clipboard.writeText(newSecretToken);
        setCopiedToken(true);
        toast.success("Secret API key copied to clipboard.");
        setTimeout(() => setCopiedToken(false), 2000);
    };

    return (
        <>
            <Head title="Developer & API Access Hub" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Developer & API Access Hub</h1>
                        <p className="text-xs text-text-secondary">
                            Generate reseller secret API keys and integrate Korak digital services via REST endpoints.
                        </p>
                    </div>

                    <div className="flex bg-bg-surface border border-border-subtle p-1 rounded-md">
                        <button
                            onClick={() => setActiveTab('keys')}
                            className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors cursor-pointer ${activeTab === 'keys' ? 'bg-brand text-brand-foreground' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            API Keys ({apiKeys.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors cursor-pointer ${activeTab === 'docs' ? 'bg-brand text-brand-foreground' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            API Documentation
                        </button>
                    </div>
                </div>

                {activeTab === 'keys' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Generate Form (4/12) */}
                        <div className="lg:col-span-4 bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Generate Secret API Key</h3>
                            <form onSubmit={handleCreateKey} className="space-y-4">
                                <Input
                                    label="Key Identifier / Label"
                                    placeholder="e.g. Reseller Bot Key"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full text-xs font-bold shadow-sm" isLoading={generating}>
                                    Generate New Secret Key
                                </Button>
                            </form>
                        </div>

                        {/* Keys Table (8/12) */}
                        <div className="lg:col-span-8 bg-bg-surface border border-border-subtle rounded-md shadow-xs overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-subtle">
                                <h3 className="text-sm font-bold text-text-primary">Active Secret Keys</h3>
                            </div>

                            {apiKeys.length === 0 ? (
                                <div className="p-8 text-center text-xs text-text-muted">No API keys generated yet.</div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {apiKeys.map((key) => (
                                        <div key={key.id} className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-text-primary">{key.name}</span>
                                                    <Badge variant={key.is_active ? "success" : "neutral"} className="text-[9px]">
                                                        {key.is_active ? "Active" : "Revoked"}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs font-mono text-text-muted">{key.key_prefix}••••••••••••</span>
                                            </div>

                                            {key.is_active && (
                                                <Button size="sm" variant="outline" className="text-xs text-error border-error-border hover:bg-error-bg" onClick={() => handleRevokeKey(key.id)}>
                                                    Revoke Key
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* API Documentation Tab */
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-text-primary">Korak REST API Endpoint Reference</h3>
                            <p className="text-xs text-text-secondary">Base URL: <code className="bg-bg-base px-2 py-0.5 rounded-sm font-mono text-brand">https://korakdigital.com/api/v1</code></p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-bg-base border border-border-subtle p-4 rounded-md space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-success text-white text-[10px] font-bold rounded-xs">POST</span>
                                    <code className="text-xs font-bold font-mono">/services/order</code>
                                </div>
                                <p className="text-xs text-text-secondary">Order digital numbers, social growth boosts, VPN keys, or eSIM profiles programmatically.</p>
                                <pre className="p-3 bg-bg-elevated text-text-primary text-xs font-mono rounded-md overflow-x-auto border border-border-subtle">
{`curl -X POST https://korakdigital.com/api/v1/services/order \\
  -H "Authorization: Bearer korak_live_xxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service_code": "num_instagram",
    "quantity": 1,
    "options": { "country": "US" }
  }'`}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Secret Key Created Modal */}
                {newSecretToken && (
                    <Modal isOpen={!!newSecretToken} onClose={() => setNewSecretToken(null)} title="Secret API Key Generated">
                        <div className="space-y-4 text-xs">
                            <p className="text-text-secondary">
                                Please copy your secret key now. <strong>It will not be displayed again.</strong>
                            </p>

                            <div className="bg-bg-base border border-border-subtle p-3 rounded-md flex items-center justify-between font-mono text-brand font-bold">
                                <span>{newSecretToken}</span>
                                <Button size="sm" onClick={handleCopyToken}>
                                    {copiedToken ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                                    {copiedToken ? "Copied" : "Copy"}
                                </Button>
                            </div>

                            <Button className="w-full text-xs font-bold" onClick={() => setNewSecretToken(null)}>
                                Done & Close
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}

Developer.layout = (page: React.ReactNode) => (
    <AppShell title="Developer API" backUrl="/user/settings">
        {page}
    </AppShell>
);
