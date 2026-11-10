<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $account = $user->account;

        // Fetch user active currency using user_currency_id
        $currency = $user->currency ?: \App\Models\Currency::find($user->user_currency_id);
        if (!$currency) {
            $currency = \App\Models\Currency::where('code', 'USD')->first() ?: \App\Models\Currency::first();
        }

        $currencyId = $currency ? $currency->id : (int) $user->user_currency_id;
        $currencySymbol = $currency ? $currency->symbol : '$';
        $currencyCode = $currency ? $currency->code : 'USD';
        $rate = $currency && (float) $currency->rate > 0 ? (float) $currency->rate : 1.0;

        // Fetch all active currencies from database
        $allCurrencies = \App\Models\Currency::where('is_active', true)->get();

        // Calculate secondary equivalent currency
        $secondaryCurrency = $allCurrencies->firstWhere('code', $currencyCode === 'USD' ? 'NGN' : 'USD');
        if (!$secondaryCurrency) {
            $secondaryCurrency = $allCurrencies->firstWhere('code', '!=', $currencyCode) ?: $currency;
        }

        $availBalance = $account ? (float) $account->available_balance : 0.00;
        $secondaryRate = $secondaryCurrency && (float) $secondaryCurrency->rate > 0 ? (float) $secondaryCurrency->rate : 1.0;
        // Base USD = availBalance / userRate; Secondary = (availBalance / userRate) * secondaryRate
        $secondaryEquivalent = round(($availBalance / $rate) * $secondaryRate, 2);

        // Fetch real active & completed orders from database
        $activeOrdersCount = Order::where('user_id', $user->id)
            ->whereIn('status', ['active', 'processing', 'pending'])
            ->count();

        $completedOrdersCount = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $totalOrdersCount = Order::where('user_id', $user->id)->count();

        // Total spent calculation from completed orders
        $totalSpent = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        // Recent 5 transactions from double-entry ledger
        $recentTransactions = $account
            ? LedgerEntry::where('account_id', $account->id)
                ->orderBy('id', 'desc')
                ->take(5)
                ->get()
            : collect();

        // Recent active orders
        $recentOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'auth' => [
                'user' => $user,
                'account' => $account,
                'currency' => $currency,
            ],
            'stats' => [
                'availableBalance' => $availBalance,
                'ledgerBalance' => $account ? (float) $account->ledger_balance : 0.00,
                'totalDeposit' => $account ? (float) $account->total_deposit : 0.00,
                'totalSpent' => (float) $totalSpent,
                'activeOrdersCount' => $activeOrdersCount,
                'completedOrdersCount' => $completedOrdersCount,
                'totalOrdersCount' => $totalOrdersCount,
                'currencyId' => $currencyId,
                'currencySymbol' => $currencySymbol,
                'currencyCode' => $currencyCode,
                'currencyRate' => $rate,
                'secondaryEquivalent' => $secondaryEquivalent,
                'secondaryCurrency' => [
                    'id' => $secondaryCurrency ? $secondaryCurrency->id : null,
                    'code' => $secondaryCurrency ? $secondaryCurrency->code : ($currencyCode === 'USD' ? 'NGN' : 'USD'),
                    'symbol' => $secondaryCurrency ? $secondaryCurrency->symbol : ($currencyCode === 'USD' ? '₦' : '$'),
                    'amount' => $secondaryEquivalent,
                ],
            ],
            'currencies' => $allCurrencies,
            'recentTransactions' => $recentTransactions,
            'recentOrders' => $recentOrders,
        ]);
    }
}
