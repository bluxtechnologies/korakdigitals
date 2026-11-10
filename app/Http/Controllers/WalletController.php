<?php

namespace App\Http\Controllers;

use App\Models\LedgerEntry;
use App\Models\FundingAccount;
use App\Models\Currency;
use App\Services\FinityPayService;
use App\Services\WalletService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class WalletController extends Controller
{
    protected FinityPayService $finityPayService;
    protected WalletService $walletService;
    protected AuditLogService $auditLogService;

    public function __construct(
        FinityPayService $finityPayService,
        WalletService $walletService,
        AuditLogService $auditLogService
    ) {
        $this->finityPayService = $finityPayService;
        $this->walletService = $walletService;
        $this->auditLogService = $auditLogService;
    }

    public function switchCurrency(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'currency_id' => ['required', 'exists:currencies,id'],
        ]);

        $user = $request->user();
        $oldCurrencyId = $user->user_currency_id;
        $newCurrencyId = (int) $validated['currency_id'];

        if ($newCurrencyId !== (int) $oldCurrencyId) {
            $oldCurrency = $user->currency ?: ($oldCurrencyId ? Currency::find($oldCurrencyId) : null) ?: Currency::where('is_default', true)->first() ?: Currency::first();
            $newCurrency = Currency::find($newCurrencyId);

            if ($oldCurrency && $newCurrency && $user->account) {
                $this->walletService->convertWalletCurrency($user->account, $oldCurrency, $newCurrency);
            }

            $user->update(['user_currency_id' => $newCurrencyId]);

            $this->auditLogService->logUser(
                'currency_switched',
                null,
                null,
                null,
                "Switched active wallet currency from {$oldCurrency->code} to {$newCurrency->code}",
                ['from' => $oldCurrency->code, 'to' => $newCurrency->code]
            );

            return back()->with('success', "Wallet currency switched to {$newCurrency->code}. Balance converted automatically.");
        }

        return back();
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $account = $user->account;

        $transactions = $account
            ? LedgerEntry::where('account_id', $account->id)->orderBy('id', 'desc')->take(5)->get()
            : collect();

        $currencies = Currency::where('is_active', true)->get();

        $fundingAccount = null;
        try {
            $fundingAccount = $user->fundingAccounts()->first();
            if (!$fundingAccount) {
                $fundingAccount = $this->finityPayService->generateVirtualAccount($user);
            }
        } catch (\Throwable $e) {
            Log::warning('WalletController::index - could not load virtual funding account: ' . $e->getMessage());
        }

        return Inertia::render('wallet', [
            'account' => $account,
            'transactions' => $transactions,
            'currencies' => $currencies,
            'fundingAccount' => $fundingAccount,
        ]);
    }

    public function showFund(Request $request): Response
    {
        $user = $request->user();
        $account = $user->account;
        $fundingAccount = $this->finityPayService->generateVirtualAccount($user);

        $recentDeposits = $account
            ? LedgerEntry::where('account_id', $account->id)
                ->where('type', 'credit')
                ->orderBy('id', 'desc')
                ->take(4)
                ->get()
                ->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'description' => $entry->description,
                        'category' => $entry->category,
                        'amount' => (float) $entry->amount,
                        'currency_code' => $entry->currency_code,
                        'reference' => $entry->reference,
                        'status' => 'success',
                        'created_at' => $entry->created_at?->toISOString(),
                    ];
                })
            : collect();

        $fundingRequests = \App\Models\FundingRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'failed', 'rejected'])
            ->orderBy('id', 'desc')
            ->take(4)
            ->get()
            ->map(function ($req) {
                return [
                    'id' => 'req_' . $req->id,
                    'description' => 'Bank Transfer (' . ($req->sender_name ?: 'Deposit') . ')',
                    'category' => 'bank_transfer',
                    'amount' => (float) $req->amount,
                    'currency_code' => $req->currency_code,
                    'reference' => $req->public_reference,
                    'status' => in_array($req->status, ['failed', 'rejected']) ? 'failed' : 'pending',
                    'created_at' => $req->created_at?->toISOString(),
                ];
            });

        $allDeposits = $recentDeposits->concat($fundingRequests)
            ->sortByDesc('created_at')
            ->take(4)
            ->values();

        return Inertia::render('wallet-fund', [
            'fundingAccount' => $fundingAccount,
            'recentDeposits' => $allDeposits,
        ]);
    }

    public function showHistory(Request $request): Response
    {
        $user = $request->user();
        $account = $user->account;

        $transactions = $account
            ? LedgerEntry::where('account_id', $account->id)->orderBy('id', 'desc')->paginate(30)
            : collect();

        return Inertia::render('wallet-history', [
            'transactions' => $transactions,
        ]);
    }

    public function initiatePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100|max:5000000',
            'redirect_url' => 'nullable|url',
        ]);

        $user = $request->user();
        $result = $this->finityPayService->initiatePayment(
            $user,
            (float) $validated['amount'],
            $validated['redirect_url'] ?? null
        );

        return response()->json($result);
    }

    public function verifyPayment(Request $request, string $reference): JsonResponse
    {
        $result = $this->finityPayService->verifyPayment($reference);
        return response()->json($result);
    }

    public function cofinanceWebhook(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();

        // FinityPay sends HMAC-SHA256 signature — try all known header variants
        $signature = $request->header('x-finitypay-signature')
            ?? $request->header('X-FinityPay-Signature')
            ?? $request->header('x-cofinance-signature')
            ?? $request->header('X-Cofinance-Signature')
            ?? $request->header('x-webhook-signature')
            ?? $request->header('X-Webhook-Signature');

        Log::info('FinityPay webhook received', [
            'has_signature' => !is_null($signature),
            'signature_preview' => $signature ? substr($signature, 0, 16) . '...' : null,
            'headers' => array_filter($request->headers->all(), fn($k) => str_contains(strtolower($k), 'sign') || str_contains(strtolower($k), 'finity') || str_contains(strtolower($k), 'cofinance'), ARRAY_FILTER_USE_KEY),
            'content_length' => strlen($rawBody),
        ]);

        $timestamp = $request->header('x-cofinance-timestamp') 
            ?? $request->header('x-timestamp') 
            ?? $request->header('X-Cofinance-Timestamp')
            ?? $request->header('X-Timestamp');

        if (!$this->finityPayService->verifyWebhookSignature($rawBody, $signature, $timestamp)) {
            Log::warning('FinityPay webhook signature verification failed', [
                'signature' => $signature,
                'timestamp' => $timestamp,
                'secret_configured' => !empty(config('services.finitypay.webhook_secret') ?: config('services.cofinance.webhook_secret')),
                'secret_preview' => substr(config('services.finitypay.webhook_secret') ?: config('services.cofinance.webhook_secret') ?: '', 0, 6) . '...',
                'all_headers' => $request->headers->all(),
            ]);
            return response()->json(['status' => 'error', 'message' => 'Invalid webhook signature'], 401);
        }

        $payload = $request->all();
        // Use the top-level event id as the idempotency key (FinityPay includes this)
        $eventRef = $payload['id'] ?? ('FP-EVT-' . time() . '-' . rand(1000, 9999));

        $success = $this->finityPayService->processWebhook($payload, $eventRef);

        return response()->json([
            'status' => $success ? 'success' : 'failed',
            'received' => true,
        ]);
    }

    public function finityPayWebhook(Request $request): JsonResponse
    {
        return $this->cofinanceWebhook($request);
    }
}
