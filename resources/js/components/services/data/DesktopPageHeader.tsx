import * as React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Wifi } from 'lucide-react';

export const DesktopPageHeader: React.FC = () => {
    return (
        <div className="hidden md:block space-y-4">
            <Link
                href="/user/services"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
                <ArrowLeft size={14} />
                <span>Back to Services</span>
            </Link>

            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    <Wifi size={24} className="stroke-[2.2]" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                        Mobile Data
                    </h1>
                    <p className="text-xs md:text-sm text-text-secondary mt-0.5">
                        Choose a data bundle for your recipient.
                    </p>
                </div>
            </div>
        </div>
    );
};
