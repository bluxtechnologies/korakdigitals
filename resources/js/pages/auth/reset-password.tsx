import * as React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, ArrowRight } from 'lucide-react';

interface ResetPasswordProps {
    token?: string;
    email?: string;
}

export default function ResetPassword({ token = '', email = '' }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Set New Password">
            <div className="flex flex-col gap-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Set new password
                </h1>
                <p className="text-sm text-text-secondary">
                    Create a strong, secure password for your Korak account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5" noValidate>
                <Input
                    label="Email address"
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    disabled
                    className="opacity-75 cursor-not-allowed bg-bg-base"
                />

                <Input
                    label="New password"
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    icon={<Lock className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                <Input
                    label="Confirm new password"
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    icon={<Lock className="w-4 h-4 text-text-muted" />}
                    disabled={processing}
                    required
                />

                <Button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all mt-1"
                    isLoading={processing}
                    disabled={processing}
                >
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Button>
            </form>

            <p className="text-sm text-text-secondary text-center pt-2">
                Return to{' '}
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
