export interface NetworkItem {
    id: string;
    name: string;
    short?: string;
    data_service: string;
    airtime_service: string;
    color: string;
    logo?: string;
    prefix: string[];
}

export interface RawDataBundle {
    code?: string;
    package_code?: string;
    name: string;
    price?: number | string;
    amount?: number | string;
    validity?: string;
    category?: string;
    allowance?: string;
}

export interface ParsedDataBundle {
    id: string;
    package_code: string;
    raw_name: string;
    display_name: string;
    data_allowance: string;
    bonus_allowance?: string;
    total_allowance: string;
    validity: string;
    category: 'daily' | 'weekly' | 'monthly' | 'all';
    price_ngn: number;
    discount_ngn: number;
    is_available: boolean;
}

export type BundleFilterCategory = 'all' | 'daily' | 'weekly' | 'monthly';

export interface MobileDataPageProps {
    networks?: NetworkItem[];
    initialBundles?: RawDataBundle[];
    recentOrders?: any[];
}
