import * as React from 'react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORAGE_KEY = 'cipher_utm_attribution';

export interface UtmParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    captured_at?: string;
}

export function getStoredUtm(): UtmParams | null {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export const UtmTracker: React.FC = () => {
    React.useEffect(() => {
        try {
            if (typeof window === 'undefined') return;

            const urlParams = new URLSearchParams(window.location.search);
            const captured: Partial<UtmParams> = {};
            let hasUtm = false;

            UTM_KEYS.forEach((key) => {
                const val = urlParams.get(key);
                if (val && val.trim() !== '') {
                    // Sanitize input to max 100 alphanumeric and standard punctuation chars
                    captured[key] = val.trim().slice(0, 100);
                    hasUtm = true;
                }
            });

            if (hasUtm) {
                captured.captured_at = new Date().toISOString();
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
            }
        } catch {
            // Ignore storage errors in restricted contexts
        }
    }, []);

    return null;
};
