import { RawDataBundle, ParsedDataBundle, BundleFilterCategory } from './types';

/**
 * Intelligent parser that transforms provider data plan strings (e.g. Oneoff_40MB + 5MB Night_1_Day)
 * into customer-friendly, standardized metadata.
 */
export function parseDataBundle(bundle: RawDataBundle, index = 0): ParsedDataBundle {
    const rawName = bundle.name || 'Data Plan';
    const pkgCode = bundle.package_code || bundle.code || `plan-${index}`;
    const price = Number(bundle.amount || bundle.price || 0);

    // Clean up raw names by replacing underscores and provider prefixes
    let cleanedName = rawName
        .replace(/^Oneoff_/i, '')
        .replace(/^Direct_/i, '')
        .replace(/^SME_/i, '')
        .replace(/^Data_/i, '')
        .replace(/_/g, ' ')
        .trim();

    // Detect validity from string or attribute
    let validity = bundle.validity || '';
    if (!validity) {
        if (/(\d+)\s*days?/i.test(cleanedName)) {
            const match = cleanedName.match(/(\d+)\s*days?/i);
            validity = match ? `${match[1]} ${Number(match[1]) === 1 ? 'day' : 'days'}` : '30 days';
        } else if (/1\s*day|daily|24\s*hrs?/i.test(cleanedName)) {
            validity = '1 day';
        } else if (/2\s*days?/i.test(cleanedName)) {
            validity = '2 days';
        } else if (/7\s*days?|weekly|1\s*week/i.test(cleanedName)) {
            validity = '7 days';
        } else if (/14\s*days?|2\s*weeks?/i.test(cleanedName)) {
            validity = '14 days';
        } else if (/30\s*days?|monthly|1\s*month/i.test(cleanedName)) {
            validity = '30 days';
        } else if (/60\s*days?|2\s*months?/i.test(cleanedName)) {
            validity = '60 days';
        } else {
            validity = '30 days';
        }
    }

    // Determine category
    let category: 'daily' | 'weekly' | 'monthly' = 'monthly';
    const valLower = validity.toLowerCase();
    if (valLower.includes('1 day') || valLower.includes('2 day') || valLower.includes('3 day') || valLower.includes('daily')) {
        category = 'daily';
    } else if (valLower.includes('7 day') || valLower.includes('14 day') || valLower.includes('week')) {
        category = 'weekly';
    } else {
        category = 'monthly';
    }

    // Extract main allowance and bonus allowance
    let dataAllowance = '';
    let bonusAllowance = '';
    let totalAllowance = '';

    // Check for "X + Y Night" pattern
    const bonusMatch = cleanedName.match(/(\d+(?:\.\d+)?\s*(?:MB|GB))\s*\+\s*(\d+(?:\.\d+)?\s*(?:MB|GB))\s*(?:Night|Bonus)?/i);
    if (bonusMatch) {
        dataAllowance = bonusMatch[1].toUpperCase();
        bonusAllowance = bonusMatch[2].toUpperCase();

        // Calculate approximate total
        const parseToMb = (str: string) => {
            const num = parseFloat(str);
            return str.toUpperCase().includes('GB') ? num * 1024 : num;
        };
        const totalMb = parseToMb(dataAllowance) + parseToMb(bonusAllowance);
        if (totalMb >= 1024) {
            const gb = totalMb / 1024;
            totalAllowance = `${Number.isInteger(gb) ? gb : gb.toFixed(2).replace(/\.?0+$/, '')}GB total`;
        } else {
            totalAllowance = `${Math.round(totalMb)}MB total`;
        }

        // Standardize clean display name
        cleanedName = `${dataAllowance} + ${bonusAllowance} Night Bonus`;
    } else {
        const allowanceMatch = cleanedName.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|TB))/i);
        if (allowanceMatch) {
            dataAllowance = allowanceMatch[1].toUpperCase();
            totalAllowance = `${dataAllowance} total`;
        } else {
            dataAllowance = cleanedName;
            totalAllowance = dataAllowance;
        }

        // Strip trailing validity from display title for neat scanning
        cleanedName = cleanedName
            .replace(/\s*-\s*\d+\s*days?/i, '')
            .replace(/\s*\(\d+\s*days?\)/i, '')
            .replace(/\s*1\s*Day$/i, '')
            .replace(/\s*30\s*Days?$/i, '')
            .trim();
    }

    return {
        id: pkgCode,
        package_code: pkgCode,
        raw_name: rawName,
        display_name: cleanedName,
        data_allowance: dataAllowance,
        bonus_allowance: bonusAllowance,
        total_allowance: totalAllowance,
        validity: validity,
        category: category,
        price_ngn: price,
        discount_ngn: 0,
        is_available: true,
    };
}

