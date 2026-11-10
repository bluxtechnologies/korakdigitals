import * as React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [submitted, setSubmitted] = React.useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => setSubmitted(true),
        });
    };

    return (
        <AuthLayout title="Forgot Password">
            <div className="flex flex-col gap-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Reset your password
                </h1>
                <p className="text-sm text-text-secondary">
                    Enter your email and we'll send you a link to reset your password.
                </p>
            </div>

            {submitted ? (
                <div className="flex flex-col gap-4">
                    <Alert variant="success" title="Reset link sent!">
                        We have sent password reset instructions to <strong className="font-bold text-text-primary">{data.email}</strong>. Please check your inbox.
                    </Alert>

                    <Link
                        href="/login"
                        className="w-full py-3 text-sm font-semibold rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                        <span>Return to Sign In</span>
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4.5" noValidate>
                    <Input
                        label="Email address"
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        icon={<Mail className="w-4 h-4 text-text-muted" />}
                        disabled={processing}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full py-3 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
                        isLoading={processing}
                        disabled={processing}
                    >
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Button>
                </form>
            )}

            <p className="text-sm text-text-secondary text-center pt-2">
                Remember your password?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-brand hover:text-brand-hover hover:underline transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}