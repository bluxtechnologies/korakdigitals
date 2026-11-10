import * as React from 'react';
import { Button } from './Button';
import { Link } from '@inertiajs/react';

const COOKIE_CONSENT_KEY = 'cipher_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
    const [visible, setVisible] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);

    React.useEffect(() => {
        try {
            const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (!consent) {
                // Delay displaying slightly to avoid interrupting initial render
                const timer = setTimeout(() => setVisible(true), 800);
                return () => clearTimeout(timer);
            }
        } catch (e) {
            // Ignore localStorage access errors
        }
    }, []);

    const handleAcceptAll = () => {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }));
        } catch (e) {}
        setVisible(false);
    };

    const handleAcceptEssential = () => {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }));
        } catch (e) {}
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="region"
            aria-label="Cookie Preferences"
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slideUp print:hidden"
        >
            <div className="bg-bg-elevated border border-border-strong p-4 sm:p-5 rounded-md shadow-xl backdrop-blur-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        </span>
                        <h4 className="text-xs font-black text-text-primary tracking-tight">
                            Privacy & Cookie Notice
                        </h4>
                    </div>
                    <button
                        onClick={handleAcceptEssential}
                        className="text-text-muted hover:text-text-primary text-xs cursor-pointer p-1"
                        aria-label="Close and keep essential only"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                    We use essential cookies to keep your session secure and process transactions. We do not use intrusive third-party ad tracking.
                </p>

                {showDetails && (
                    <div className="p-3 bg-bg-base rounded text-[10px] space-y-1.5 border border-border-subtle animate-fadeIn">
                        <div className="flex justify-between items-center font-bold text-text-primary">
                            <span>Essential Session Cookies</span>
                            <span className="text-success">Required</span>
                        </div>
                        <p className="text-text-muted">
                            Required for authentication, CSRF security, and wallet balance synchronization.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-[10px] text-text-muted hover:text-text-primary underline cursor-pointer"
                    >
                        {showDetails ? 'Hide details' : 'Learn more'}
                    </button>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAcceptEssential}
                            className="text-[11px] font-bold py-1 px-2.5 h-7"
                        >
                            Essential Only
                        </Button>
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={handleAcceptAll}
                            className="text-[11px] font-bold py-1 px-3 h-7 shadow-xs"
                        >
                            Accept All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
