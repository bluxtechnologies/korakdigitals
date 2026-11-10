import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function UserPortfolioFunding() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const fundingAccounts = props.fundingAccounts || [];
    const requestsList = props.fundingRequests?.data || props.fundingRequests || [];
    const toast = useToast();

    const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
    const [actionType, setActionType] = React.useState<'approve' | 'reject'>('approve');
    const [reason, setReason] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const handleProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setSubmitting(true);
        const endpoint = actionType === 'approve'
            ? `/admin/funding-requests/${selectedRequest.id}/approve`
            : `/admin/funding-requests/${selectedRequest.id}/reject`;

        router.post(endpoint, { reason }, {
            onSuccess: () => {
                setSubmitting(false);
                setSelectedRequest(null);
                setReason('');
                toast.success(`Funding request ${actionType}d successfully!`);
            },
            onError: (err: any) => {
                setSubmitting(false);
                toast.error(err.message || 'Processing failed.');
            }
        });
    };

    return (
        <>
            <Head title={`User Funding Accounts & Deposits: ${user.name}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                {/* Virtual Accounts Section */}
                <div className="space-y-3">
                    <h3 className="text-lg font-black tracking-tight text-text-primary">Assigned FinityPay Virtual Bank Accounts</h3>
                    
                    {fundingAccounts.length === 0 ? (
                        <div className="p-5 bg-bg-surface border border-border-subtle rounded-md text-xs font-semibold text-text-muted">
                            No active virtual bank accounts generated yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fundingAccounts.map((fa: any) => (
                                <div key={fa.id} className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-xs space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-text-primary">{fa.bank_name}</span>
                                        <Badge variant="success" className="text-[9px] uppercase font-extrabold">{fa.status}</Badge>
                                    </div>
                                    <div className="text-xl font-black font-mono text-brand tracking-wider">{fa.account_number}</div>
                                    <div className="text-xs font-semibold text-text-secondary">Account Name: {fa.account_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Manual Funding Receipts Table */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-black tracking-tight text-text-primary">Manual Transfer Deposit Receipts</h3>

                    <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                        {requestsList.length === 0 ? (
                            <div className="p-8 text-center text-xs font-semibold text-text-muted">No manual deposit receipts submitted by this user.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-extrabold border-b border-border-subtle">
                                            <th className="px-6 py-3.5">Reference</th>
                                            <th className="px-6 py-3.5">Bank & Sender</th>
                                            <th className="px-6 py-3.5 text-right font-mono">Amount</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                                        {requestsList.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-bg-surface-hover transition-colors">
                                                <td className="px-6 py-3.5 font-mono font-bold text-brand">{req.provider_reference || req.public_reference}</td>
                                                <td className="px-6 py-3.5 text-text-secondary">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-text-primary">{req.sender_name}</span>
                                                        <span className="text-[10px] text-text-muted">{req.sender_bank_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-right font-mono font-bold text-success">
                                                    {req.currency_code} {req.amount}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'neutral'} className="text-[9px] font-extrabold uppercase">
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    {req.status === 'pending' && (
                                                        <div className="flex justify-center gap-2">
                                                            <Button size="sm" className="text-xs bg-success hover:opacity-90 text-white font-bold rounded-md" onClick={() => { setSelectedRequest(req); setActionType('approve'); }}>
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="text-xs text-error border-error-border hover:bg-error-bg font-bold rounded-md" onClick={() => { setSelectedRequest(req); setActionType('reject'); }}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Process Modal */}
                {selectedRequest && (
                    <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Funding: ${selectedRequest.provider_reference || selectedRequest.public_reference}`}>
                        <form onSubmit={handleProcess} className="space-y-4 text-xs">
                            <p className="text-text-secondary">
                                {actionType === 'approve'
                                    ? `This will credit ${selectedRequest.currency_code} ${selectedRequest.amount} directly to ${user.name}'s wallet.`
                                    : `Mark transfer ${selectedRequest.provider_reference || selectedRequest.public_reference} as rejected.`
                                }
                            </p>

                            <Input
                                label="Verification Note / Reason"
                                placeholder={actionType === 'approve' ? "Bank deposit confirmed" : "Receipt invalid"}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />

                            <Button type="submit" className={`w-full py-3 text-white font-bold rounded-md shadow-sm ${actionType === 'approve' ? 'bg-success hover:opacity-90' : 'bg-error hover:opacity-90'}`} isLoading={submitting}>
                                Confirm {actionType === 'approve' ? 'Approval & Credit Wallet' : 'Rejection'}
                            </Button>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

UserPortfolioFunding.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
