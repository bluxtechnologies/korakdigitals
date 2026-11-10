import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Badge } from '@/components/ui/Badge';

export default function UserPortfolioSupport() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const ticketsData = props.tickets?.data || props.tickets || [];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open':
                return 'warning';
            case 'in_progress':
                return 'neutral';
            case 'resolved':
                return 'success';
            case 'closed':
                return 'neutral';
            default:
                return 'neutral';
        }
    };

    return (
        <>
            <Head title={`User Support Tickets: ${user?.name || 'Customer'}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-text-primary">Customer Support Tickets</h3>
                        <p className="text-xs font-semibold text-text-secondary">
                            View help desk conversations, open inquiries, and ticket resolution history for this user.
                        </p>
                    </div>

                    <Link
                        href="/admin/support"
                        className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
                    >
                        View Global Support Inbox &rarr;
                    </Link>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    {ticketsData.length === 0 ? (
                        <div className="p-8 text-center text-xs font-semibold text-text-muted">
                            No support tickets submitted by this customer yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Ticket ID</th>
                                        <th className="px-6 py-3">Subject</th>
                                        <th className="px-6 py-3">Latest Activity</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {ticketsData.map((ticket: any) => (
                                        <tr key={ticket.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-mono font-bold text-brand">
                                                #{ticket.id}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-semibold text-text-primary">
                                                    {ticket.subject}
                                                </div>
                                                {ticket.latest_message && (
                                                    <div className="text-[11px] text-text-muted line-clamp-1 max-w-sm">
                                                        {ticket.latest_message.message}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-[11px] text-text-muted">
                                                {new Date(ticket.updated_at || ticket.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge
                                                    variant={getStatusVariant(ticket.status)}
                                                    dot
                                                    className="text-[10px] uppercase font-bold"
                                                >
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={`/admin/support/${ticket.id}`}
                                                    className="inline-flex items-center px-2.5 py-1.5 bg-brand-subtle text-brand font-medium text-xs rounded-md hover:bg-brand/15 transition-colors"
                                                >
                                                    Open Ticket &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

UserPortfolioSupport.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
