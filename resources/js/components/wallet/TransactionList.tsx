import * as React from 'react';
import { Link } from '@inertiajs/react';
import { Folder, Search } from 'lucide-react';
import { LedgerTransaction } from './types';
import { TransactionListItem } from './TransactionListItem';

interface TransactionListProps {
    transactions: LedgerTransaction[];
    displaySymbol: string;
    onSelectTransaction: (transaction: LedgerTransaction) => void;
    hasFilterOrSearch?: boolean;
    onResetFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    displaySymbol,
    onSelectTransaction,
    hasFilterOrSearch = false,
    onResetFilter,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-text-primary tracking-tight">
                    Recent Transactions
                </h2>
                <Link
                    href="/user/wallet/history"
                    className="text-xs font-semibold text-brand hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
                            {hasFilterOrSearch ? <Search size={22} /> : <Folder size={22} />}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-text-primary">
                                {hasFilterOrSearch ? 'No matching transactions' : 'No transactions recorded yet'}
                            </h3>
                            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
                                {hasFilterOrSearch
                                    ? 'Try changing your search query or switching the active tab filter.'
                                    : 'When you fund your wallet or purchase digital services, records will appear here.'}
                            </p>
                        </div>
                        {hasFilterOrSearch && onResetFilter && (
                            <button
                                type="button"
                                onClick={onResetFilter}
                                className="text-xs font-bold text-brand hover:underline pt-1 cursor-pointer"
                            >
                                Reset filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border-subtle/70">
                        {transactions.map(txn => (
                            <TransactionListItem
                                key={txn.id || txn.reference}
                                transaction={txn}
                                displaySymbol={displaySymbol}
                                onSelect={onSelectTransaction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
