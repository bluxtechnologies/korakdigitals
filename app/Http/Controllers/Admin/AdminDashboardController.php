<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Account;
use App\Models\LedgerEntry;
use App\Models\FundingRequest;
use App\Models\AuditLog;
use App\Models\Currency;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class AdminDashboardController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function dashboard(): Response
    {
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', 'completed')->sum('total_amount');
        $pendingFunding = FundingRequest::where('status', 'pending')->count();
        $openTickets = \App\Models\SupportTicket::where('status', 'open')->count();

        $recentOrders = Order::with(['user:id,name,email', 'items'])
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'pendingFunding' => $pendingFunding,
                'openTickets' => $openTickets,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }

    public function users(Request $request): Response
    {
        $users = User::with(['account', 'currency'])
            ->orderBy('id', 'desc')
            ->paginate(30);

        $currencies = Currency::where('is_active', true)->get(['id', 'code', 'name', 'symbol']);

        return Inertia::render('admin/users', [
            'users' => $users,
            'currencies' => $currencies,
        ]);
    }

    public function userDetail(User $user): Response
    {
        $user->load(['account', 'currency', 'orders.items', 'fundingAccounts']);

        $transactions = $user->account
            ? LedgerEntry::where('account_id', $user->account->id)->orderBy('id', 'desc')->take(50)->get()
            : collect();

        return Inertia::render('admin/user-detail', [
            'user' => $user,
            'transactions' => $transactions,
        ]);
    }

    public function adjustWallet(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:credit,debit'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $admin = Auth::guard('admin')->user();
        $account = Account::where('user_id', $user->id)->first();
        if (!$account) {
            $account = Account::create([
                'user_id' => $user->id,
                'public_reference' => 'ACC-' . strtoupper(\Illuminate\Support\Str::random(10)),
                'available_balance' => 0.00,
                'ledger_balance' => 0.00,
                'total_deposit' => 0.00,
                'status' => 'active',
            ]);
        }
        $currencyCode = $user->currency ? $user->currency->code : 'NGN';

        if ($validated['type'] === 'credit') {
            $this->walletService->creditWallet(
                $account,
                $validated['amount'],
                $currencyCode,
                'admin_adjustment',
                "Admin credit: {$validated['reason']}",
                null,
                'admin_adj_cr_' . $user->id . '_' . time(),
                ['admin_id' => $admin->id, 'reason' => $validated['reason']]
            );
        } else {
            $this->walletService->debitWallet(
                $account,
                $validated['amount'],
                $currencyCode,
                'admin_adjustment',
                "Admin debit: {$validated['reason']}",
                null,
                'admin_adj_dr_' . $user->id . '_' . time(),
                ['admin_id' => $admin->id, 'reason' => $validated['reason']]
            );
        }

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'action' => 'wallet_' . $validated['type'],
            'target_type' => User::class,
            'target_id' => $user->id,
            'reference' => $account->public_reference,
            'reason' => $validated['reason'],
            'metadata' => ['amount' => $validated['amount'], 'currency' => $currencyCode],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Wallet {$validated['type']} of {$validated['amount']} {$currencyCode} applied successfully.");
    }

    public function orders(Request $request): Response
    {
        $allowedSorts = ['id', 'public_reference', 'total_amount', 'status', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'id';
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $orders = Order::with(['user:id,name,email', 'items'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('public_reference', 'like', "%{$search}%")
                        ->orWhere('service_category', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('category') && $request->query('category') !== 'all', function ($query) use ($request) {
                $query->where('service_category', $request->query('category'));
            })
            ->orderBy($sort, $direction)
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/orders', [
            'orders' => $orders,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', 'all'),
                'category' => $request->query('category', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function refundOrder(Request $request, Order $order): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        if ($order->status === 'refunded') {
            return back()->withErrors(['message' => 'Order already refunded.']);
        }

        $user = $order->user;
        $account = $order->account;
        $currencyCode = $order->currency_code;

        $this->walletService->creditWallet(
            $account,
            (float) $order->total_amount,
            $currencyCode,
            'order_refund',
            "Refund for order {$order->public_reference}",
            'REFUND-' . $order->public_reference,
            'refund_' . $order->public_reference,
            ['admin_id' => $admin->id, 'order_id' => $order->id]
        );

        $order->update(['status' => 'refunded']);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'action' => 'order_refund',
            'target_type' => Order::class,
            'target_id' => $order->id,
            'reference' => $order->public_reference,
            'reason' => $request->input('reason', 'Admin refund'),
            'metadata' => ['amount' => $order->total_amount, 'currency' => $currencyCode],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Order {$order->public_reference} refunded successfully.");
    }

    public function fundingRequests(Request $request): Response
    {
        $allowedSorts = ['id', 'amount', 'status', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'id';
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $requests = FundingRequest::with(['user:id,name,email'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('public_reference', 'like', "%{$search}%")
                        ->orWhere('provider_reference', 'like', "%{$search}%")
                        ->orWhere('sender_name', 'like', "%{$search}%")
                        ->orWhere('sender_bank_name', 'like', "%{$search}%")
                        ->orWhere('sender_account_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('provider') && $request->query('provider') !== 'all', function ($query) use ($request) {
                $query->where('provider', $request->query('provider'));
            })
            ->orderBy($sort, $direction)
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/funding-requests', [
            'fundingRequests' => $requests,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', 'all'),
                'provider' => $request->query('provider', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function auditLogs(Request $request): Response
    {
        $allowedSorts = ['id', 'action', 'actor_type', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'id';
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $logs = AuditLog::when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                        ->orWhere('reference', 'like', "%{$search}%")
                        ->orWhere('reason', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('actor_type') && $request->query('actor_type') !== 'all', function ($query) use ($request) {
                $query->where('actor_type', $request->query('actor_type'));
            })
            ->orderBy($sort, $direction)
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/audit-logs', [
            'auditLogs' => $logs,
            'filters' => [
                'search' => $request->query('search', ''),
                'actor_type' => $request->query('actor_type', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }
}
