import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ThemeProvider, useTheme } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Check, Sun, Moon } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <ThemeProvider>
            <ToastProvider>
                <Head title={`${title} - Korak Digitals`} />
                <div className="min-h-screen w-full grid lg:grid-cols-2 bg-bg-surface dark:bg-bg-base font-sans overflow-x-hidden">
                    {/* ---------------- LEFT: Approved Layout 1 Brand & Visual Panel (Desktop) ---------------- */}
                    <div className="auth-brand-panel relative hidden lg:flex flex-col justify-between overflow-hidden px-10 xl:px-16 py-10 xl:py-12 border-r border-border-subtle select-none">
                        {/* Perspective / Tech Diagonal Lines Watermark */}
                        <TechDiagonalBackground />

                        {/* Top: Horizontal Desktop Logo */}
                        <div className="relative z-10">
                            <BrandLogo href="/" size="md" showSubtitle subtitleText="Digital Solutions" />
                        </div>

                        {/* Middle Content: Heading, Subtitle & 3 Highlights */}
                        <div className="relative z-10 flex flex-col gap-6 max-w-lg mt-4 xl:mt-6">
                            <div className="flex flex-col gap-3">
                                <h1 className="text-3xl xl:text-4xl 2xl:text-[44px] font-black tracking-tight leading-[1.16] text-text-primary">
                                    Secure, fast and<br />
                                    reliable digital<br />
                                    services for <span className="text-brand font-black">everyone.</span>
                                </h1>
                                <p className="text-sm xl:text-base leading-relaxed text-text-secondary max-w-md">
                                    Top up airtime, buy data, grow your social media, get virtual numbers and more — all in one place.
                                </p>
                            </div>

                            {/* 3 Highlight Checkmarks */}
                            <ul className="flex flex-col gap-2.5">
                                <li className="flex items-center gap-3 text-sm font-medium text-text-primary">
                                    <span className="flex items-center justify-center size-5 rounded-full bg-brand text-white shrink-0 shadow-xs">
                                        <Check className="size-3 stroke-[3]" />
                                    </span>
                                    <span>Fast & secure transactions</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-text-primary">
                                    <span className="flex items-center justify-center size-5 rounded-full bg-brand text-white shrink-0 shadow-xs">
                                        <Check className="size-3 stroke-[3]" />
                                    </span>
                                    <span>Multiple services</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-text-primary">
                                    <span className="flex items-center justify-center size-5 rounded-full bg-brand text-white shrink-0 shadow-xs">
                                        <Check className="size-3 stroke-[3]" />
                                    </span>
                                    <span>24/7 support</span>
                                </li>
                            </ul>

                            {/* Real Product Perspective Desk Mockup (Laptop, Plant, Mobile, Notebook) */}
                            <div className="w-full flex items-center justify-center pt-2">
                                <div className="relative w-full max-w-[420px] xl:max-w-[460px] rounded-2xl overflow-hidden transition-all duration-300 dark:bg-gradient-to-b dark:from-[#2A1521]/60 dark:to-[#170B12]/90 dark:p-3 dark:border dark:border-brand/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                                    <img
                                        src="/images/auth-desk-visual.png"
                                        alt="Korak Digitals platform preview"
                                        className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none rounded-xl transition-transform duration-500 hover:scale-[1.01]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Copyright */}
                        <p className="relative z-10 text-xs text-text-muted">
                            © 2026 Korak Digitals. All rights reserved.
                        </p>
                    </div>

                    {/* ---------------- RIGHT: Approved Layout 1 Form (Desktop) & Layout 2 (Mobile) ---------------- */}
                    <div className="relative flex flex-col justify-between min-h-screen bg-bg-surface dark:bg-bg-base overflow-y-auto">
                        {/* Mobile Watermark Contour Lines */}
                        <div className="lg:hidden">
                            <MobileWatermarkWave />
                        </div>

                        {/* Top Header Row: Mobile Logo (left) + Theme Switcher (right) */}
                        <header className="w-full flex items-center justify-between lg:justify-end px-5 sm:px-8 xl:px-12 py-5 sm:py-6 z-20">
                            {/* Mobile Logo: visible only on small screens */}
                            <BrandLogo href="/" size="sm" />

                            {/* Theme Toggle Button */}
                            <ThemeToggleButton />
                        </header>

                        {/* Form Center Wrapper */}
                        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 xl:px-12 py-4 sm:py-8">
                            <div className="w-full max-w-[390px] sm:max-w-[420px] flex flex-col gap-6">
                                {children}
                            </div>
                        </main>

                        {/* Subtle bottom spacing to ensure balance */}
                        <footer className="w-full py-4 px-6 text-center text-xs text-text-muted opacity-0 pointer-events-none select-none">
                            Korak Digitals
                        </footer>
                    </div>
                </div>
            </ToastProvider>
        </ThemeProvider>
    );
}

function ThemeToggleButton() {
    const { isDark, setAppearance } = useTheme();
    return (
        <button
            type="button"
            onClick={() => setAppearance(isDark ? 'light' : 'dark')}
            className="flex items-center justify-center size-9 rounded-full border border-border-subtle bg-bg-surface/90 hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="size-4 text-amber-400" />
            ) : (
                <Moon className="size-4 text-text-secondary" />
            )}
        </button>
    );
}

/**
 * Subtle perspective diagonal lines behind the brand panel on desktop.
 */
function TechDiagonalBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-15">
            <svg
                viewBox="0 0 800 800"
                preserveAspectRatio="none"
                className="w-full h-full text-brand"
                fill="none"
            >
                <line x1="800" y1="0" x2="0" y2="520" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.22" />
                <line x1="800" y1="130" x2="0" y2="650" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.18" />
                <line x1="800" y1="260" x2="0" y2="780" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.12" />
                <line x1="800" y1="390" x2="0" y2="900" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.08" />
                <line x1="650" y1="0" x2="0" y2="420" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
            </svg>
        </div>
    );
}

/**
 * Approved Mobile Watermark Contour Lines at the bottom-right corner.
 */
function MobileWatermarkWave() {
    return (
        <div className="absolute bottom-0 right-0 z-0 pointer-events-none overflow-hidden w-64 h-48 opacity-35 dark:opacity-15">
            <svg viewBox="0 0 300 200" fill="none" className="w-full h-full text-brand">
                <path d="M40 200 C 110 160, 190 130, 300 85" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
                <path d="M70 200 C 140 170, 210 140, 300 105" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
                <path d="M100 200 C 170 180, 230 150, 300 125" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
                <path d="M130 200 C 190 185, 250 160, 300 145" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
            </svg>
        </div>
    );
}