/**
 * Realistic default bundle catalogs matching the visual reference mockup (media_1788958243943.png).
 * Used when API is offline or returns empty during local development.
 */
export const DEFAULT_BUNDLE_CATALOGS: Record<string, RawDataBundle[]> = {
    mtn: [
        { package_code: 'MTN-50', name: '40MB + 5MB Night Bonus', price: 50, validity: '1 day' },
        { package_code: 'MTN-100', name: '120MB + 10MB Night Bonus', price: 100, validity: '2 days' },
        { package_code: 'MTN-200', name: '300MB + 20MB Night Bonus', price: 200, validity: '7 days' },
        { package_code: 'MTN-500', name: '1.5GB + 100MB Night Bonus', price: 500, validity: '30 days' },
        { package_code: 'MTN-1000', name: '3.5GB + 250MB Night Bonus', price: 1000, validity: '30 days' },
        { package_code: 'MTN-2000', name: '7.5GB + 500MB Night Bonus', price: 2000, validity: '30 days' },
        { package_code: 'MTN-3000', name: '11GB Monthly Bundle', price: 3000, validity: '30 days' },
        { package_code: 'MTN-5000', name: '20GB Monthly Bundle', price: 5000, validity: '30 days' },
    ],
    airtel: [
        { package_code: 'AIR-50', name: '40MB Daily Plan', price: 50, validity: '1 day' },
        { package_code: 'AIR-100', name: '100MB Daily Plan', price: 100, validity: '1 day' },
        { package_code: 'AIR-200', name: '350MB Weekly Bundle', price: 200, validity: '7 days' },
        { package_code: 'AIR-500', name: '1.5GB + 200MB Night Bonus', price: 500, validity: '30 days' },
        { package_code: 'AIR-1000', name: '3.5GB Binge Plan', price: 1000, validity: '30 days' },
        { package_code: 'AIR-2000', name: '7GB Monthly Plan', price: 2000, validity: '30 days' },
        { package_code: 'AIR-3000', name: '12GB Monthly Plan', price: 3000, validity: '30 days' },
        { package_code: 'AIR-5000', name: '25GB Monthly Mega', price: 5000, validity: '30 days' },
    ],
    glo: [
        { package_code: 'GLO-50', name: '50MB + 15MB Night Bonus', price: 50, validity: '1 day' },
        { package_code: 'GLO-100', name: '150MB Mini Plan', price: 100, validity: '1 day' },
        { package_code: 'GLO-200', name: '350MB Special Weekly', price: 200, validity: '7 days' },
        { package_code: 'GLO-500', name: '1.8GB + 200MB Night Bonus', price: 500, validity: '30 days' },
        { package_code: 'GLO-1000', name: '3.9GB Monthly Bundle', price: 1000, validity: '30 days' },
        { package_code: 'GLO-2000', name: '8.5GB Monthly Bundle', price: 2000, validity: '30 days' },
        { package_code: 'GLO-3000', name: '14GB Heavy User', price: 3000, validity: '30 days' },
        { package_code: 'GLO-5000', name: '24GB Ultra Data', price: 5000, validity: '30 days' },
    ],
    '9mobile': [
        { package_code: '9MOB-50', name: '50MB Daily Bundle', price: 50, validity: '1 day' },
        { package_code: '9MOB-100', name: '100MB Daily Plan', price: 100, validity: '1 day' },
        { package_code: '9MOB-200', name: '250MB Weekly Plan', price: 200, validity: '7 days' },
        { package_code: '9MOB-500', name: '1.2GB + 100MB Night Bonus', price: 500, validity: '30 days' },
        { package_code: '9MOB-1000', name: '3GB Monthly Plan', price: 1000, validity: '30 days' },
        { package_code: '9MOB-2000', name: '6.5GB Monthly Plan', price: 2000, validity: '30 days' },
        { package_code: '9MOB-3000', name: '11GB Monthly Plan', price: 3000, validity: '30 days' },
        { package_code: '9MOB-5000', name: '20GB Business Plan', price: 5000, validity: '30 days' },
    ],
};
