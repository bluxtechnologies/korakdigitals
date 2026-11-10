import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { PaymentConfirmationModal } from './PaymentConfirmationModal';
import { TransactionProcessing } from './TransactionProcessing';
import { TransactionResult } from './TransactionResult';
import { UniversalTransactionData, TransactionStep, TransactionActionHandlers } from './types';

interface TransactionFlowModalProps {
    step: TransactionStep;
    data: UniversalTransactionData | null;
    isProcessing: boolean;
    isCheckingStatus?: boolean;
    onClose: () => void;
    onConfirmPay: () => void | Promise<void>;
    handlers?: TransactionActionHandlers;
}

export const TransactionFlowModal: React.FC<TransactionFlowModalProps> = ({
    step,
    data,
    isProcessing,
    isCheckingStatus = false,
    onClose,
    onConfirmPay,
    handlers = {},
}) => {
    if (!data || step === 'form' || step === 'review') return null;

    if (step === 'confirming') {
        return (
            <PaymentConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirmPay}
                data={data}
                isProcessing={isProcessing}
            />
        );
    }

    const modalTitle = step === 'processing'
        ? 'Processing'
        : data.status === 'completed'
        ? 'Transaction Complete'
        : data.status === 'pending'
        ? 'Transaction Pending'
        : data.status === 'refunded'
        ? 'Transaction Refunded'
        : 'Transaction Failed';

    return (
        <Modal
            isOpen={true}
            onClose={() => {
                if (!isProcessing) onClose();
            }}
            title={modalTitle}
            size="md"
        >
            {step === 'processing' ? (
                <TransactionProcessing data={data} />
            ) : (
                <TransactionResult
                    data={data}
                    handlers={{
                        ...handlers,
                        onBuyAgain: () => {
                            onClose();
                            handlers.onBuyAgain?.();
                        },
                        onTryAgain: () => {
                            onClose();
                            handlers.onTryAgain?.();
                        },
                        onEditOrder: () => {
                            onClose();
                            handlers.onEditOrder?.();
                        },
                    }}
                    isCheckingStatus={isCheckingStatus}
                />
            )}
        </Modal>
    );
};
