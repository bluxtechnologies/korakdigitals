<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function index(): Response
    {
        $allSettings = Setting::orderBy('group')->orderBy('key')->get();

        $grouped = [
            'general' => Setting::allSettings('general'),
            'financial' => Setting::allSettings('financial'),
            'security' => Setting::allSettings('security'),
            'notifications' => Setting::allSettings('notifications'),
        ];

        // Seed default config keys if empty
        $defaults = [
            'general' => [
                'site_name' => 'Korak Digitals',
                'support_email' => 'support@korakdigital.com',
                'support_phone' => '+234 800 000 0000',
                'maintenance_mode' => false,
            ],
            'financial' => [
                'default_currency' => 'NGN',
                'min_wallet_funding' => 500,
                'max_wallet_funding' => 1000000,
                'manual_funding_instructions' => "Transfer to:\nBank: Wema Bank\nAccount: 0123456789\nAccount Name: KORAK DIGITALS",
            ],
            'security' => [
                'require_email_verification' => true,
                'max_login_attempts' => 5,
                'session_lifetime_minutes' => 120,
            ],
            'notifications' => [
                'admin_notification_email' => 'admin@korakdigital.com',
                'notify_on_new_order' => true,
                'notify_on_funding_request' => true,
            ],
        ];

        foreach ($defaults as $group => $settings) {
            foreach ($settings as $key => $defaultVal) {
                if (! isset($grouped[$group][$key])) {
                    $grouped[$group][$key] = $defaultVal;
                }
            }
        }

        return Inertia::render('admin/settings/general', [
            'settings' => $grouped,
            'rawCount' => $allSettings->count(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'group' => ['required', 'string', 'in:general,financial,security,notifications'],
            'settings' => ['required', 'array'],
        ]);

        $group = $validated['group'];
        $payload = $validated['settings'];

        foreach ($payload as $key => $value) {
            Setting::set($key, $value, $group);
        }

        $this->auditLogService->logAdmin(
            'system_settings_updated',
            Setting::class,
            null,
            $group,
            "Updated system configuration settings in group '{$group}'",
            $payload
        );

        return back()->with('success', "Settings for '" . ucfirst($group) . "' saved successfully.");
    }
}