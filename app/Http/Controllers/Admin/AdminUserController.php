<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use App\Models\LedgerEntry;
use App\Models\Order;
use App\Models\FundingAccount;
use App\Models\FundingRequest;
use App\Models\TempEmail;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Currency;
use App\Models\SupportTicket;
use App\Services\AuditLogService;
use App\Services\WalletService;
use App\Services\FinityPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdminUserController extends Controller
{
    protected WalletService $walletService;
    protected AuditLogService $auditLogService;
    protected FinityPayService $finityPayService;

    public function __construct(
        WalletService $walletService,
        AuditLogService $auditLogService,
        FinityPayService $finityPayService
    ) {
        $this->walletService = $walletService;
        $this->auditLogService = $auditLogService;
        $this->finityPayService = $finityPayService;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'initial_balance' => ['nullable', 'numeric', 'min:0'],
            'is_verified' => ['nullable', 'boolean'],
            'auto_provision_finitypay' => ['nullable', 'boolean'],
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
            'email_verified_at' => $request->boolean('is_verified', true) ? now() : null,
        ]);

        // Create Wallet Account
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-' . strtoupper(Str::random(8)),
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        // Optional Initial Wallet Balance Credit
        $initialBalance = (float) ($validated['initial_balance'] ?? 0);
        if ($initialBalance > 0) {
            $admin = Auth::guard('admin')->user();
            $currencyCode = $currency ? $currency->code : 'NGN';
            $this->walletService->creditWallet(
                $account,
                $initialBalance,
                $currencyCode,
                'admin_adjustment',
                'Initial balance upon account creation by Admin',
                null,
                'admin_init_cr_' . $user->id . '_' . time(),
                ['admin_id' => $admin?->id]
            );
        }

        // Auto-provision FinityPay Customer & Dedicated Virtual Bank Account
        $provisioned = false;
        if ($request->boolean('auto_provision_finitypay', true)) {
            try {
                $fundingAccount = $this->finityPayService->generateVirtualAccount($user);
                $provisioned = (bool) $fundingAccount;
            } catch (\Throwable $e) {
                Log::warning("FinityPay provisioning deferred for admin-created user {$user->id}: " . $e->getMessage());
            }
        }

        $admin = Auth::guard('admin')->user();
        $this->auditLogService->logAdmin(
            'user_created_by_admin',
            User::class,
            $user->id,
            $user->email,
            "Admin created user {$user->name} ({$user->email})",
            [
                'user_id' => $user->id,
                'admin_id' => $admin?->id,
                'finitypay_provisioned' => $provisioned,
            ]
        );

        $msg = "User {$user->name} created successfully" . ($provisioned ? ' with FinityPay account provisioned.' : '.');

        return redirect()->route('admin.users.show', $user->id)->with('success', $msg);
    }

    public function show(User $user): Response
    {
        $user->load(['account', 'currency']);

        $stats = [
            'totalOrders' => Order::where('user_id', $user->id)->count(),
            'completedOrders' => Order::where('user_id', $user->id)->where('status', 'completed')->count(),
            'totalSpent' => Order::where('user_id', $user->id)->where('status', 'completed')->sum('total_amount'),
            'totalDeposited' => $user->account ? $user->account->total_deposit : 0,
            'availableBalance' => $user->account ? $user->account->available_balance : 0,
            'apiKeysCount' => ApiKey::where('user_id', $user->id)->count(),
            'tempEmailsCount' => TempEmail::where('user_id', $user->id)->count(),
        ];

        $recentOrders = Order::where('user_id', $user->id)->with('items')->orderBy('id', 'desc')->take(5)->get();
        $recentTransactions = $user->account
            ? LedgerEntry::where('account_id', $user->account->id)->orderBy('id', 'desc')->take(5)->get()
            : collect();

        return Inertia::render('admin/user-portfolio/index', [
            'userPortfolio' => $user,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function wallet(User $user): Response
    {
        $user->load(['account', 'currency']);

        $transactions = $user->account
            ? LedgerEntry::where('account_id', $user->account->id)->orderBy('id', 'desc')->paginate(30)
            : collect();

        return Inertia::render('admin/user-portfolio/wallet', [
            'userPortfolio' => $user,
            'transactions' => $transactions,
        ]);
    }

    public function orders(User $user): Response
    {
        $user->load(['account', 'currency']);

        $orders = Order::where('user_id', $user->id)
            ->with('items')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return Inertia::render('admin/user-portfolio/orders', [
            'userPortfolio' => $user,
            'orders' => $orders,
        ]);
    }

    public function funding(User $user): Response
    {
        $user->load(['account', 'currency', 'fundingAccounts']);

        $fundingRequests = FundingRequest::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate(20);

        return Inertia::render('admin/user-portfolio/funding', [
            'userPortfolio' => $user,
            'fundingAccounts' => $user->fundingAccounts,
            'fundingRequests' => $fundingRequests,
        ]);
    }

    public function tempEmails(User $user): Response
    {
        $user->load(['account', 'currency']);

        $emails = TempEmail::where('user_id', $user->id)
            ->with(['messages' => fn ($q) => $q->orderBy('id', 'desc')])
            ->orderBy('id', 'desc')
            ->paginate(20);

        return Inertia::render('admin/user-portfolio/temp-emails', [
            'userPortfolio' => $user,
            'tempEmails' => $emails,
        ]);
    }

    public function apiKeys(User $user): Response
    {
        $user->load(['account', 'currency']);

        $apiKeys = ApiKey::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('admin/user-portfolio/api-keys', [
            'userPortfolio' => $user,
            'apiKeys' => $apiKeys,
        ]);
    }

    public function revokeApiKey(User $user, ApiKey $apiKey): RedirectResponse
    {
        if ($apiKey->user_id !== $user->id) {
            return back()->withErrors(['message' => 'API Key does not belong to this user.']);
        }

        $apiKey->update(['is_active' => false]);

        $this->auditLogService->logAdmin(
            'api_key_revoked_by_admin',
            ApiKey::class,
            $apiKey->id,
            $apiKey->key_prefix,
            "Admin revoked API key {$apiKey->key_prefix} for user {$user->id}",
            ['user_id' => $user->id]
        );

        return back()->with('success', "API Key {$apiKey->key_prefix} revoked.");
    }

    public function auditLogs(User $user): Response
    {
        $user->load(['account', 'currency']);

        $logs = AuditLog::where(function ($query) use ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('actor_type', 'user')->where('actor_id', $user->id);
            })->orWhere(function ($q) use ($user) {
                $q->where('target_type', User::class)->where('target_id', $user->id);
            });
        })->orderBy('id', 'desc')->paginate(30);

        return Inertia::render('admin/user-portfolio/audit-logs', [
            'userPortfolio' => $user,
            'auditLogs' => $logs,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['account', 'currency']);

        return Inertia::render('admin/user-portfolio/edit', [
            'userPortfolio' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:active,suspended,banned'],
        ]);

        $oldStatus = $user->status;
        $user->update($validated);

        if ($user->account && isset($validated['status'])) {
            $user->account->update([
                'status' => $validated['status'] === 'active' ? 'active' : 'frozen'
            ]);
        }

        $this->auditLogService->logAdmin(
            'user_profile_updated',
            User::class,
            $user->id,
            $user->email,
            "Updated user profile details and status from {$oldStatus} to {$user->status}",
            $validated
        );

        return redirect()->route('admin.users.show', $user->id)
            ->with('success', "User profile for {$user->name} updated successfully.");
    }

    public function support(User $user): Response
    {
        $user->load(['account', 'currency']);

        $tickets = SupportTicket::with(['latestMessage'])
            ->where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/user-portfolio/support', [
            'userPortfolio' => $user,
            'tickets' => $tickets,
        ]);
    }
}
