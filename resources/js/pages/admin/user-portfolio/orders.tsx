import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function UserPortfolioOrders() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const ordersList = props.orders?.data || props.orders || [];
    const toast = useToast();

    const [selectedRefundOrder, setSelectedRefundOrder] = React.useState<any>(null);
    const [refundReason, setRefundReason] = React.useState('');
    const [refunding, setRefunding] = React.useState(false);

    const handleRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundOrder) return;

        setRefunding(true);
        router.post(`/admin/orders/${selectedRefundOrder.id}/refund`, {
            reason: refundReason || 'Admin automated refund'
        }, {
            onSuccess: () => {
                setRefunding(false);
                setSelectedRefundOrder(null);
                setRefundReason('');
                toast.success('Order refunded and customer wallet credited!');
            },
            onError: (err: any) => {
                setRefunding(false);
                toast.error(err.message || 'Refund failed.');
            }
        });
    };

    return (
        <>
            <Head title={`User Orders: ${user.name}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                <div>
                    <h3 className="text-lg font-black tracking-tight text-text-primary">Customer Digital Service Orders</h3>
                    <p className="text-xs font-semibold text-text-secondary">View purchased SMS verification numbers, social growth campaigns, eSIM profiles, and trigger refunds.</p>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    {ordersList.length === 0 ? (
                        <div className="p-8 text-center text-xs font-semibold text-text-muted">No orders recorded for this user.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-extrabold border-b border-border-subtle">
                                        <th className="px-6 py-3.5">Reference</th>
                                        <th className="px-6 py-3.5">Category</th>
                                        <th className="px-6 py-3.5 text-right font-mono">Total Amount</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 font-mono">Timestamp</th>
                                        <th className="px-6 py-3.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                                    {ordersList.map((o: any) => (
                                        <tr key={o.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-brand">{o.public_reference}</td>
                                            <td className="px-6 py-3.5 capitalize text-text-secondary font-bold">{o.service_category}</td>
                                            <td className="px-6 py-3.5 text-right font-mono font-bold text-text-primary">{o.currency_code} {o.total_amount}</td>
                                            <td className="px-6 py-3.5">
                                                <Badge variant={o.status === 'completed' ? 'success' : o.status === 'refunded' ? 'error' : 'neutral'} className="text-[9px] font-extrabold uppercase">
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3.5 font-mono text-[11px] text-text-muted">
                                                {new Date(o.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                {o.status !== 'refunded' && (
                                                    <Button size="sm" variant="outline" className="text-xs font-bold text-error hover:text-error border-error-border hover:bg-error-bg" onClick={() => setSelectedRefundOrder(o)}>
                                                        1-Click Refund
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Refund Confirmation Modal */}
                {selectedRefundOrder && (
                    <Modal isOpen={!!selectedRefundOrder} onClose={() => setSelectedRefundOrder(null)} title={`Refund Order: ${selectedRefundOrder.public_reference}`}>
                        <form onSubmit={handleRefund} className="space-y-4 text-xs">
                            <p className="text-text-secondary">
                                Credit <strong>{selectedRefundOrder.currency_code} {selectedRefundOrder.total_amount}</strong> back to {user.name}'s wallet.
                            </p>

                            <Input
                                label="Reason for Refund"
                                placeholder="e.g. Code not delivered in time"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                required
                            />

                            <Button type="submit" className="w-full py-3 bg-error hover:opacity-90 text-white font-bold rounded-md shadow-sm" isLoading={refunding}>
                                Execute Order Refund & Credit User
                            </Button>
                        </form>
                    </Modal>
                )}

            </div>
        </>
    );
}

UserPortfolioOrders.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
