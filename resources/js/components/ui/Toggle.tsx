import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
    ({ className, label, disabled, id, checked, onChange, ...props }, ref) => {
        const generatedId = React.useId();
        const toggleId = id || generatedId;

        return (
            <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={toggleId}
                        disabled={disabled}
                        checked={checked}
                        onChange={onChange}
                        className="sr-only peer"
                        {...props}
                    />
                    <div
                        onClick={(e) => {
                            if (disabled) return;
                            const input = document.getElementById(toggleId) as HTMLInputElement;
                            if (input) input.click();
                        }}
                        className={cn(
                            "w-9 h-5 bg-bg-surface-active rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-subtle peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand transition-all cursor-pointer",
                            disabled && "opacity-50 pointer-events-none"
                        )}
                    />
                </div>
                {label && (
                    <label
                        htmlFor={toggleId}
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

Toggle.displayName = 'Toggle';

export { Toggle };
