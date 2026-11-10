import * as React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleIcon, GitHubIcon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
    return (
        <AuthLayout title="Create Account">
            <RegisterForm />
        </AuthLayout>
    );
}

function RegisterForm() {
    const toast = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.terms) {
            toast.error('Please agree to the Terms of Service and Privacy Policy to continue.');
            return;
        }
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleSocialAuth = (provider: string) => {
        toast.info(
            `${provider} sign up will be enabled soon. Please register with your email and phone number.`,
            'Registration Notice'
        );
    };

    return (
        <>
            {/* Header: Create Account */}
            <div className="flex flex-col gap-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Create an account
                </h1>
                <p className="text-sm text-text-secondary">
                    Sign up to get started with Korak Digitals.
                </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-4.5" noValidate>
                {/* Field 1: Full name */}
                <Input
                    label="Full name"
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. John Doe"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    icon={<User className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                {/* Field 2: Email address */}
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

                {/* Field 3: Phone number */}
                <Input
                    label="Phone number"
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+234 812 345 6789"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    error={errors.phone}
                    icon={<Phone className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                {/* Password Fields Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                        label="Password"
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Create password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        icon={<Lock className="w-4 h-4 text-text-muted" />}
                        disabled={processing}
                        required
                    />
                    <Input
                        label="Confirm password"
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        icon={<Lock className="w-4 h-4 text-text-muted" />}
                        disabled={processing}
                        required
                    />
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex flex-col gap-1 pt-0.5">
                    <label className="checkbox-row hover:text-text-primary transition-colors items-start">
                        <input
                            type="checkbox"
                            name="terms"
                            id="terms"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            className="checkbox-base mt-0.5"
                            required
                        />
                        <span className="text-xs sm:text-sm text-text-secondary leading-snug">
                            I agree to the{' '}
                            <Link href="/terms" className="font-semibold text-brand hover:underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="font-semibold text-brand hover:underline">
                                Privacy Policy
                            </Link>
                        </span>
                    </label>
                    {errors.terms && <span className="text-xs text-error font-medium">{errors.terms}</span>}
                </div>

                {/* Primary CTA: Create Account -> */}
                <Button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors duration-150 mt-1 active:scale-[0.96]"
                    isLoading={processing}
                    disabled={processing}
                >
                    <span>Create Account</span>
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

            {/* Bottom: Already have an account? Sign in */}
            <p className="text-sm text-text-secondary text-center pt-1">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-brand hover:text-brand-hover hover:underline transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </>
    );
}