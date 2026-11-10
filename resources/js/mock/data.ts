export interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

export interface VerificationService {
    id: string;
    name: string;
    category: string;
    priceNgn: number;
    priceUsd: number;
    iconName: string;
}

export const COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' }
];

export const VERIFICATION_SERVICES: VerificationService[] = [
    { id: 'whatsapp', name: 'WhatsApp', category: 'Social', priceNgn: 1500, priceUsd: 1.50, iconName: 'whatsapp' },
    { id: 'telegram', name: 'Telegram', category: 'Social', priceNgn: 2000, priceUsd: 2.00, iconName: 'telegram' },
    { id: 'google', name: 'Google / Gmail', category: 'Utilities', priceNgn: 1200, priceUsd: 1.20, iconName: 'google' },
    { id: 'instagram', name: 'Instagram', category: 'Social', priceNgn: 1000, priceUsd: 1.00, iconName: 'instagram' },
    { id: 'openai', name: 'OpenAI / ChatGPT', category: 'Utilities', priceNgn: 2500, priceUsd: 2.50, iconName: 'openai' },
    { id: 'tiktok', name: 'TikTok', category: 'Social', priceNgn: 1500, priceUsd: 1.50, iconName: 'tiktok' },
    { id: 'facebook', name: 'Facebook', category: 'Social', priceNgn: 1200, priceUsd: 1.20, iconName: 'facebook' },
    { id: 'apple', name: 'Apple ID', category: 'Utilities', priceNgn: 3000, priceUsd: 3.00, iconName: 'apple' },
    { id: 'x', name: 'X / Twitter', category: 'Social', priceNgn: 1800, priceUsd: 1.80, iconName: 'x' },
    { id: 'linkedin', name: 'LinkedIn', category: 'Social', priceNgn: 1500, priceUsd: 1.50, iconName: 'linkedin' },
    { id: 'steam', name: 'Steam', category: 'Gaming', priceNgn: 1200, priceUsd: 1.20, iconName: 'steam' },
    { id: 'amazon', name: 'Amazon', category: 'Shopping', priceNgn: 1000, priceUsd: 1.00, iconName: 'amazon' },
    { id: 'netflix', name: 'Netflix', category: 'Entertainment', priceNgn: 1500, priceUsd: 1.50, iconName: 'netflix' },
    { id: 'microsoft', name: 'Microsoft', category: 'Utilities', priceNgn: 1000, priceUsd: 1.00, iconName: 'microsoft' }
];

export interface ComingSoonService {
    id: string;
    title: string;
    description: string;
    badgeText: string;
    icon: string;
    features: string[];
}

export const COMING_SOON_SERVICES: ComingSoonService[] = [
    {
        id: 'growth',
        title: 'Social Growth Services',
        description: 'Boost your social media presence organically. Target real followers, likes, and engagement metrics for Instagram, TikTok, YouTube, and X.',
        badgeText: 'Coming Q4 2026',
        icon: 'chart-bar',
        features: ['Real-time growth auditing', 'Targeted niche demographics', 'Drip-feed engagement options', 'Dedicated campaign manager']
    },
    {
        id: 'vpn',
        title: 'Cipher Secure VPN',
        description: 'Military-grade encryption with ultra-fast nodes worldwide. Protect your digital footprint and browse unrestricted with single-tap connection.',
        badgeText: 'Beta Coming Soon',
        icon: 'shield-check',
        features: ['Zero-logs policy', 'Over 120 locations', 'Kill-switch integration', 'Up to 5 concurrent devices']
    },
    {
        id: 'esim',
        title: 'Global eSIM Data',
        description: 'Stay connected wherever you travel. Purchase high-speed global data profiles instantly without dealing with physical SIM cards.',
        badgeText: 'Phase 2 Product',
        icon: 'globe-alt',
        features: ['Coverage in 190+ countries', 'No roaming fees', 'Hotspot sharing supported', 'Instant installation QR code']
    },
    {
        id: 'airtime',
        title: 'Airtime & Mobile Data',
        description: 'Top up international mobile lines instantly. Supports over 600 mobile networks globally in local currencies.',
        badgeText: 'Phase 2 Product',
        icon: 'phone',
        features: ['Instant crediting', 'Supports major providers (MTN, Airtel, Vodafone, Orange)', 'Transaction cashback points', 'Recurring auto-topups']
    },
    {
        id: 'finance',
        title: 'Digital Finance & Crypto',
        description: 'Deposit, transfer, and swap local currencies and digital crypto tokens with minimal fees. Integrated debit card options for multi-currency wallets.',
        badgeText: 'Future Ecosystem',
        icon: 'credit-card',
        features: ['Local fiat ramp accounts', 'USDT, BTC, ETH multi-chain swaps', 'Virtual debit cards', 'Instant user-to-user transfers']
    }
];
