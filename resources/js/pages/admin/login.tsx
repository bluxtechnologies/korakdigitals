import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EyeIcon, EyeOffIcon, ShieldIcon, KeyIcon } from '@/components/ui/Icons';

export default function AdminLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'admin@cipher.com',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login', {
            onFinish: () => reset('password'),
        });
    };

    const handleFillDemo = () => {
        setData({
            email: 'admin@cipher.com',
            password: 'admin123',
            remember: true,
        });
    };

    return (
        <>
            <Head title="Admin Security Login" />
            <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 relative overflow-hidden select-none">
                
                {/* Vibrant Brand Ambient Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-subtle blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-subtle blur-3xl pointer-events-none" />

                {/* Main Card Container */}
                <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-md p-8 space-y-6 shadow-xl relative z-10 animate-scaleIn">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-subtle border border-brand/20 text-brand rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-2xs">
                            <ShieldIcon size={14} className="text-brand" />
                            <span>Security Level 4 • Restricted Access</span>
                        </div>
                        
                        <div className="pt-2 flex justify-center">
                            <div className="w-12 h-12 rounded-md bg-brand flex items-center justify-center text-brand-foreground font-black text-xl shadow-lg glow-brand">
                                K
                            </div>
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-text-primary pt-1">Admin Command Center</h1>
                        <p className="text-xs font-semibold text-text-secondary">Authenticated Korak system personnel only.</p>
                    </div>

                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3.5 bg-error-bg border border-error-border rounded-md text-error text-xs font-bold space-y-1 animate-shake">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                                <span>Authentication Failed</span>
                            </div>
                            <p className="text-[11px] font-normal text-error">
                                {errors.email || errors.password || 'Invalid administrator security credentials.'}
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <Input
                            label="Admin Email"
                            type="email"
                            placeholder="admin@cipher.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        {/* Password with Eye Toggle */}
                        <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold text-text-primary block">Admin Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-1 cursor-pointer"
                                    title={showPassword ? "Hide Password" : "Show Password"}
                                >
                                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Options */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 font-semibold text-text-secondary cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-border-strong text-brand focus:ring-brand-subtle w-4 h-4 cursor-pointer"
                                />
                                <span>Remember Security Session</span>
                            </label>
                            
                            <button
                                type="button"
                                onClick={handleFillDemo}
                                className="text-xs font-bold text-brand hover:text-brand-hover hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <KeyIcon size={13} />
                                <span>Fill Demo Credentials</span>
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full py-3 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-xs shadow-md glow-brand rounded-md transition-all hover:scale-[1.01]"
                            isLoading={processing}
                        >
                            Authenticate Admin Session &rarr;
                        </Button>
                    </form>

                    {/* Footer Security Notice */}
                    <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono text-text-muted">
                        <span>Node IP: 127.0.0.1</span>
                        <span>TLS 1.3 Encrypted</span>
                    </div>

                </div>
            </div>
        </>
    );
}
