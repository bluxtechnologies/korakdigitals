import * as React from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 5, value, onChange, error, disabled }) => {
    const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
    const digits = React.useMemo(
        () => Array.from({ length }, (_, i) => value[i] ?? ''),
        [value, length]
    );

    const setDigit = (index: number, char: string) => {
        const next = digits.slice();
        next[index] = char;
        onChange(next.join(''));
    };

    const handleChange = (index: number, raw: string) => {
        const char = raw.replace(/\D/g, '').slice(-1);
        setDigit(index, char);
        if (char && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;
        e.preventDefault();
        onChange(pasted.padEnd(length, '').slice(0, length).trimEnd());
        const lastIndex = Math.min(pasted.length, length - 1);
        inputsRef.current[lastIndex]?.focus();
    };

    return (
        <div className="field-group">
            <div className="otp-group" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputsRef.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={cn(
                            'otp-box',
                            digit && 'otp-box-filled',
                            error && 'otp-box-error'
                        )}
                    />
                ))}
            </div>
            {error && <span className="field-error select-none">{error}</span>}
        </div>
    );
};

export { OtpInput };