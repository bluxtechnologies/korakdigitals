<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Site Information
            [
                'key' => 'site_name',
                'value' => 'Korak Digitals',
                'group' => 'general',
                'type' => 'string',
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Premium Digital & Telecom Services',
                'group' => 'general',
                'type' => 'string',
            ],
            [
                'key' => 'site_description',
                'value' => 'Your all-in-one platform for verification numbers, social growth, VPNs, eSIM profiles, and telecom utilities.',
                'group' => 'general',
                'type' => 'string',
            ],
            [
                'key' => 'system_version',
                'value' => '1.0.0',
                'group' => 'general',
                'type' => 'string',
            ],

            // Contact & Support
            [
                'key' => 'site_email',
                'value' => 'support@korakdigital.com',
                'group' => 'contact',
                'type' => 'string',
            ],
            [
                'key' => 'site_phone',
                'value' => '+1 (800) 555-KORAK',
                'group' => 'contact',
                'type' => 'string',
            ],
            [
                'key' => 'contact_address',
                'value' => '100 Innovation Way, Suite 400, Tech City',
                'group' => 'contact',
                'type' => 'string',
            ],

            // Preferences & Flags
            [
                'key' => 'default_currency',
                'value' => 'USD',
                'group' => 'system',
                'type' => 'string',
            ],
            [
                'key' => 'maintenance_mode',
                'value' => false,
                'group' => 'system',
                'type' => 'boolean',
            ],
            [
                'key' => 'allow_registration',
                'value' => true,
                'group' => 'system',
                'type' => 'boolean',
            ],
            [
                'key' => 'items_per_page',
                'value' => 20,
                'group' => 'system',
                'type' => 'integer',
            ],

            // Social Media
            [
                'key' => 'social_links',
                'value' => [
                    'twitter' => 'https://twitter.com/korakdigitals',
                    'facebook' => 'https://facebook.com/korakdigitals',
                    'instagram' => 'https://instagram.com/korakdigitals',
                    'github' => 'https://github.com/korakdigitals',
                ],
                'group' => 'social',
                'type' => 'json',
            ],

            // SEO
            [
                'key' => 'meta_keywords',
                'value' => ['digital services', 'virtual numbers', 'esim', 'vpn', 'telecom', 'korak', 'korak digital solutions'],
                'group' => 'seo',
                'type' => 'json',
            ],
        ];

        foreach ($settings as $item) {
            Setting::set(
                key: $item['key'],
                value: $item['value'],
                group: $item['group'],
                type: $item['type']
            );
        }
    }
}
