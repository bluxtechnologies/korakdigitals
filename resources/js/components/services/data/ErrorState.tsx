import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message = 'Unable to load data bundles for this network.',
    onRetry,
}) => {
    return (
        <div className="p-6 text-center bg-error-bg/20 border border-error/30 rounded-xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-error-bg border border-error/30 flex items-center justify-center mx-auto text-error">
                <AlertCircle size={18} />
            </div>
            <p className="text-xs font-bold text-error">
                {message}
            </p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 text-xs font-bold text-error hover:underline cursor-pointer"
                >
                    <RefreshCw size={13} />
                    <span>Try again</span>
                </button>
            )}
        </div>
    );
};
