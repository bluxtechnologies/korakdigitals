import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Badge } from '@/components/ui/Badge';
import { ListIcon, WalletIcon, KeyIcon, InboxIcon } from '@/components/ui/Icons';

export default function UserPortfolioIndex() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const stats = props.stats || {};
    const recentOrders = props.recentOrders || [];
    const recentTransactions = props.recentTransactions || [];
    const getTxnSymbol = (code?: string) => {
        const c = (code || user?.currency?.code || 'NGN').toUpperCase();
        if (c === 'USD') return '$';
        if (c === 'NGN') return '₦';
        if (c === 'EUR') return '€';
        if (c === 'GBP') return '£';
        return c ? `${c} ` : '₦';
    };

    const symbol = user?.currency?.symbol || getTxnSymbol();

    return (
        <>
            <Head title={`User Portfolio: ${user?.name || 'Customer'}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                {/* Quick Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Total Customer Orders</span>
                        <div className="text-xl font-black font-mono text-text-primary">{stats.totalOrders || 0} ({stats.completedOrders || 0} Completed)</div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Gross Customer Spent</span>
                        <div className="text-xl font-black font-mono text-success">{symbol}{(Number(stats.totalSpent) || 0).toLocaleString()}</div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Active Developer Keys</span>
                        <div className="text-xl font-black font-mono text-brand">{stats.apiKeysCount || 0} Tokens</div>
                    </div>

                    <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-xs space-y-1">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Disposable Emails</span>
                        <div className="text-xl font-black font-mono text-text-primary">{stats.tempEmailsCount || 0} Generated</div>
                    </div>
                </div>

                {/* 2-Column Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Orders */}
                    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">Recent Orders</h3>
                            <Link href={`/admin/users/${user.id}/orders`} className="text-xs font-bold text-brand hover:underline">
                                View All Orders &rarr;
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="p-6 text-center text-xs font-semibold text-text-muted">No recent orders.</div>
                        ) : (
                            <div className="space-y-2">
                                {recentOrders.map((o: any) => (
                                    <div key={o.id} className="p-3 bg-bg-base border border-border-subtle rounded-md flex justify-between items-center text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-brand">{o.public_reference}</span>
                                            <span className="text-[10px] text-text-muted capitalize">{o.service_category}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-text-primary">{o.currency_code} {o.total_amount}</span>
                                            <Badge variant={o.status === 'completed' ? 'success' : 'neutral'} className="text-[9px]">
                                                {o.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Ledger Transactions */}
                    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">Recent Ledger Activity</h3>
                            <Link href={`/admin/users/${user.id}/wallet`} className="text-xs font-bold text-brand hover:underline">
                                View Wallet Ledger &rarr;
                            </Link>
                        </div>

                        {recentTransactions.length === 0 ? (
                            <div className="p-6 text-center text-xs font-semibold text-text-muted">No ledger activity recorded.</div>
                        ) : (
                            <div className="space-y-2">
                                {recentTransactions.map((tx: any) => (
                                    <div key={tx.id} className="p-3 bg-bg-base border border-border-subtle rounded-md flex justify-between items-center text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-primary">{tx.description}</span>
                                            <span className="text-[10px] text-text-muted font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-success' : 'text-text-primary'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}{getTxnSymbol(tx.currency_code)}{Number(tx.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </>
    );
}

UserPortfolioIndex.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;