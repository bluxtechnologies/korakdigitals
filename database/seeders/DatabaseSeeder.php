<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;
use App\Models\User;
use App\Models\Account;
use App\Models\Supplier;
use App\Models\Service;
use App\Models\SupplierService;
use App\Models\PricingRule;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Currencies
        $usd = Currency::firstOrCreate(
            ['code' => 'USD'],
            [
                'name' => 'US Dollar',
                'symbol' => '$',
                'rate' => 1.00000000,
                'is_default' => true,
                'is_active' => true,
                'decimal_places' => 2,
            ]
        );

        $ngn = Currency::firstOrCreate(
            ['code' => 'NGN'],
            [
                'name' => 'Nigerian Naira',
                'symbol' => '₦',
                'rate' => 1500.00000000, // 1 USD = 1500 NGN
                'is_default' => false,
                'is_active' => true,
                'decimal_places' => 2,
            ]
        );

        // 2. Seed Default Supplier
        $mockSupplier = Supplier::firstOrCreate(
            ['code' => 'mock_provider'],
            [
                'name' => 'Cipher Internal Mock Provider',
                'driver_class' => 'App\\Domain\\Services\\Drivers\\MockSupplierDriver',
                'is_active' => true,
            ]
        );

        // 3. Seed Default Services
        $servicesData = [
            ['category' => 'numbers', 'name' => 'Instagram Verification Number', 'code' => 'num_instagram'],
            ['category' => 'numbers', 'name' => 'WhatsApp Verification Number', 'code' => 'num_whatsapp'],
            ['category' => 'growth', 'name' => 'Instagram Followers (1K)', 'code' => 'growth_ig_followers'],
            ['category' => 'accounts', 'name' => 'Instagram Aged PVA Account (2020)', 'code' => 'acc_ig_aged'],
            ['category' => 'vpn', 'name' => 'US WireGuard VPN Dedicated Key', 'code' => 'vpn_us_wg'],
            ['category' => 'esim', 'name' => 'US 1GB 7-Day eSIM Profile', 'code' => 'esim_us_1gb'],
            ['category' => 'airtime', 'name' => 'MTN 1GB Data Bundle', 'code' => 'airtime_mtn_1gb'],
        ];

        foreach ($servicesData as $s) {
            $service = Service::firstOrCreate(
                ['code' => $s['code']],
                [
                    'category' => $s['category'],
                    'name' => $s['name'],
                    'is_active' => true,
                ]
            );

            SupplierService::firstOrCreate(
                ['supplier_id' => $mockSupplier->id, 'service_id' => $service->id],
                [
                    'supplier_sku' => 'SKU_' . strtoupper($service->code),
                    'supplier_cost' => 2.00, // $2.00 base cost
                    'cost_currency_code' => 'USD',
                    'is_available' => true,
                ]
            );
        }

        // 4. Default Pricing Rule (20% Markup)
        PricingRule::firstOrCreate(
            ['name' => 'Default 20% Markup'],
            [
                'markup_percentage' => 20.00,
                'fixed_markup' => 0.00,
                'is_active' => true,
            ]
        );

        // 5. Seed Test Demo User & Account Wallet
        $demoUser = User::firstOrCreate(
            ['email' => 'simon@cipher.com'],
            [
                'name' => 'Simon Holm',
                'phone' => '+2348012345678',
                'user_currency_id' => $ngn->id,
                'password' => Hash::make('password123'),
                'status' => 'active',
            ]
        );

        Account::firstOrCreate(
            ['user_id' => $demoUser->id],
            [
                'public_reference' => 'ACC-' . strtoupper(Str::random(8)),
                'available_balance' => 50000.00, // ₦50,000 balance
                'ledger_balance' => 50000.00,
                'total_deposit' => 50000.00,
                'status' => 'active',
            ]
        );

        // 6. Seed Default Super Admin
        Admin::firstOrCreate(
            ['email' => 'admin@cipher.com'],
            [
                'name' => 'Cipher Admin',
                'role' => 'super_admin',
                'status' => 'active',
                'password' => Hash::make('admin123'),
            ]
        );

        // 7. Seed Site Settings
        $this->call(SettingSeeder::class);
    }
}
