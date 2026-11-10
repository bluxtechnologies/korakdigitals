<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Currency;
use App\Models\Account;
use App\Services\EmailVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected EmailVerificationService $emailVerification,
        protected \App\Services\AuditLogService $auditLogService,
        protected \App\Services\FinityPayService $finityPayService,
    )
    {
    }

    public function showLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = trim($request->input('email'));
        $user = null;

        if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $loginInput)->first();
        } else {
            // Clean phone number (strip spaces, hyphens, parentheses)
            $cleaned = preg_replace('/[^0-9+]/', '', $loginInput);
            $user = User::where('phone', $loginInput)
                ->orWhere('phone', $cleaned)
                ->first();

            // Check standard Nigerian local format vs +234
            if (!$user && str_starts_with($cleaned, '0')) {
                $intFormat = '+234' . substr($cleaned, 1);
                $user = User::where('phone', $intFormat)->first();
            } elseif (!$user && str_starts_with($cleaned, '+234')) {
                $localFormat = '0' . substr($cleaned, 4);
                $user = User::where('phone', $localFormat)->first();
            }
        }

        if ($user && Hash::check($request->password, $user->password)) {
            Auth::guard('web')->login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            $this->auditLogService->logUser('login', null, null, null, 'Logged in');
            return redirect()->intended('/user/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function showRegister(): Response
    {
        $currencies = Currency::where('is_active', true)->get(['id', 'code', 'name', 'symbol']);
        return Inertia::render('auth/register', [
            'currencies' => $currencies
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:30', 'unique:users'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $currency = isset($validated['currency_id'])
            ? Currency::find($validated['currency_id'])
            : Currency::where('code', 'NGN')->first();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'user_currency_id' => $currency ? $currency->id : null,
            'password' => Hash::make($validated['password']),
            'status' => 'active',
        ]);

        // Create Wallet Account
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-' . strtoupper(Str::random(8)),
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        // Provision FinityPay customer & dedicated virtual account immediately
        try {
            $this->finityPayService->generateVirtualAccount($user);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('FinityPay provisioning deferred during registration: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        $this->emailVerification->sendVerificationLink($user);

        return redirect('/verify-email');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    // ─────────────────────────────────────────────────────
    // Forgot / Reset Password
    // ─────────────────────────────────────────────────────

    public function showForgotPassword(): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    public function forgotPassword(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }

        return back()->with('success', __($status));
    }

    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('auth/reset-password', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }

        return redirect('/login')->with('success', __($status));
    }

    // ─────────────────────────────────────────────────────
    // Email Verification (OTP)
    // ─────────────────────────────────────────────────────

    public function showVerifyEmail(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return redirect('/user/dashboard');
        }

        return Inertia::render('auth/verify-email', [
            'maskedEmail' => $this->maskEmail($user->email),
            'resendAvailableInSeconds' => $this->emailVerification->secondsUntilResendAllowed($user),
        ]);
    }

    public function verifyEmailLink(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = $request->user();

        if ((string) $user->id !== $id) {
            return redirect('/user/dashboard')->withErrors([
                'email' => 'Invalid verification request for the authenticated user.',
            ]);
        }

        if (! $this->emailVerification->verifyLink($user, $hash)) {
            return redirect('/user/dashboard')->withErrors([
                'email' => 'This verification link is invalid or has expired.',
            ]);
        }

        return redirect('/user/dashboard')->with('success', 'Email verified successfully! Welcome to Korak Digitals.');
    }

    public function resendVerificationLink(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect('/user/dashboard');
        }

        $wait = $this->emailVerification->secondsUntilResendAllowed($user);

        if ($wait > 0) {
            throw ValidationException::withMessages([
                'link' => "Please wait {$wait}s before requesting another verification link.",
            ]);
        }

        $this->emailVerification->sendVerificationLink($user);

        return back()->with('success', 'A fresh verification link has been sent to your email.');
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email);
        $visible = mb_substr($local, 0, min(3, mb_strlen($local)));

        return $visible . str_repeat('*', max(mb_strlen($local) - mb_strlen($visible), 3)) . '@' . $domain;
    }
}