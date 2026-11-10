import * as React from 'react';
import { Wifi } from 'lucide-react';

export const MobilePageHeader: React.FC = () => {
    return (
        <div className="block md:hidden">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    <Wifi size={20} className="stroke-[2.2]" />
                </div>
                <div>
                    <h1 className="text-lg font-black text-text-primary tracking-tight">
                        Mobile Data
                    </h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Choose a data bundle for your recipient.
                    </p>
                </div>
            </div>
        </div>
    );
};
