import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "animate-pulse rounded-sm bg-bg-surface-active",
                className
            )}
            {...props}
        />
    );
};

export { Skeleton };
