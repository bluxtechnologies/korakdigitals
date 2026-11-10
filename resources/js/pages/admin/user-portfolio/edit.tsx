import * as React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { UserPortfolioHeader } from '@/components/admin/UserPortfolioHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export default function UserPortfolioEdit() {
    const { props } = usePage<any>();
    const user = props.userPortfolio;
    const toast = useToast();

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                toast.success(`User profile for ${data.name} updated successfully!`);
            },
            onError: () => {
                toast.error('Failed to update user profile. Check errors.');
            }
        });
    };

    return (
        <>
            <Head title={`Edit User Profile: ${user.name}`} />
            <div className="space-y-6 animate-fadeIn select-none">
                
                <UserPortfolioHeader user={user} />

                <div className="max-w-2xl bg-bg-surface border border-border-subtle rounded-md p-6 shadow-xs space-y-6">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-text-primary">Edit Customer Profile & Account Status</h3>
                        <p className="text-xs font-semibold text-text-secondary">Update contact information or freeze/suspend account access.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+2348012345678"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                        />

                        <Select
                            label="Account Status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            options={[
                                { value: 'active', label: 'Active — Full Platform Access' },
                                { value: 'suspended', label: 'Suspended — Frozen Wallet & Service Holds' },
                                { value: 'banned', label: 'Banned — Terminated Account' },
                            ]}
                        />

                        <div className="pt-2">
                            <Button type="submit" className="px-6 py-3 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-xs rounded-md shadow-sm" isLoading={processing}>
                                Save Customer Profile Changes &rarr;
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </>
    );
}

UserPortfolioEdit.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;
