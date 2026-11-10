import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    helperText?: string;
    error?: string;
    options?: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, helperText, error, options, children, disabled, ...props }, ref) => {
        return (
            <div className="field-group">
                {label && (
                    <label className="field-label select-none">
                        {label}
                    </label>
                )}

                <select
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        "select-base",
                        error && "input-error",
                        className
                    )}
                    {...props}
                >
                    {options
                        ? options.map((option) => (
                              <option key={option.value} value={option.value}>
                                  {option.label}
                              </option>
                          ))
                        : children}
                </select>

                {error && (
                    <span className="field-error animate-fadeIn select-none">
                        {error}
                    </span>
                )}
                {!error && helperText && (
                    <span className="field-helper select-none">
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
