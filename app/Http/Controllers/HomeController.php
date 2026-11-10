<?php

namespace App\Http\Controllers;

use App\Models\AdminNotificationCampaign;
use App\Models\Order;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public homepage for Korak Digitals.
     */
    public function index(Request $request): Response
    {
        // 1. Fetch dynamic platform settings with safe fallbacks
        $settingsRaw = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
            try {
                $settingsRaw = Setting::pluck('value', 'key')->all();
            } catch (\Throwable $e) {
                $settingsRaw = [];
            }
        }

        $settings = [
            'site_name' => $settingsRaw['site_name'] ?? 'Korak Digitals',
            'site_tagline' => $settingsRaw['site_tagline'] ?? 'Global Digital Services Platform',
            'site_description' => $settingsRaw['site_description'] ?? 'Airtime, data, social media, verification numbers, eSIMs, and more — all in one secure and easy-to-use platform.',
            'site_email' => $settingsRaw['site_email'] ?? 'support@korakdigital.com',
            'site_phone' => $settingsRaw['site_phone'] ?? '+1 (800) 555-KORAK',
            'social_links' => !empty($settingsRaw['social_links']) && is_string($settingsRaw['social_links'])
                ? json_decode($settingsRaw['social_links'], true)
                : ($settingsRaw['social_links'] ?? [
                    'twitter' => 'https://twitter.com/korakdigital',
                    'facebook' => 'https://facebook.com/korakdigital',
                    'instagram' => 'https://instagram.com/korakdigital',
                ]),
        ];

        // 2. Fetch service catalogue to dynamically reflect availability and active status
        $services = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('services')) {
            try {
                $services = Service::select(['id', 'name', 'code', 'category', 'description', 'is_active', 'metadata'])
                    ->orderBy('category')
                    ->get();
            } catch (\Throwable $e) {
                $services = collect();
            }
        }

        // 3. Platform metrics
        $userCount = 0;
        $completedOrdersCount = 0;
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('users')) {
                $userCount = User::count();
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('orders')) {
                $completedOrdersCount = Order::where('status', 'completed')->count();
            }
        } catch (\Throwable $e) {
            // fallback
        }

        $metrics = [
            'totalUsers' => max($userCount, 12500),
            'totalOrders' => max($completedOrdersCount, 48200),
            'countriesSupported' => 15,
            'uptimePercent' => '99.98%',
            'avgFulfillmentSeconds' => 15,
        ];

        // 4. Active public broadcast / announcement
        $activeAnnouncement = null;
        if (\Illuminate\Support\Facades\Schema::hasTable('admin_notification_campaigns')) {
            try {
                $activeAnnouncement = AdminNotificationCampaign::where('status', 'active')
                    ->where('target', 'all')
                    ->latest()
                    ->first(['id', 'title', 'body', 'type', 'created_at']);
            } catch (\Throwable $e) {
                $activeAnnouncement = null;
            }
        }

        return Inertia::render('welcome', [
            'services' => $services,
            'settings' => $settings,
            'metrics' => $metrics,
            'announcement' => $activeAnnouncement,
        ]);
    }
}
