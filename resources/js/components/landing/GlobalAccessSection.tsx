import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/Button';
import { Globe, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface GlobalAccessSectionProps {
    authUser?: any;
    brandName?: string;
}

export const GlobalAccessSection: React.FC<GlobalAccessSectionProps> = ({
    authUser,
    brandName = 'Korak Digitals',
}) => {
    return (
        <section
            id="global-access"
            className="py-16 sm:py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full select-none"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* ───────────────────────────────────────────────────────────
                    LEFT COLUMN: Editorial Real Photograph (~52% width)
                ─────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-7 relative">
                    <ScrollReveal distance={24} duration={700}>
                        <div className="relative">
                            
                            {/* Subtle Faint SVG Geo-Contour Arc (Depth Backdrop) */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-10 -right-8 sm:-top-14 sm:-right-12 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-40 dark:opacity-20 z-0"
                            >
                                <svg
                                    viewBox="0 0 320 320"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-full h-full text-brand"
                                >
                                    <circle
                                        cx="160"
                                        cy="160"
                                        r="150"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        strokeDasharray="4 6"
                                    />
                                    <circle
                                        cx="160"
                                        cy="160"
                                        r="110"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="2 4"
                                    />
                                    <ellipse
                                        cx="160"
                                        cy="160"
                                        rx="150"
                                        ry="65"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="3 5"
                                        transform="rotate(-25 160 160)"
                                    />
                                    <ellipse
                                        cx="160"
                                        cy="160"
                                        rx="150"
                                        ry="65"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="3 5"
                                        transform="rotate(25 160 160)"
                                    />
                                </svg>
                            </div>

                            {/* Photograph Frame */}
                            <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-border-subtle bg-bg-surface overflow-hidden shadow-[0_20px_50px_rgba(64,0,16,0.08),0_4px_16px_rgba(128,0,32,0.05)] group">
                                <img
                                    src="/images/global-access-traveler.jpg"
                                    alt="Global digital professional operating mobile services worldwide with Korak Digitals"
                                    loading="lazy"
                                    className="w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px] object-cover object-[center_25%] hover:scale-[1.015] transition-transform duration-700 ease-out"
                                />

                                {/* Single Understated Informational Overlay Pill (Bottom-Left) */}
                                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 bg-white/92 dark:bg-bg-surface/92 backdrop-blur-md border border-border-subtle rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2 shadow-md">
                                    <div className="w-5 h-5 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                                        <Globe size={13} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-xs font-semibold text-text-primary tracking-tight">
                                        Digital access · wherever you work
                                    </span>
                                </div>
                            </div>

                        </div>
                    </ScrollReveal>
                </div>

                {/* ───────────────────────────────────────────────────────────
                    RIGHT COLUMN: Editorial Content (~40% width)
                ─────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-5 space-y-6 lg:pl-2">
                    <ScrollReveal delay={100} distance={20} duration={650}>
                        <div className="space-y-6">
                            
                            {/* Eyebrow */}
                            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand-subtle px-3 py-1 rounded-full border border-brand/10 inline-block">
                                GLOBAL ACCESS
                            </span>

                            {/* Headline */}
                            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-text-primary leading-[1.18]">
                                Stay connected, <br className="hidden sm:inline" />
                                no matter{' '}
                                <span className="relative whitespace-nowrap inline-block text-brand dark:text-brand">
                                    where you are.
                                    {/* Hand-drawn editorial underline accent */}
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 210 14"
                                        className="absolute -bottom-1.5 left-0 w-full text-brand/85 dark:text-brand/85 overflow-visible pointer-events-none"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 10C55 3 145 2 207 7C148 9 82 10 24 11"
                                            stroke="currentColor"
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </h2>

                            {/* Supporting Paragraph */}
                            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                                Access the digital services you need from anywhere in the world. {brandName} makes it easy to stay connected, transact, and manage your digital life — no location limits.
                            </p>

                            {/* Informational Index Detail (Editorial Inline Strip) */}
                            <div className="pt-2 pb-1 border-y border-border-subtle/80 py-4">
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-bold text-brand">01</span>
                                        <span className="font-semibold text-text-primary">Connectivity</span>
                                    </span>
                                    <span className="text-border-strong hidden sm:inline" aria-hidden="true">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-bold text-brand">02</span>
                                        <span className="font-semibold text-text-primary">Verification</span>
                                    </span>
                                    <span className="text-border-strong hidden sm:inline" aria-hidden="true">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-bold text-brand">03</span>
                                        <span className="font-semibold text-text-primary">Social Desk</span>
                                    </span>
                                    <span className="text-border-strong hidden sm:inline" aria-hidden="true">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-bold text-brand">04</span>
                                        <span className="font-semibold text-text-primary">Travel Access</span>
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link href={authUser ? '/user/dashboard' : '/register'}>
                                    <Button
                                        size="lg"
                                        className="font-black text-sm px-7 py-3.5 shadow-sm active:scale-[0.96] transition-transform duration-150 inline-flex items-center gap-2 group"
                                    >
                                        <span>Get Started Free</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="text-xs sm:text-sm font-bold text-text-secondary hover:text-brand transition-colors inline-flex items-center gap-1.5 group py-2"
                                >
                                    <span>See How It Works</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-muted group-hover:text-brand" />
                                </a>
                            </div>

                        </div>
                    </ScrollReveal>
                </div>

            </div>
        </section>
    );
};
