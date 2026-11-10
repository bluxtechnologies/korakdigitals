import * as React from 'react';
import { Phone, X, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { NetworkItem } from './types';
import { cn } from '@/lib/utils';

interface PhoneNumberInputProps {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
    detectedNetwork: NetworkItem | null;
    selectedNetwork: NetworkItem;
    isValid: boolean;
    networks?: NetworkItem[];
    onSelectNetwork?: (id: string) => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    value,
    onChange,
    onClear,
    detectedNetwork,
    selectedNetwork,
    isValid,
    networks,
    onSelectNetwork,
}) => {
    const rawDigits = value.replace(/[^0-9]/g, '');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-1.5">
            <div className="relative flex rounded-xl border border-border-subtle bg-bg-surface shadow-2xs focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-colors">
                {/* Network Select Group / Trigger */}
                {networks && onSelectNetwork && (
                    <div ref={dropdownRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="h-full px-3 py-2.5 flex items-center gap-2 border-r border-border-subtle bg-bg-base hover:bg-bg-surface-hover rounded-l-xl transition-colors cursor-pointer select-none"
                            title="Select Network"
                        >
                            <div className="w-6 h-6 rounded-md bg-bg-surface border border-border-subtle p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {selectedNetwork.logo ? (
                                    <img
                                        src={selectedNetwork.logo}
                                        alt={selectedNetwork.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: selectedNetwork.color }}
                                    />
                                )}
                            </div>
                            <span className="text-xs font-bold text-text-primary hidden sm:inline">
                                {selectedNetwork.short || selectedNetwork.name}
                            </span>
                            <ChevronDown size={14} className={cn("text-text-muted transition-transform", isDropdownOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-border-subtle bg-bg-surface shadow-lg z-30 py-1.5 animate-in fade-in-50 zoom-in-95">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                    Select Carrier
                                </div>
                                {networks.map(net => {
                                    const isSelected = selectedNetwork.id === net.id;
                                    return (
                                        <button
                                            key={net.id}
                                            type="button"
                                            onClick={() => {
                                                onSelectNetwork(net.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={cn(
                                                "w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer",
                                                isSelected
                                                    ? "bg-brand/10 text-brand font-bold"
                                                    : "hover:bg-bg-surface-hover text-text-primary"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-6 h-6 rounded-md bg-bg-surface border border-border-subtle p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                                                    {net.logo ? (
                                                        <img src={net.logo} alt={net.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: net.color }} />
                                                    )}
                                                </div>
                                                <span className="truncate">{net.name}</span>
                                            </div>
                                            {isSelected && <Check size={14} className="text-brand shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Phone Input with Icon */}
                <div className="relative flex-1 flex items-center">
                    {(!networks || !onSelectNetwork) && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                            <Phone size={18} />
                        </div>
                    )}
                    <input
                        type="tel"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder="08012345678"
                        maxLength={14}
                        aria-label="Recipient Phone Number"
                        className={cn(
                            "w-full pr-10 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent",
                            (!networks || !onSelectNetwork) ? "pl-10 rounded-xl" : "pl-3.5 rounded-r-xl"
                        )}
                    />
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label="Clear phone number"
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Validation / Carrier detection status */}
            {isValid ? (
                <div className="flex items-center gap-1.5 text-xs text-brand font-medium pt-0.5 animate-in fade-in-50">
                    <CheckCircle2 size={14} className="shrink-0 text-brand" />
                    <span>
                        Valid 11-digit mobile number. Network: {detectedNetwork?.name || selectedNetwork.name}.
                    </span>
                </div>
            ) : rawDigits.length >= 4 && detectedNetwork ? (
                <div className="flex items-center gap-1.5 text-xs text-text-muted pt-0.5">
                    <span>
                        Network detected: {detectedNetwork.name} ({rawDigits.length}/11 digits)
                    </span>
                </div>
            ) : null}
        </div>
    );
};
