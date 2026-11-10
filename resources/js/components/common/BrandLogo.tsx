import * as React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
    href?: string;
    variant?: 'default' | 'admin' | 'mark-only';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showSubtitle?: boolean;
    subtitleText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    href = '/user/dashboard',
    variant = 'default',
    size = 'md',
    className,
    showSubtitle = false,
    subtitleText,
}) => {
    const sizeConfig = {
        sm: {
            box: 'w-7 h-7 text-xs rounded-md',
            title: 'text-sm',
            subtitle: 'text-[9px]',
            gap: 'gap-2',
        },
        md: {
            box: 'w-8 h-8 text-sm rounded-lg',
            title: 'text-[15px]',
            subtitle: 'text-[10px]',
            gap: 'gap-2.5',
        },
        lg: {
            box: 'w-9 h-9 text-base rounded-xl',
            title: 'text-lg',
            subtitle: 'text-xs',
            gap: 'gap-3',
        },
    }[size];

    const logoInner = (
        <div className={cn("inline-flex items-center group select-none", sizeConfig.gap, className)}>
            {/* Monogram emblem */}
            <div
                className={cn(
                    "bg-brand text-brand-foreground flex items-center justify-center font-black shadow-xs shrink-0 transition-transform duration-150 group-hover:scale-105",
                    sizeConfig.box
                )}
            >
                <span className="tracking-tighter leading-none">K</span>
            </div>

            {variant !== 'mark-only' && (
                <div className="flex flex-col leading-none">
                    <span
                        className={cn(
                            "font-black tracking-tight text-text-primary transition-colors group-hover:text-brand",
                            sizeConfig.title
                        )}
                    >
                        {variant === 'admin' ? 'Korak Admin' : 'Korak Digitals'}
                    </span>
                    {(showSubtitle || subtitleText) && (
                        <span className={cn("text-text-muted font-medium mt-0.5", sizeConfig.subtitle)}>
                            {subtitleText || (variant === 'admin' ? 'Control Suite' : 'Digital Solutions')}
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            >
                {logoInner}
            </Link>
        );
    }

    return logoInner;
};

export default BrandLogo;
