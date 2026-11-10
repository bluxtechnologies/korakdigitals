import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, error, disabled, id, ...props }, ref) => {
        const generatedId = React.useId();
        const checkboxId = id || generatedId;

        return (
            <div className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                    ref={ref}
                    type="checkbox"
                    id={checkboxId}
                    disabled={disabled}
                    className={cn(
                        "w-4.5 h-4.5 rounded-sm border-2 border-border-strong bg-bg-surface text-brand focus:ring-2 focus:ring-brand-subtle focus:ring-offset-0 transition-all checked:bg-brand checked:border-brand disabled:opacity-50 cursor-pointer accent-brand",
                        error && "border-error focus:ring-error-border",
                        className
                    )}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className={cn(
                            "text-sm font-medium text-text-secondary select-none cursor-pointer",
                            disabled && "opacity-50 pointer-events-none"
                        )}
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
