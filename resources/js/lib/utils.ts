import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    if (metaTag?.content) {
        return metaTag.content;
    }
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

