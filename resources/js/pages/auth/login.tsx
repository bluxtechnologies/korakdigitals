import * as React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleIcon, GitHubIcon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    return (
        <AuthLayout title="Sign In">
            <LoginForm />
        </AuthLayout>
    );
}

function LoginForm() {
    const toast = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const handleSocialAuth = (provider: string) => {
        toast.info(
            `${provider} authentication will be enabled soon. Please sign in with your email or phone number.`,
            'Sign In Notice'
        );
    };

    return (
        <>
            {/* Header: Welcome back */}
            <div className="flex flex-col gap-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Welcome back
                </h1>
                <p className="text-sm text-text-secondary">
                    Sign in to your Korak account to continue.
                </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5" noValidate>
                {/* Field 1: Email or phone number */}
                <Input
                    label="Email or phone number"
                    type="text"
                    id="email"
                    name="email"
                    autoComplete="username"
                    placeholder="you@example.com or +234 812 345 6789"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    icon={<Mail className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                {/* Field 2: Password with leading Lock icon & eye toggle */}
                <Input
                    label="Password"
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    icon={<Lock className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-sm pt-0.5">
                    <label className="checkbox-row hover:text-text-primary transition-colors">
                        <input
                            type="checkbox"
                            name="remember"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="checkbox-base"
                        />
                        <span className="text-sm font-medium">Remember me</span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-brand hover:text-brand-hover hover:underline transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Primary CTA: Sign In -> */}
                <Button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors duration-150 mt-1 active:scale-[0.96]"
                    isLoading={processing}
                    disabled={processing}
                >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </Button>

                {/* Subtle Divider: "or" */}
                <div className="relative flex items-center justify-center my-0.5 select-none" aria-hidden="true">
                    <div className="border-t border-border-subtle w-full" />
                    <span className="bg-bg-surface dark:bg-bg-base px-3 text-xs text-text-muted font-medium">
                        or
                    </span>
                    <div className="border-t border-border-subtle w-full" />
                </div>

                {/* Social Authentication: Continue with Google & Continue with GitHub */}
                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-semibold rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.96]"
                    >
                        <GoogleIcon size={18} />
                        <span>Continue with Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialAuth('GitHub')}
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-semibold rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-primary transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.96]"
                    >
                        <GitHubIcon size={18} />
                        <span>Continue with GitHub</span>
                    </button>
                </div>
            </form>

            {/* Bottom: Don't have an account? Create one */}
            <p className="text-sm text-text-secondary text-center pt-1">
                Don't have an account?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-brand hover:text-brand-hover hover:underline transition-colors"
                >
                    Create one
                </Link>
            </p>
        </>
    );
}