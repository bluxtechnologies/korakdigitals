import * as React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CurrencyItem {
    id: number;
    code: string;
    name: string;
    symbol: string;
}

export default function AdminUsers() {
    const { props } = usePage<any>();
    const usersPage = props.users || {};
    const usersList = usersPage.data || [];
    const links: PaginationLink[] = usersPage.links || [];
    const currencies: CurrencyItem[] = props.currencies || [];

    const [search, setSearch] = React.useState(props.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const defaultCurrency = currencies.find((c) => c.code === 'NGN') || currencies[0];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        currency_id: defaultCurrency ? String(defaultCurrency.id) : '',
        initial_balance: '',
        is_verified: true,
        auto_provision_finitypay: true,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get('/admin/users', { search: value || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);
    };

    const handleGeneratePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
        let pass = '';
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', pass);
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    const statusVariant = (status: string) =>
        status === 'active' ? 'success' : status === 'suspended' ? 'warning' : 'error';

    return (
        <>
            <Head title="Admin User Directory" />
            <div className="space-y-6 animate-fadeIn select-none">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">User Account Directory</h1>
                        <p className="text-xs text-text-secondary">Search customer accounts, provision new users, or open a profile to manage wallet and orders.</p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-64">
                            <Input
                                placeholder="Search by name, email or phone…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => {
                                clearErrors();
                                setIsCreateModalOpen(true);
                            }}
                            className="text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create User
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    {usersList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-text-muted">No matching user accounts found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Customer Details</th>
                                        <th className="px-6 py-3">Phone Number</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">FinityPay Status</th>
                                        <th className="px-6 py-3 text-right font-mono">Available Balance</th>
                                        <th className="px-6 py-3 text-right font-mono">Total Deposited</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {usersList.map((u: any) => {
                                        const symbol = u.currency?.symbol || '₦';
                                        const isFinityPayConnected = !!u.finitypay_customer_uuid;
                                        return (
                                            <tr key={u.id} className="hover:bg-bg-surface-hover transition-colors">
                                                <td className="px-6 py-3">
                                                    <Link href={`/admin/users/${u.id}`} className="flex flex-col group w-fit">
                                                        <span className="font-medium text-text-primary group-hover:text-brand transition-colors">{u.name}</span>
                                                        <span className="text-[11px] text-text-muted font-mono">{u.email}</span>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-text-secondary">{u.phone || 'N/A'}</td>
                                                <td className="px-6 py-3">
                                                    <Badge variant={statusVariant(u.status)} dot className="text-[10px] capitalize">
                                                        {u.status || 'active'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {isFinityPayConnected ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success font-mono bg-success-bg border border-success-border px-2 py-0.5 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                            Provisioned
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted font-mono bg-bg-base border border-border-subtle px-2 py-0.5 rounded-full">
                                                            Not Provisioned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono font-medium text-text-primary">
                                                    {symbol}{(Number(u.account?.available_balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-text-secondary">
                                                    {symbol}{(Number(u.account?.total_deposit) || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Link
                                                        href={`/admin/users/${u.id}`}
                                                        className="inline-flex items-center px-2.5 py-1.5 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                    >
                                                        Manage User &rarr;
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                    link.active
                                        ? 'bg-brand text-brand-foreground border-brand'
                                        : link.url
                                        ? 'border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                                        : 'border-border-subtle text-text-muted cursor-not-allowed opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* Create User Modal Dialog */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    clearErrors();
                }}
                title="Create New User Account"
                size="lg"
            >
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-primary block">
                                Full Name <span className="text-danger">*</span>
                            </label>
                            <Input
                                placeholder="e.g. John Doe"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-primary block">
                                Email Address <span className="text-danger">*</span>
                            </label>
                            <Input
                                type="email"
                                placeholder="e.g. user@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-primary block">
                                Phone Number (for FinityPay VA) <span className="text-danger">*</span>
                            </label>
                            <Input
                                type="tel"
                                placeholder="e.g. 08012345678"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-text-primary block">
                                    Initial Password <span className="text-danger">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
                                >
                                    Generate Strong
                                </button>
                            </div>
                            <Input
                                type="text"
                                placeholder="Minimum 8 characters"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                            />
                        </div>

                        {/* Currency */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-primary block">
                                Account Currency
                            </label>
                            <select
                                value={data.currency_id}
                                onChange={(e) => setData('currency_id', e.target.value)}
                                className="w-full text-xs bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-brand"
                            >
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.name} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Initial Balance */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-primary block">
                                Initial Wallet Balance (Optional)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={data.initial_balance}
                                onChange={(e) => setData('initial_balance', e.target.value)}
                                error={errors.initial_balance}
                            />
                        </div>

                    </div>

                    {/* Checkbox Options */}
                    <div className="pt-2 border-t border-border-subtle space-y-2.5">
                        
                        {/* Auto-provision FinityPay */}
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.auto_provision_finitypay}
                                onChange={(e) => setData('auto_provision_finitypay', e.target.checked)}
                                className="mt-0.5 rounded border-border-strong text-brand focus:ring-brand"
                            />
                            <div>
                                <span className="text-xs font-bold text-text-primary block">
                                    Automatic FinityPay Customer & Virtual Account Provisioning
                                </span>
                                <span className="text-[11px] text-text-muted block">
                                    Immediately creates customer on FinityPay and provisions dedicated NUBAN bank account.
                                </span>
                            </div>
                        </label>

                        {/* Mark Email as Verified */}
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_verified}
                                onChange={(e) => setData('is_verified', e.target.checked)}
                                className="mt-0.5 rounded border-border-strong text-brand focus:ring-brand"
                            />
                            <div>
                                <span className="text-xs font-bold text-text-primary block">
                                    Mark Email as Verified Immediately
                                </span>
                                <span className="text-[11px] text-text-muted block">
                                    User will not be prompted to verify email upon first login.
                                </span>
                            </div>
                        </label>

                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border-subtle flex justify-end items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={processing}
                            className="font-bold shadow-xs"
                        >
                            Create & Provision Account
                        </Button>
                    </div>

                </form>
            </Modal>
        </>
    );
}

AdminUsers.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;