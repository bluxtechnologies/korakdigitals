import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SearchIcon, FolderIcon } from '@/components/ui/Icons';
import { CopyButton } from '@/components/ui/CopyButton';
import { TransactionReceiptModal, TransactionReceiptData } from '@/components/ui/TransactionReceiptModal';
import { cn } from '@/lib/utils';

export default function Orders() {
    const { props } = usePage<any>();
    const dbOrders = props.orders?.data || props.orders || [];

    // Filters & Queries
    const [search, setSearch] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [selectedReceipt, setSelectedReceipt] = React.useState<TransactionReceiptData | null>(null);

    // Filtered orders list
    const filteredOrders = dbOrders.filter((o: any) => {
        const itemTitle = o.items && o.items[0] ? (o.items[0].item_title || o.items[0].item_identifier || '') : '';
        const matchesSearch =
            (o.public_reference || '').toLowerCase().includes(search.toLowerCase()) ||
            itemTitle.toLowerCase().includes(search.toLowerCase()) ||
            (o.service_category || '').toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'active') return matchesSearch && (o.status === 'active' || o.status === 'processing');
        if (activeTab === 'completed') return matchesSearch && o.status === 'completed';
        if (activeTab === 'cancelled') return matchesSearch && (o.status === 'cancelled' || o.status === 'failed' || o.status === 'refunded');
        return matchesSearch;
    });

    const counts = React.useMemo(() => {
        return {
            all: dbOrders.length,
            active: dbOrders.filter((o: any) => o.status === 'active' || o.status === 'processing').length,
            completed: dbOrders.filter((o: any) => o.status === 'completed').length,
            cancelled: dbOrders.filter((o: any) => o.status === 'cancelled' || o.status === 'failed' || o.status === 'refunded').length
        };
    }, [dbOrders]);

    const openReceipt = (order: any) => {
        const firstItem = order.items && order.items[0] ? order.items[0] : null;
        const itemTitle = firstItem ? (firstItem.item_title || firstItem.item_identifier || 'Digital Service') : 'Digital Service';
        const creds = firstItem?.credentials_payload ? JSON.stringify(firstItem.credentials_payload, null, 2) : undefined;

        setSelectedReceipt({
            reference: order.public_reference,
            providerReference: firstItem?.supplier_order_reference,
            serviceName: itemTitle,
            category: order.service_category,
            amount: Number(order.total_amount),
            currencySymbol: (() => { const c = (order.currency_code || '').toUpperCase(); return c === 'USD' ? '$' : c === 'NGN' ? '₦' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : c ? `${c} ` : '₦'; })(),
            status: order.status,
            date: new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            deliveredData: creds,
            deliveredDataLabel: 'Delivered Credentials / Output',
        });
    };

    return (
        <>
            <Head title="Order History Logs" />
            <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn px-4 py-4 md:px-0 md:py-0 pb-16">
                
                {/* Standardized Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Order History</h1>
                        <p className="text-xs text-text-secondary">
                            Full audit log of all purchases, delivered digital credentials, and printable receipts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a href="/user/orders/export/csv" download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-subtle hover:bg-bg-surface-hover text-text-primary text-xs font-bold rounded-md transition-colors shadow-2xs cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-text-muted">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span>Export CSV</span>
                        </a>
                        <a href="/user/orders/export/txt" download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-brand-foreground text-xs font-bold rounded-md hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span>Export TXT</span>
                        </a>
                        <Link href="/user/numbers">
                            <Button className="text-xs font-bold shadow-sm">
                                + Rent New Number
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search & Tabs Controls bar */}
                <div className="bg-bg-surface border border-border-subtle p-4 rounded-md shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Tab Toggles */}
                    <div className="flex bg-bg-base border border-border-subtle p-1 rounded-sm w-full md:w-auto">
                        {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 md:flex-none px-3.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer",
                                    activeTab === tab
                                        ? "bg-bg-surface text-text-primary border border-border-subtle shadow-xs font-bold"
                                        : "text-text-secondary hover:text-text-primary"
                                )}
                            >
                                <span className="capitalize">{tab}</span>
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-border-subtle text-[10px] text-text-muted">
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Field */}
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Search by reference, service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<SearchIcon className="text-text-muted" />}
                            className="bg-bg-base"
                        />
                    </div>
                </div>

                {/* Table details listing */}
                <div className="bg-bg-surface border border-border-subtle rounded-md shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-bg-base text-text-secondary uppercase text-[10px] font-bold border-b border-border-subtle select-none">
                                    <th className="p-4">Reference</th>
                                    <th className="p-4">Service Category</th>
                                    <th className="p-4">Item Details</th>
                                    <th className="p-4 text-right font-mono tabular-nums">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Purchased Date</th>
                                    <th className="p-4 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-text-secondary">
                                            <div className="flex flex-col items-center justify-center gap-3 py-6">
                                                <div className="w-12 h-12 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted">
                                                    <FolderIcon size={24} />
                                                </div>
                                                <span className="text-sm font-bold text-text-primary">No Matching Orders</span>
                                                <span className="text-xs text-text-muted max-w-xs leading-relaxed mx-auto">
                                                    We couldn't find any orders matching your search query or tab filter.
                                                </span>
                                                <Link href="/user/numbers" className="mt-2">
                                                    <Button size="sm" variant="outline" className="text-xs font-bold">
                                                        Browse Services
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order: any) => {
                                        const firstItem = order.items && order.items[0] ? order.items[0] : null;
                                        const itemTitle = firstItem ? (firstItem.item_title || firstItem.item_identifier || '-') : '-';
                                        const isCompleted = order.status === 'completed';
                                        const isPending = order.status === 'active' || order.status === 'processing';

                                        return (
                                            <tr 
                                                key={order.id} 
                                                onClick={() => openReceipt(order)}
                                                className="hover:bg-bg-surface-hover/60 transition-colors cursor-pointer select-none"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 font-mono tabular-nums font-bold text-brand">
                                                        <span>{order.public_reference}</span>
                                                        <CopyButton text={order.public_reference} size="xs" />
                                                    </div>
                                                </td>
                                                <td className="p-4 font-semibold text-text-primary capitalize">{order.service_category}</td>
                                                <td className="p-4 font-mono text-text-secondary max-w-xs truncate">{itemTitle}</td>
                                                <td className="p-4 text-right font-mono tabular-nums font-bold text-text-primary">
                                                    {(() => { const c = (order.currency_code || '').toUpperCase(); return c === 'USD' ? `$${Number(order.total_amount).toFixed(2)}` : c === 'NGN' ? `₦${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : c === 'EUR' ? `€${Number(order.total_amount).toFixed(2)}` : c === 'GBP' ? `£${Number(order.total_amount).toFixed(2)}` : `${c} ${Number(order.total_amount).toFixed(2)}`; })()}
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant={isCompleted ? 'success' : isPending ? 'warning' : 'neutral'}
                                                        statusIcon={isCompleted ? 'check' : isPending ? 'clock' : undefined}
                                                        className="font-bold text-[10px] capitalize"
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-text-muted font-mono tabular-nums text-[11px] whitespace-nowrap">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button size="sm" variant="outline" className="text-xs font-bold pointer-events-none">
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Receipt Modal */}
            <TransactionReceiptModal
                isOpen={Boolean(selectedReceipt)}
                onClose={() => setSelectedReceipt(null)}
                receipt={selectedReceipt}
            />
        </>
    );
}

Orders.layout = (page: React.ReactNode) => (
    <AppShell title="Order History" backUrl="/user/dashboard">
        {page}
    </AppShell>
);
