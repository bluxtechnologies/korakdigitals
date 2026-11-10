import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function UserPortfolioWallet() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const transactionsList = props.transactions?.data || props.transactions || [];
    const toast = useToast();
    const currencyCode = user.currency?.code || 'NGN';

    const getTxnSymbol = (code?: string) => {
        const c = (code || currencyCode).toUpperCase();
        if (c === 'USD') return '$';
        if (c === 'NGN') return '₦';
        if (c === 'EUR') return '€';
        if (c === 'GBP') return '£';
        return c ? `${c} ` : '₦';
    };

    const [isAdjustModalOpen, setIsAdjustModalOpen] = React.useState(false);
    const [adjustType, setAdjustType] = React.useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = React.useState('');
    const [reason, setReason] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const handleAdjustWallet = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !reason) return;

        setSubmitting(true);
        router.post(`/admin/users/${user.id}/wallet-adjust`, {
            type: adjustType,
            amount: parseFloat(amount),
            reason: reason,
        }, {
            onSuccess: () => {
                setSubmitting(false);
                setIsAdjustModalOpen(false);
                setAmount('');
                setReason('');
                toast.success(`User wallet ${adjustType}ed successfully with audit log!`);
            },
            onError: (err: any) => {
                setSubmitting(false);
                toast.error(err.message || 'Failed to adjust wallet.');
            }
        });
    };

    return (
        <>
            <Head title={`User Wallet Ledger: ${user.name}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-text-primary">Wallet Double-Entry Ledger History</h3>
                        <p className="text-xs font-semibold text-text-secondary">Complete audit log of all balance deposits, credits, debits, and order charges.</p>
                    </div>

                    <Button className="py-2.5 px-4 font-bold text-xs shadow-sm rounded-md" onClick={() => setIsAdjustModalOpen(true)}>
                        + Adjust User Wallet Balance
                    </Button>
                </div>

                {/* Transactions Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    {transactionsList.length === 0 ? (
                        <div className="p-8 text-center text-xs font-semibold text-text-muted">No ledger transactions recorded.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-extrabold border-b border-border-subtle">
                                        <th className="px-6 py-3.5">Reference / Txn ID</th>
                                        <th className="px-6 py-3.5">Description</th>
                                        <th className="px-6 py-3.5">Category</th>
                                        <th className="px-6 py-3.5 text-right font-mono">Amount</th>
                                        <th className="px-6 py-3.5 text-right font-mono">Balance After</th>
                                        <th className="px-6 py-3.5 font-mono">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                                    {transactionsList.map((tx: any) => (
                                        <tr key={tx.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-brand">{tx.reference || `TXN-${tx.id}`}</td>
                                            <td className="px-6 py-3.5 font-bold text-text-primary">{tx.description}</td>
                                            <td className="px-6 py-3.5 capitalize text-text-secondary">{tx.category}</td>
                                            <td className={`px-6 py-3.5 text-right font-mono font-bold ${tx.type === 'credit' ? 'text-success' : 'text-text-primary'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}{getTxnSymbol(tx.currency_code)}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3.5 text-right font-mono font-bold text-text-primary">
                                                {getTxnSymbol(tx.currency_code)}{Number(tx.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3.5 font-mono text-[11px] text-text-muted">
                                                {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Adjust Balance Modal */}
                {isAdjustModalOpen && (
                    <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={`Adjust Wallet: ${user.name}`}>
                        <form onSubmit={handleAdjustWallet} className="space-y-4 text-xs">
                            <div className="flex gap-2 p-1 bg-bg-surface-hover rounded-md">
                                <button
                                    type="button"
                                    onClick={() => setAdjustType('credit')}
                                    className={`flex-1 py-2 font-bold rounded-md transition-all cursor-pointer ${adjustType === 'credit' ? 'bg-success text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    + Credit Wallet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustType('debit')}
                                    className={`flex-1 py-2 font-bold rounded-md transition-all cursor-pointer ${adjustType === 'debit' ? 'bg-error text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    - Debit Wallet
                                </button>
                            </div>

                            <Input
                                label={`Amount (${currencyCode})`}
                                type="number"
                                placeholder="5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />

                            <Input
                                label="Reason / Audit Reference"
                                placeholder="e.g. Promotional grant or manual bank transfer credit"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />

                            <Button type="submit" className="w-full py-3 bg-brand hover:bg-brand-hover font-bold text-brand-foreground rounded-md shadow-sm" isLoading={submitting}>
                                Confirm Wallet {adjustType === 'credit' ? 'Credit' : 'Debit'} & Log Audit
                            </Button>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

UserPortfolioWallet.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;