import * as React from 'react';
import { router } from '@inertiajs/react';
import { useToast } from '@/components/ui/Toast';
import { getCsrfToken } from '@/lib/utils';
import {
    UniversalTransactionData,
    TransactionStep,
    TransactionStatus,
} from './types';

export function useTransactionFlow(initialData: UniversalTransactionData | null = null) {
    const toast = useToast();
    const [step, setStep] = React.useState<TransactionStep>('form');
    const [data, setData] = React.useState<UniversalTransactionData | null>(initialData);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);

    // Generate unique idempotency token for the transaction attempt
    const idempotencyKey = React.useMemo(() => {
        return 'idemp_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }, [step === 'confirming']);

    const startReview = (transactionPayload: UniversalTransactionData) => {
        setData(transactionPayload);
        setStep('review');
    };

    const openConfirmModal = (transactionPayload?: UniversalTransactionData) => {
        if (transactionPayload) {
            setData(transactionPayload);
        }
        setStep('confirming');
    };

    const closeConfirmModal = () => {
        if (!isProcessing) {
            setStep(prev => (prev === 'confirming' ? 'form' : prev));
        }
    };

    const executePayment = async (endpoint: string, payload: any): Promise<boolean> => {
        if (!data || isProcessing) return false;

        setIsProcessing(true);
        setStep('processing');

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                const failMessage = result.message || 'Transaction could not be processed.';
                setData(prev => (prev ? {
                    ...prev,
                    status: 'failed',
                    failureReason: failMessage,
                } : null));
                setStep('result');
                toast.error(failMessage);
                return false;
            }

            const backendStatus: TransactionStatus = result.status === 'success'
                ? 'completed'
                : result.status === 'pending'
                ? 'pending'
                : 'completed';

            const reference = result.order?.public_reference
                || result.order?.reference
                || result.reference
                || 'CLQ-' + Date.now().toString().slice(-8);

            setData(prev => (prev ? {
                ...prev,
                status: backendStatus,
                reference: reference,
                date: new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            } : null));

            setStep('result');
            toast.success(result.message || 'Transaction completed successfully!');

            // Reload user account in background to sync balance in AppShell
            router.reload({ only: ['auth'] });
            return true;
        } catch (err: any) {
            const errorMsg = err?.message || 'Network error occurred while connecting to the payment gateway.';
            setData(prev => (prev ? {
                ...prev,
                status: 'failed',
                failureReason: errorMsg,
            } : null));
            setStep('result');
            toast.error(errorMsg);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const checkStatus = async (reference: string, pollEndpoint?: string) => {
        if (!reference || isCheckingStatus) return;
        setIsCheckingStatus(true);

        const url = pollEndpoint || `/bills/${reference}`;

        try {
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            const result = await res.json();

            if (res.ok && result.status) {
                const newStatus: TransactionStatus = result.status === 'success' || result.status === 'completed'
                    ? 'completed'
                    : result.status === 'failed'
                    ? 'failed'
                    : 'pending';

                setData(prev => (prev ? { ...prev, status: newStatus } : null));

                if (newStatus === 'completed') {
                    toast.success('Transaction has been fulfilled!');
                    router.reload({ only: ['auth'] });
                } else if (newStatus === 'failed') {
                    toast.error('Transaction was not successful.');
                } else {
                    toast.info('Transaction is still processing.');
                }
            }
        } catch {
            toast.info('Status is unchanged.');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const resetFlow = () => {
        setStep('form');
        setData(null);
        setIsProcessing(false);
    };

    return {
        step,
        setStep,
        data,
        setData,
        isProcessing,
        isCheckingStatus,
        startReview,
        openConfirmModal,
        closeConfirmModal,
        executePayment,
        checkStatus,
        resetFlow,
    };
}
