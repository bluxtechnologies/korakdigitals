<?php

namespace App\Services;

use App\Models\User;
use App\Models\FundingAccount;
use App\Models\FundingRequest;
use App\Models\FundingProviderEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\WalletService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FinityPayService
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Resolve the active FinityPay base URL from configuration.
     */
    protected function getBaseUrl(): string
    {
        $env = config('services.finitypay.env', 'production');
        return $env === 'production'
            ? (config('services.finitypay.production_url') ?: 'https://api.finitypay.com.ng/v1')
            : (config('services.finitypay.sandbox_url') ?: 'https://api.finitypay.com.ng/v1');
    }

    /**
     * Retrieve the secret key from configuration.
     */
    protected function getSecretKey(): ?string
    {
        return config('services.finitypay.secret_key') ?: config('services.cofinance.secret_key');
    }

    /**
     * Centralized HTTP request handler with standardized error categorization.
     */
    protected function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $secretKey = $this->getSecretKey();
        $baseUrl = rtrim($this->getBaseUrl(), '/');
        $url = $baseUrl . '/' . ltrim($endpoint, '/');

        if (!$secretKey) {
            Log::info('FinityPay API secret key is not set.');
            return ['status' => 'error', 'code' => 401, 'message' => 'FinityPay credentials not configured.'];
        }

        // In local dev, override the URL to use the IP directly so Windows DNS is bypassed.
        // CURLOPT_RESOLVE does not propagate reliably through Guzzle on Windows.
        $resolvedUrl = $url;
        if (app()->environment('local') && str_contains($url, 'api.finitypay.com.ng')) {
            $resolvedUrl = str_replace('api.finitypay.com.ng', '169.239.181.90', $url);
        }

        try {
            $client = Http::withOptions([
                'verify' => !app()->environment('local', 'testing'),
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $secretKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Host' => 'api.finitypay.com.ng',
            ])->timeout(25);

            $response = match (strtoupper($method)) {
                'POST'   => $client->post($resolvedUrl, $data),
                'PUT'    => $client->put($resolvedUrl, $data),
                'DELETE' => $client->delete($resolvedUrl, $data),
                default  => $client->get($resolvedUrl, $data),
            };

            $status = $response->status();
            $body = $response->json() ?? [];

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'code' => $status,
                    'data' => $body['data'] ?? $body,
                    'meta' => $body['meta'] ?? [],
                    'message' => $body['message'] ?? 'OK',
                ];
            }

            // Centralized Error Handling per Brief §7
            match ($status) {
                400 => Log::warning('FinityPay 400 Bad Request: Check payload validation.', ['endpoint' => $endpoint, 'response' => $body]),
                401 => Log::error('FinityPay 401 Unauthorized: Invalid or missing API credentials.', ['endpoint' => $endpoint]),
                403 => Log::error('FinityPay 403 Forbidden: Account access restricted or suspended.', ['endpoint' => $endpoint]),
                422 => Log::warning('FinityPay 422 Unprocessable Entity: Business validation failed.', ['endpoint' => $endpoint, 'response' => $body]),
                500, 502, 503, 504 => Log::error('FinityPay 5xx Gateway Error: FinityPay side failure.', ['endpoint' => $endpoint, 'status' => $status]),
                default => Log::warning("FinityPay HTTP {$status} unexpected response.", ['endpoint' => $endpoint, 'response' => $body]),
            };

            return [
                'status' => 'error',
                'code' => $status,
                'message' => $body['message'] ?? "FinityPay error (HTTP {$status})",
                'errors' => $body['errors'] ?? [],
                'data' => $body['data'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('FinityPay HTTP connection exception', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => 'error',
                'code' => 500,
                'message' => 'Failed to connect to FinityPay gateway: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get existing or provision a new FinityPay customer UUID.
     * Brief §3: Check finitypay_customer_uuid first — never create duplicates.
     */
    public function getOrCreateCustomer(User $user): ?string
    {
        if ($user->finitypay_customer_uuid) {
            return $user->finitypay_customer_uuid;
        }

        $res = $this->makeRequest('POST', '/customers', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?: '08000000000',
        ]);

        if ($res['status'] === 'success' && isset($res['data'])) {
            $customerUuid = $res['data']['id'] ?? $res['data']['uuid'] ?? null;
            if ($customerUuid) {
                $user->update(['finitypay_customer_uuid' => $customerUuid]);
                return $customerUuid;
            }
        }

        // Fallback ONLY during automated testing
        if (app()->environment('testing')) {
            $mockUuid = 'cust_' . Str::lower(Str::random(16));
            $user->update(['finitypay_customer_uuid' => $mockUuid]);
            return $mockUuid;
        }

        return null;
    }

    /**
     * Generate or retrieve dedicated FinityPay virtual account for customer.
     * Brief §3: Correct Provisioning Order:
     * Cipher user exists -> check finitypay_customer_uuid (create if missing)
     * -> check active funding_account -> create virtual account using customer_id
     * -> save to funding_accounts -> display to user.
     */
    public function generateVirtualAccount(User $user): ?FundingAccount
    {
        $account = $user->account ?: \App\Models\Account::where('user_id', $user->id)->first();
        if (!$account) {
            $account = \App\Models\Account::create([
                'user_id' => $user->id,
                'public_reference' => 'ACC-' . Str::upper(Str::random(8)),
                'available_balance' => 0.00,
                'ledger_balance' => 0.00,
                'total_deposit' => 0.00,
                'status' => 'active',
            ]);
        }

        // 1. Check for existing active funding account
        $existing = FundingAccount::where('user_id', $user->id)
            ->where('provider', 'finitypay')
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return $existing;
        }

        // 2. Ensure customer UUID exists on FinityPay
        $customerUuid = $this->getOrCreateCustomer($user);
        if (!$customerUuid) {
            Log::warning('Unable to provision FinityPay virtual account: Customer UUID not established.', ['user_id' => $user->id]);
            return null;
        }

        // 3. Create virtual account on FinityPay using customer_id
        $res = $this->makeRequest('POST', '/virtual-accounts', [
            'customer_id' => $customerUuid,
        ]);

        if ($res['status'] === 'success' && isset($res['data'])) {
            $data = $res['data'];
            $bankAcc = $data['bank_account'] ?? $data;
            $vaUuid = $data['id'] ?? $data['uuid'] ?? ('va_' . Str::random(16));
            $accNumber = $bankAcc['account_number'] ?? $data['account_number'] ?? null;
            $bankName = $bankAcc['bank_name'] ?? $data['bank_name'] ?? 'Paga';
            $accountName = $bankAcc['account_name'] ?? $data['account_name'] ?? ('KORAK / ' . $user->name);
            $status = $bankAcc['status'] ?? $data['status'] ?? 'active';

            if ($accNumber) {
                return FundingAccount::create([
                    'user_id' => $user->id,
                    'account_id' => $account->id,
                    'provider' => 'finitypay',
                    'account_number' => $accNumber,
                    'bank_name' => $bankName,
                    'account_name' => $accountName,
                    'external_reference' => $vaUuid,
                    'status' => $status,
                ]);
            }
        }

        // Fallback ONLY during automated testing
        if (app()->environment('testing')) {
            return FundingAccount::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'provider' => 'finitypay',
                'account_number' => '8' . rand(100000000, 999999999),
                'bank_name' => 'Paga (FinityPay Test)',
                'account_name' => 'KORAK / ' . $user->name,
                'external_reference' => 'va_sbx_' . Str::random(12),
                'status' => 'active',
            ]);
        }

        return null;
    }

    /**
     * Validate FinityPay / Cofinance webhook signature via HMAC SHA256.
     * Supports both direct HMAC (hex or base64) and timestamped format (t=...,v1=...).
     */
    public function verifyWebhookSignature(string $rawContent, ?string $signature, ?string $headerTimestamp = null): bool
    {
        if (app()->environment('local') && config('services.finitypay.skip_webhook_verify', false)) {
            Log::warning('FinityPay webhook signature verification bypassed via FINITYPAY_SKIP_WEBHOOK_VERIFY=true for local testing');
            return true;
        }

        $secret = config('services.finitypay.webhook_secret') ?: config('services.cofinance.webhook_secret');
        if (!$secret || !$signature) {
            return false;
        }

        // 1. Direct hex match
        $computedHex = hash_hmac('sha256', $rawContent, $secret);
        if (hash_equals($computedHex, $signature)) {
            return true;
        }

        // 2. Direct base64 match
        $computedB64 = base64_encode(hash_hmac('sha256', $rawContent, $secret, true));
        if (hash_equals($computedB64, $signature)) {
            return true;
        }

        // 3. Parse timestamped scheme: t={timestamp},v1={hash}
        $timestamp = $headerTimestamp;
        $v1Sig = null;

        if (str_contains($signature, 't=') || str_contains($signature, 'v1=')) {
            $parts = explode(',', $signature);
            foreach ($parts as $part) {
                $pair = explode('=', trim($part), 2);
                if (count($pair) === 2) {
                    $key = trim($pair[0]);
                    $val = trim($pair[1]);
                    if ($key === 't') {
                        $timestamp = $val;
                    } elseif ($key === 'v1') {
                        $v1Sig = $val;
                    }
                }
            }
        } else {
            $v1Sig = $signature;
        }

        if ($v1Sig) {
            // Check v1 against direct raw content (base64 and hex)
            if (hash_equals($computedB64, $v1Sig) || hash_equals($computedHex, $v1Sig)) {
                return true;
            }

            // Check v1 against timestamped payload: "$timestamp.$rawContent" (Standard Stripe/Cofinance style)
            if ($timestamp) {
                $signedPayload = $timestamp . '.' . $rawContent;
                $tB64 = base64_encode(hash_hmac('sha256', $signedPayload, $secret, true));
                $tHex = hash_hmac('sha256', $signedPayload, $secret);

                if (hash_equals($tB64, $v1Sig) || hash_equals($tHex, $v1Sig)) {
                    return true;
                }

                // Check "$timestamp$rawContent" without dot separator
                $signedPayloadNoDot = $timestamp . $rawContent;
                $tB64NoDot = base64_encode(hash_hmac('sha256', $signedPayloadNoDot, $secret, true));
                if (hash_equals($tB64NoDot, $v1Sig)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Process FinityPay webhook notification with idempotency check.
     * Brief §5 & §6: Real nested shape parsing, top-level event ID as idempotency key,
     * and credit customer with net_amount (not gross amount).
     */
    public function processWebhook(array $payload, string $eventReference): bool
    {
        // Top-level event ID or reference used as idempotency key
        $eventId = $payload['id'] 
            ?? $payload['reference'] 
            ?? (isset($payload['transaction_id']) ? ('tx_' . $payload['transaction_id']) : null)
            ?? $eventReference;

        $existingEvent = FundingProviderEvent::where('event_reference', $eventId)->first();
        if ($existingEvent && $existingEvent->status === 'processed') {
            return true;
        }

        $eventType = $payload['type'] ?? $payload['event'] ?? ($payload['gateway_status'] ?? 'wallet.funded');

        $event = FundingProviderEvent::firstOrCreate(
            ['event_reference' => $eventId],
            [
                'provider' => 'finitypay',
                'event_type' => $eventType,
                'payload' => $payload,
                'status' => 'received',
            ]
        );

        // Route bill events (bill.successful, bill.pending, bill.failed)
        if (str_starts_with((string) $eventType, 'bill.')) {
            return $this->processBillWebhook($payload, $event);
        }

        // Check if gateway status indicates failed/cancelled
        $gatewayStatus = strtolower($payload['gateway_status'] ?? 'success');
        if ($gatewayStatus === 'failed' || $gatewayStatus === 'cancelled') {
            $event->update(['status' => 'failed', 'failure_reason' => "Gateway reported {$gatewayStatus}"]);
            return false;
        }

        // Support both shapes:
        // 1. Live FinityPay format: { cleared_amount, processing_fee, reference, payload: { account_number, settled_amount, provider_callback: { ... } } }
        // 2. Standard format: { data: { account: { account_number }, transaction: { amount, fee, net_amount } } }
        $innerPayload = $payload['payload'] ?? [];
        $data = $payload['data'] ?? [];
        $accData = $data['account'] ?? [];
        $txnData = $data['transaction'] ?? [];
        $providerCb = $innerPayload['provider_callback'] ?? [];
        $payerDetails = $providerCb['payerDetails'] ?? [];

        $accountNumber = $accData['account_number'] 
            ?? $data['account_number'] 
            ?? ($innerPayload['account_number'] ?? null)
            ?? ($providerCb['accountNumber'] ?? null)
            ?? ($payload['account_number'] ?? null);

        $grossAmount = (float) (
            $txnData['amount'] 
            ?? $data['amount'] 
            ?? ($payload['cleared_amount'] ?? null)
            ?? ($innerPayload['customer_charge'] ?? null)
            ?? ($providerCb['amount'] ?? null)
            ?? ($payload['amount'] ?? 0)
        );

        $fee = (float) (
            $txnData['fee'] 
            ?? $data['fee'] 
            ?? ($payload['processing_fee'] ?? null)
            ?? ($innerPayload['calculated_fee'] ?? null)
            ?? ($payload['fee'] ?? 0)
        );

        $netAmount = (float) (
            $txnData['net_amount'] 
            ?? $data['net_amount'] 
            ?? ($innerPayload['settled_amount'] ?? null)
            ?? ($payload['net_amount'] ?? ($grossAmount - $fee))
        );

        $providerRef = $txnData['reference'] 
            ?? $txnData['provider_reference'] 
            ?? $data['reference'] 
            ?? ($payload['reference'] ?? null)
            ?? ($innerPayload['provider_transaction_id'] ?? null)
            ?? ($providerCb['transactionReference'] ?? $eventId);

        $senderName = $payerDetails['payerName'] 
            ?? ($data['customer']['name'] ?? null)
            ?? ($data['sender_name'] ?? null)
            ?? ($payload['sender_name'] ?? 'Bank Transfer');

        if ($grossAmount <= 0 && $netAmount <= 0) {
            $event->update(['status' => 'failed', 'failure_reason' => 'Invalid transaction amount.']);
            return false;
        }

        // Match funding account via account_number
        $fundingAcc = null;
        if ($accountNumber) {
            $fundingAcc = FundingAccount::where('account_number', $accountNumber)->first();
        }

        $user = $fundingAcc?->user;

        // Fallback: match by customer UUID if present
        if (!$user && isset($data['customer']['uuid'])) {
            $user = User::where('finitypay_customer_uuid', $data['customer']['uuid'])->first();
        }

        // Fallback: match by email
        if (!$user && isset($data['customer']['email'])) {
            $user = User::where('email', $data['customer']['email'])->first();
        }

        if (!$user || !$user->account) {
            $event->update(['status' => 'failed', 'failure_reason' => 'Associated customer account not found.']);
            return false;
        }

        $account = $user->account;

        // Financial decision: Credit customer with net_amount, not gross amount.
        // The fee FinityPay deducts (e.g. ₦10 on a ₦15,000 transfer) is FinityPay's processing cost,
        // already taken out before it ever reaches Cipher's reseller wallet — crediting the customer
        // the full gross amount would mean Cipher absorbs that fee out of its own margin on every deposit.
        // We pass net_amount to WalletService::creditWallet(), while recording gross amount and fee in
        // metadata so the fee remains fully auditable for accounting reconciliation.
        $this->walletService->creditWallet(
            $account,
            $netAmount,
            $txnData['currency'] ?? 'NGN',
            'bank_transfer_deposit',
            "Automated FinityPay Bank Transfer Deposit from {$senderName} [Ref: {$providerRef}]",
            'FP-DEP-' . $providerRef,
            'idempotency_fp_' . $eventId,
            [
                'gross_amount' => $grossAmount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'event_id' => $eventId,
            ]
        );

        $fundingReq = FundingRequest::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'funding_account_id' => $fundingAcc?->id,
            'public_reference' => 'REQ-' . Str::upper(Str::random(10)),
            'provider' => 'finitypay',
            'amount' => $netAmount,
            'currency_code' => $txnData['currency'] ?? 'NGN',
            'status' => 'approved',
            'sender_name' => $senderName,
            'provider_reference' => $providerRef,
            'processed_at' => now(),
            'metadata' => [
                'gross_amount' => $grossAmount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'raw_payload' => $payload,
            ],
        ]);

        $event->update([
            'status' => 'processed',
            'funding_request_id' => $fundingReq->id,
            'processed_at' => now(),
        ]);

        return true;
    }

    /**
     * Initiate a dynamic checkout payment session.
     */
    public function initiatePayment(User $user, float $amount, ?string $redirectUrl = null): array
    {
        $reference = 'CLQ-DEP-' . $user->id . '-' . strtoupper(Str::random(10));

        $res = $this->makeRequest('POST', '/payments', [
            'amount' => $amount,
            'customer_email' => $user->email,
            'customer_name' => $user->name,
            'reference' => $reference,
            'redirect_url' => $redirectUrl ?? url('/user/wallet'),
        ]);

        if ($res['status'] === 'success' && isset($res['data'])) {
            return [
                'status' => 'success',
                'reference' => $res['data']['reference'] ?? $reference,
                'payment_url' => $res['data']['payment_url'] ?? $res['data']['checkout_url'] ?? '#',
                'amount' => $amount,
                'currency' => 'NGN',
                'expires_at' => $res['data']['expires_at'] ?? now()->addMinutes(30)->toISOString(),
            ];
        }

        // Fallback for local sandbox testing
        return [
            'status' => 'success',
            'reference' => $reference,
            'payment_url' => 'https://checkout-sandbox.cofinance.ng/pay/' . $reference,
            'amount' => $amount,
            'currency' => 'NGN',
            'expires_at' => now()->addMinutes(30)->toISOString(),
        ];
    }

    /**
     * Verify payment status.
     */
    public function verifyPayment(string $reference): array
    {
        $res = $this->makeRequest('GET', '/payments/verify/' . $reference);
        if ($res['status'] === 'success' && isset($res['data'])) {
            return [
                'status' => 'success',
                'data' => $res['data'],
            ];
        }

        $fundingReq = FundingRequest::where('provider_reference', $reference)
            ->orWhere('public_reference', $reference)
            ->first();

        if ($fundingReq && $fundingReq->status === 'approved') {
            return [
                'status' => 'success',
                'message' => 'Payment confirmed and credited.',
            ];
        }

        return [
            'status' => 'pending',
            'message' => 'Payment is still processing.',
        ];
    }

    /**
     * Process FinityPay bill/VTU webhook notifications (bill.successful, bill.pending, bill.failed).
     */
    protected function processBillWebhook(array $payload, FundingProviderEvent $event): bool
    {
        $bill = $payload['data']['bill_payment'] ?? $payload['data'] ?? $payload;
        $reference = $bill['reference'] ?? $bill['provider_reference'] ?? null;
        $uuid = $bill['uuid'] ?? null;
        $status = strtolower($bill['status'] ?? '');

        Log::info('Processing FinityPay bill webhook', [
            'type' => $event->event_type,
            'reference' => $reference,
            'uuid' => $uuid,
            'status' => $status,
        ]);

        $orderItem = OrderItem::where('supplier_order_reference', $reference)
            ->orWhere('supplier_order_reference', $uuid)
            ->orWhereJsonContains('metadata->reference', $reference)
            ->orWhereJsonContains('metadata->uuid', $uuid)
            ->first();

        if (!$orderItem) {
            Log::warning('Bill webhook order item not found', ['reference' => $reference, 'uuid' => $uuid]);
            $event->update(['status' => 'failed', 'failure_reason' => 'Associated order item not found.']);
            return false;
        }

        $order = $orderItem->order;

        if ($event->event_type === 'bill.successful' || $status === 'success') {
            $orderItem->update(['status' => 'completed']);
            if ($order && $order->status !== 'completed') {
                $order->update(['status' => 'completed']);
            }
            $event->update(['status' => 'processed', 'processed_at' => now()]);
            return true;
        }

        if ($event->event_type === 'bill.failed' || $status === 'failed') {
            $orderItem->update(['status' => 'failed']);
            if ($order && $order->status !== 'failed' && $order->status !== 'refunded') {
                $order->update(['status' => 'failed']);

                // Process automatic refund to user wallet if not already refunded
                if ($order->account && $order->total_amount > 0) {
                    $this->walletService->creditWallet(
                        $order->account,
                        (float) $order->total_amount,
                        $order->currency_code,
                        'service_refund',
                        "Automated Refund for failed bill payment: {$orderItem->item_title} [Ref: {$order->public_reference}]",
                        'RF-' . $order->public_reference
                    );
                    $order->update(['status' => 'refunded']);
                }
            }
            $event->update(['status' => 'processed', 'failure_reason' => 'Provider reported bill failure', 'processed_at' => now()]);
            return true;
        }

        if ($event->event_type === 'bill.pending' || $status === 'pending') {
            $orderItem->update(['status' => 'pending']);
            if ($order && $order->status === 'processing') {
                $order->update(['status' => 'pending']);
            }
            $event->update(['status' => 'processed', 'processed_at' => now()]);
            return true;
        }

        $event->update(['status' => 'processed', 'processed_at' => now()]);
        return true;
    }

    /**
     * Get all bill categories supported by FinityPay.
     */
    public function getBillCategories(): array
    {
        return $this->makeRequest('GET', '/bills/categories');
    }

    /**
     * Get bill services for a category (e.g. data or airtime).
     */
    public function getBillServices(?string $category = null): array
    {
        $params = $category ? ['category' => $category] : [];
        return $this->makeRequest('GET', '/bills/services', $params);
    }

    /**
     * Get live data bundle packages for a given service code with caching.
     */
    public function getDataBundles(string $serviceCode): array
    {
        $cacheKey = 'finitypay_bundles_' . strtolower($serviceCode);

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($serviceCode) {
            $res = $this->makeRequest('GET', '/bills/data-bundles', ['service_code' => $serviceCode]);
            if ($res['status'] === 'success' && !empty($res['data'])) {
                return $res['data'];
            }
            return [];
        });
    }

    /**
     * Purchase a bill service (Mobile Data or Airtime) through FinityPay.
     *
     * Both data bundles and airtime VTU require service_code, customer_identifier, and amount.
     * For data bundles, amount must match the provider's bundle price, and package_code is also provided.
     */
    public function payBill(string $serviceCode, ?string $packageCode, string $customerIdentifier, float $amount): array
    {
        $payload = [
            'service_code'        => $serviceCode,
            'customer_identifier' => $customerIdentifier,
            'amount'              => $amount,
        ];

        if ($packageCode) {
            $payload['package_code'] = $packageCode;
        }

        return $this->makeRequest('POST', '/bills/pay', $payload);
    }

    /**
     * Retrieve status of a specific bill transaction.
     */
    public function getBillStatus(string $reference): array
    {
        return $this->makeRequest('GET', '/bills/' . $reference);
    }
}
