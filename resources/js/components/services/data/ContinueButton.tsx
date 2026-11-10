import * as React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
    onClick,
    disabled = false,
    isLoading = false,
    className,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            aria-label="Continue to Review"
            className={cn(
                "w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                className
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <span>Continue to Review</span>
                    <ArrowRight size={16} />
                </>
            )}
        </button>
    );
};
