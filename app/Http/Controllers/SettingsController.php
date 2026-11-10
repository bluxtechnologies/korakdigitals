<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use App\Services\AuditLogService;
use App\Services\WalletService;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected WalletService $walletService
    ) {
    }

    // ─────────────────────────────────────────────────────
    // Hub / Landing
    // ─────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        return Inertia::render('settings/index', [
            'user' => $request->user()->load('currency'),
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────

    public function profile(Request $request): Response
    {
        $user = $request->user()->load('currency');

        return Inertia::render('settings/profile', [
            'user' => $user,
            'currencies' => Currency::where('is_active', true)->get(['id', 'code', 'name', 'symbol']),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone,' . $user->id],
            'user_currency_id' => ['nullable', 'exists:currencies,id'],
        ]);

        $currencyChanged = false;
        $oldCurrencyId = $user->user_currency_id;
        $newCurrencyId = $validated['user_currency_id'] ?? null;

        if ($newCurrencyId && (int) $newCurrencyId !== (int) $oldCurrencyId) {
            $currencyChanged = true;
            $oldCurrency = $user->currency ?: Currency::where('code', 'NGN')->first();
            $newCurrency = Currency::find($newCurrencyId);

            if ($oldCurrency && $newCurrency && $user->account) {
                $this->walletService->convertWalletCurrency($user->account, $oldCurrency, $newCurrency);
            }
        }

        $user->update($validated);

        $this->auditLogService->logUser(
            'profile_updated',
            null,
            null,
            null,
            $currencyChanged ? 'Updated profile details and converted wallet currency' : 'Updated profile details',
            $validated
        );

        $msg = $currencyChanged
            ? 'Profile updated and wallet balance converted to new currency.'
            : 'Profile updated successfully.';

        return back()->with('success', $msg);
    }

    // ─────────────────────────────────────────────────────
    // Security
    // ─────────────────────────────────────────────────────

    public function security(Request $request): Response
    {
        return Inertia::render('settings/security', [
            'user' => $request->user(),
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        $this->auditLogService->logUser('password_changed', null, null, null, 'Password changed by user');

        return back()->with('success', 'Password updated successfully.');
    }

    // ─────────────────────────────────────────────────────
    // Activity
    // ─────────────────────────────────────────────────────

    public function activity(Request $request): Response
    {
        $activities = AuditLog::where('actor_type', 'user')
            ->where('actor_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('settings/activity', [
            'activities' => $activities,
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Appearance
    // ─────────────────────────────────────────────────────

    public function appearance(): Response
    {
        return Inertia::render('settings/appearance');
    }
}