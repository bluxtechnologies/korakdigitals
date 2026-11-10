import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Badge } from '@/components/ui/Badge';
import { UserGroupIcon, ListIcon, WalletIcon, ShieldIcon, SupportIcon } from '@/components/ui/Icons';

export default function AdminDashboard() {
    const { props } = usePage<any>();
    const stats = props.stats || { totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingFunding: 0, openTickets: 0 };
    const recentOrders = props.recentOrders || [];

    return (
        <>
            <Head title="Admin Command Center Overview" />
            <div className="space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-text-primary">System Command Overview</h1>
                        <p className="text-xs font-semibold text-text-secondary">Real-time operational metrics across Korak Digital Services.</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    
                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Registered Accounts</span>
                            <div className="text-2xl font-black font-mono text-text-primary">{stats.totalUsers}</div>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
                            <UserGroupIcon size={22} />
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Total System Orders</span>
                            <div className="text-2xl font-black font-mono text-text-primary">{stats.totalOrders}</div>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
                            <ListIcon size={22} />
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Gross Revenue</span>
                            <div className="text-2xl font-black font-mono text-success">₦{(Number(stats.totalRevenue) || 0).toLocaleString()}</div>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-success-bg text-success flex items-center justify-center border border-success-border">
                            <WalletIcon size={22} />
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Pending Funding</span>
                            <div className="text-2xl font-black font-mono text-warning">{stats.pendingFunding}</div>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-warning-bg text-warning flex items-center justify-center border border-warning-border">
                            <ShieldIcon size={22} />
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-5 rounded-md shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Active Tickets</span>
                            <div className="text-2xl font-black font-mono text-brand">{stats.openTickets || 0}</div>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
                            <SupportIcon size={22} />
                        </div>
                    </div>

                </div>

                {/* Recent Orders Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-base">
                        <h3 className="text-sm font-extrabold text-text-primary">Recent Platform Purchases</h3>
                        <Link href="/admin/users" className="text-xs font-bold text-brand hover:underline">
                            View Customer Directory &rarr;
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-xs font-semibold text-text-muted">No orders recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-extrabold border-b border-border-subtle">
                                        <th className="px-6 py-3.5">Reference</th>
                                        <th className="px-6 py-3.5">Customer Name</th>
                                        <th className="px-6 py-3.5">Category</th>
                                        <th className="px-6 py-3.5 text-right font-mono">Amount</th>
                                        <th className="px-6 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                                    {recentOrders.map((o: any) => (
                                        <tr key={o.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-brand">{o.public_reference}</td>
                                            <td className="px-6 py-3.5 font-bold text-text-primary">{o.user?.name || 'Customer'}</td>
                                            <td className="px-6 py-3.5 capitalize text-text-secondary">{o.service_category}</td>
                                            <td className="px-6 py-3.5 text-right font-mono font-bold text-text-primary">{o.currency_code} {o.total_amount}</td>
                                            <td className="px-6 py-3.5">
                                                <Badge variant={o.status === 'completed' ? 'success' : 'neutral'} className="text-[9px] font-extrabold uppercase">
                                                    {o.status}
                                                </Badge>
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

AdminDashboard.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
