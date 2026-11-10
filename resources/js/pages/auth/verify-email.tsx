import * as React from 'react';
import { Link, router } from '@inertiajs/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowRight } from 'lucide-react';

interface VerifyEmailProps {
    maskedEmail: string;
    resendAvailableInSeconds: number;
}

export default function VerifyEmail({ maskedEmail, resendAvailableInSeconds }: VerifyEmailProps) {
    const [secondsLeft, setSecondsLeft] = React.useState(resendAvailableInSeconds);
    const [isResending, setIsResending] = React.useState(false);

    React.useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const handleResend = () => {
        if (secondsLeft > 0 || isResending) return;
        setIsResending(true);
        router.post('/verify-email/resend', {}, {
            preserveScroll: true,
            onSuccess: () => setSecondsLeft(60),
            onFinish: () => setIsResending(false),
        });
    };

    return (
        <AuthLayout title="Verify Your Email">
            <div className="flex items-center justify-center size-12 rounded-full bg-brand-subtle text-brand mx-auto">
                <Mail className="size-6 stroke-[2]" />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Check your email
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We've emailed a verification link to <strong className="text-text-primary">{maskedEmail}</strong>. Click the link in the message to activate full account features.
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                {/* Skip to Dashboard (Optional Verification) */}
                <Link href="/user/dashboard" className="w-full">
                    <Button type="button" className="w-full font-bold shadow-xs">
                        Continue to Dashboard &rarr;
                    </Button>
                </Link>

                {/* Resend Verification Link */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full text-xs font-semibold"
                    disabled={secondsLeft > 0 || isResending}
                    isLoading={isResending}
                    onClick={handleResend}
                >
                    {secondsLeft > 0 ? (
                        <>Resend link in {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</>
                    ) : (
                        'Resend Verification Link'
                    )}
                </Button>
            </div>

            <div className="pt-2 text-center text-xs text-text-muted space-y-1">
                <p>Email verification is optional — you can explore your dashboard anytime.</p>
                <p>
                    Wrong email?{' '}
                    <Link href="/login" className="font-semibold text-brand hover:underline">
                        Log into another account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}