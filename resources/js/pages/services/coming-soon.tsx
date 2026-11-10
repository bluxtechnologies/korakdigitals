import * as React from 'react';
import { Head } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { COMING_SOON_SERVICES, ComingSoonService } from '@/mock/data';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useMockStore } from '@/mock/store';

export default function ComingSoon({ serviceId }: { serviceId: string }) {
    const { user } = useMockStore();
    const toast = useToast();
    const [service, setService] = React.useState<ComingSoonService | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [email, setEmail] = React.useState(user.email);
    const [joined, setJoined] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        // Simulate minor route loading delay for skeleton illustration
        const timer = setTimeout(() => {
            const found = COMING_SOON_SERVICES.find(s => s.id === serviceId);
            setService(found || null);
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [serviceId]);

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setJoined(true);
            toast.success(`You have successfully joined the waitlist for ${service?.title}!`, "Subscribed");
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 select-none">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-bold text-text-primary">Service Not Found</h3>
                <p className="text-xs text-text-secondary mt-1">The requested ecosystem service is not available.</p>
            </div>
        );
    }

    return (
        <>
            <Head title={`${service.title} - Coming Soon`} />
            <div className="max-w-3xl mx-auto py-8 px-4 md:py-16">
                <div className="text-center flex flex-col items-center gap-4">
                    {/* Visual Badge Indicator */}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand bg-brand-subtle px-3 py-1.5 border border-brand/20 rounded-full animate-pulse select-none">
                        {service.badgeText}
                    </span>

                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mt-2">
                        {service.title}
                    </h1>
                    
                    <p className="text-sm md:text-base text-text-secondary max-w-xl leading-relaxed mt-2">
                        {service.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 items-start">
                    {/* Key Core Features */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs select-none">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Core Ecosystem Features</h3>
                        <ul className="space-y-3.5">
                            {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs text-text-secondary">
                                    <span className="w-5 h-5 rounded-full bg-brand-subtle flex items-center justify-center text-brand shrink-0 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </span>
                                    <span className="leading-normal">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Waitlist Subscription Call */}
                    <div className="bg-bg-surface border border-border-subtle p-6 rounded-md shadow-xs flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Stay Informed</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Sign up below to receive exclusive beta updates, launch promotions, and early-access developer accounts.
                        </p>

                        {joined ? (
                            <div className="p-4 bg-success-bg border border-success-border rounded-sm text-center">
                                <span className="text-xs font-bold text-success flex items-center justify-center gap-1.5 mb-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Successfully Registered
                                </span>
                                <span className="text-[11px] text-text-secondary">We'll alert you at {email} when {service.title} goes live.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleJoinWaitlist} className="flex flex-col gap-3">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={submitting}
                                />
                                <Button type="submit" className="w-full" isLoading={submitting}>
                                    Notify Me on Launch
                                </Button>
                            </form>
                        )}
                        <span className="text-[10px] text-text-muted text-center select-none">No credit card or payments required for beta access.</span>
                    </div>
                </div>
            </div>
        </>
    );
}

ComingSoon.layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
