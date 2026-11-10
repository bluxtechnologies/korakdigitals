import * as React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Badge } from '@/components/ui/Badge';

export default function UserPortfolioAuditLogs() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const logsList = props.auditLogs?.data || props.auditLogs || [];

    return (
        <>
            <Head title={`User Security Audit Trail: ${user.name}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                <div>
                    <h3 className="text-lg font-black tracking-tight text-text-primary">User Security Audit Trail</h3>
                    <p className="text-xs font-semibold text-text-secondary">Security event log specifically tracking actions performed by or target changes to this user.</p>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-xs">
                    {logsList.length === 0 ? (
                        <div className="p-8 text-center text-xs font-semibold text-text-muted">No audit logs recorded for this user.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-extrabold border-b border-border-subtle">
                                        <th className="px-6 py-3.5">Timestamp</th>
                                        <th className="px-6 py-3.5">Actor</th>
                                        <th className="px-6 py-3.5">Action</th>
                                        <th className="px-6 py-3.5">Reference / Target</th>
                                        <th className="px-6 py-3.5">Reason / Audit Trail Details</th>
                                        <th className="px-6 py-3.5 font-mono">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                                    {logsList.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3.5 font-mono text-[11px] text-text-muted">
                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <Badge variant={log.actor_type === 'admin' ? 'primary' : log.actor_type === 'user' ? 'success' : 'neutral'} className="text-[9px] uppercase font-extrabold">
                                                    {log.actor_type} #{log.actor_id || 'sys'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3.5 font-bold text-text-primary font-mono">{log.action}</td>
                                            <td className="px-6 py-3.5 font-mono text-brand font-semibold">{log.reference || log.target_type || '-'}</td>
                                            <td className="px-6 py-3.5 text-text-secondary max-w-xs truncate">{log.reason || '-'}</td>
                                            <td className="px-6 py-3.5 font-mono text-text-muted">{log.ip_address}</td>
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

UserPortfolioAuditLogs.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
