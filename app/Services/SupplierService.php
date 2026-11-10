<?php

namespace App\Services;

use App\Domain\Services\DTOs\OrderRequestDTO;
use App\Domain\Services\Drivers\SmsActivationDriver;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\Supplier;
use App\Services\WalletService;
use App\Services\PricingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplierService
{
    protected WalletService $walletService;
    protected PricingService $pricingService;
    protected SmsActivationDriver $smsActivationDriver;

    public function __construct(
        WalletService $walletService,
        PricingService $pricingService,
        SmsActivationDriver $smsActivationDriver
    ) {
        $this->walletService = $walletService;
        $this->pricingService = $pricingService;
        $this->smsActivationDriver = $smsActivationDriver;
    }

    /**
     * Get the active SMS activation driver.
     */
    public function getSmsDriver(): SmsActivationDriver
    {
        return $this->smsActivationDriver;
    }

    /**
     * Process service order across any digital category (Numbers, Growth, Accounts, VPN, eSIM, Airtime/Data).
     */
    public function placeOrder(User $user, string $serviceCode, int $quantity = 1, array $options = []): Order
    {
        $service = Service::where('code', $serviceCode)->first();

        // Handle dynamic numbers service entries on demand
        if (!$service && (str_starts_with($serviceCode, 'num_') || ($options['category'] ?? null) === 'numbers')) {
            $cleanName = $options['service_name'] ?? ucfirst(str_replace('num_', '', $serviceCode));
            $service = Service::firstOrCreate(
                ['code' => $serviceCode],
                [
                    'category' => 'numbers',
                    'name' => "{$cleanName} Verification Number",
                    'is_active' => true,
                ]
            );
        }

        if (!$service) {
            throw new \RuntimeException("Service with code '{$serviceCode}' was not found.");
        }

        if (!$service->is_active) {
            throw new \RuntimeException("This service is currently not active and is unavailable for the time being.");
        }

        $account = $user->account;
        if (!$account) {
            throw new \RuntimeException("User wallet account not found.");
        }

        $userCurrency = $user->currency ? $user->currency->code : 'NGN';
        $rate = $user->currency ? (float) $user->currency->rate : 1500.0;

        $supplier = Supplier::where('is_active', true)->first();
        $supplierId = $supplier ? $supplier->id : null;

        // Base supplier cost in USD (extracted from options if provided by live offer, else default $2.00)
        $baseCostUsd = isset($options['cost_usd']) && (float) $options['cost_usd'] > 0
            ? (float) $options['cost_usd']
            : 2.00;

        // Pricing snapshot
        $pricing = $this->pricingService->calculateSellingPrice($baseCostUsd, $supplierId, $service->id);
        $unitSellingUsd = $pricing['unit_selling_price'];

        // Convert to user currency
        $unitSellingPrice = ($userCurrency === 'NGN') ? ($unitSellingUsd * $rate) : $unitSellingUsd;
        $totalAmount = round($unitSellingPrice * $quantity, 2);

        // Pre-check wallet balance before calling provider
        if ((float) $account->available_balance < $totalAmount) {
            throw new \RuntimeException("Insufficient wallet balance. Total required: {$totalAmount} {$userCurrency}.");
        }

        $isNumbers = ($service->category === 'numbers');
        $initialOrderStatus = $isNumbers ? 'active' : 'completed';

        // Real driver integration for numbers category
        if ($isNumbers) {
            $requestDto = new OrderRequestDTO(
                supplierSku: $options['service_code'] ?? str_replace('num_', '', $service->code),
                quantity: $quantity,
                options: $options,
                amount: $baseCostUsd,
                userId: $user->id
            );

            $driverResult = $this->smsActivationDriver->placeOrder($requestDto);
            if (!$driverResult->isSuccess) {
                throw new \RuntimeException($driverResult->errorMessage ?? 'Failed to activate phone number with provider.');
            }

            $credentialsPayload = $driverResult->credentialsPayload;
            $supplierRef = $driverResult->externalReference;
        } else {
            // Unchanged fallthrough for non-numbers categories
            $credentialsPayload = $this->generateFulfillmentPayload($service->category, $options);
            $supplierRef = 'SUP-REF-' . Str::upper(Str::random(8));
        }

        // Debit Wallet
        $idempotencyKey = 'ord_debit_' . Str::random(16);
        $this->walletService->debitWallet(
            $account,
            $totalAmount,
            $userCurrency,
            'service_purchase',
            "Order for {$service->name} (Qty: {$quantity})",
            'ORD-DR-' . Str::upper(Str::random(10)),
            $idempotencyKey
        );

        // Create Order Header
        $order = Order::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'public_reference' => 'KORAK-' . rand(100000, 999999),
            'service_category' => $service->category,
            'total_amount' => $totalAmount,
            'currency_code' => $userCurrency,
            'status' => $initialOrderStatus,
            'metadata' => array_merge($options, [
                'supplier_cost_usd' => $baseCostUsd,
            ]),
        ]);

        // Create Order Item Snapshot
        OrderItem::create([
            'order_id' => $order->id,
            'service_id' => $service->id,
            'supplier_id' => $supplierId,
            'item_title' => $service->name,
            'quantity' => $quantity,
            'supplier_cost' => $baseCostUsd,
            'markup_percentage' => $pricing['markup_percentage'],
            'unit_selling_price' => $unitSellingPrice,
            'subtotal' => $totalAmount,
            'currency_code' => $userCurrency,
            'supplier_order_reference' => $supplierRef,
            'status' => $initialOrderStatus,
            'credentials_payload' => $credentialsPayload,
        ]);

        return $order->fresh(['items']);
    }

    /**
     * Poll / check latest OTP status for an active number order item.
     */
    public function checkNumberStatus(User $user, int $orderItemId): array
    {
        $item = OrderItem::where('id', $orderItemId)
            ->whereHas('order', fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $payload = $item->credentials_payload ?? [];
        $activationId = $item->supplier_order_reference ?? ($payload['activation_id'] ?? null);

        // If OTP already received, return current state
        if (!empty($payload['sms_code'])) {
            return [
                'status' => 'sms_received',
                'sms_code' => $payload['sms_code'],
                'sms_text' => $payload['sms_text'] ?? null,
                'item' => $item,
            ];
        }

        // If not expired, poll provider fallback
        if ($activationId) {
            $result = $this->smsActivationDriver->checkStatus((string) $activationId);
            if (!empty($result->credentialsPayload['sms_code'])) {
                $payload['sms_code'] = $result->credentialsPayload['sms_code'];
                $payload['sms_text'] = $result->credentialsPayload['sms_text'] ?? null;
                $payload['status'] = 'STATUS_OK';
                $payload['received_at'] = now()->toIso8601String();

                $item->credentials_payload = $payload;
                $item->save();

                return [
                    'status' => 'sms_received',
                    'sms_code' => $payload['sms_code'],
                    'sms_text' => $payload['sms_text'] ?? null,
                    'item' => $item,
                ];
            }
        }

        return [
            'status' => $item->status,
            'sms_code' => null,
            'sms_text' => null,
            'item' => $item,
        ];
    }

    /**
     * Cancel an active number and issue wallet refund.
     */
    public function cancelNumberOrder(User $user, int $orderItemId): array
    {
        return DB::transaction(function () use ($user, $orderItemId) {
            $item = OrderItem::where('id', $orderItemId)
                ->whereHas('order', fn($q) => $q->where('user_id', $user->id))
                ->lockForUpdate()
                ->firstOrFail();

            $order = $item->order;
            $payload = $item->credentials_payload ?? [];

            if (!empty($payload['sms_code'])) {
                throw new \RuntimeException('Cannot cancel an activation after an SMS code has already been received.');
            }

            if ($item->status === 'cancelled' || $item->status === 'completed') {
                throw new \RuntimeException("This order item is already {$item->status}.");
            }

            $activationId = $item->supplier_order_reference ?? ($payload['activation_id'] ?? null);
            if ($activationId) {
                $this->smsActivationDriver->cancelOrder((string) $activationId);
            }

            // Refund wallet
            $account = $user->account;
            $refundAmount = (float) $item->subtotal;
            $currencyCode = $item->currency_code ?? ($user->currency ? $user->currency->code : 'NGN');

            $this->walletService->creditWallet(
                $account,
                $refundAmount,
                $currencyCode,
                'refund',
                "Refund for cancelled number activation (#{$order->public_reference})",
                'REF-' . Str::upper(Str::random(10)),
                'ref_cancel_' . $item->id . '_' . Str::random(8)
            );

            // Update item & order statuses
            $payload['status'] = 'CANCELLED';
            $payload['cancelled_at'] = now()->toIso8601String();
            $item->credentials_payload = $payload;
            $item->status = 'cancelled';
            $item->save();

            $order->status = 'cancelled';
            $order->save();

            return [
                'success' => true,
                'message' => "Order #{$order->public_reference} cancelled and {$refundAmount} {$currencyCode} refunded to your wallet.",
                'order' => $order->fresh(['items']),
            ];
        });
    }

    /**
     * Complete and finish an activation.
     */
    public function finishNumberOrder(User $user, int $orderItemId): array
    {
        $item = OrderItem::where('id', $orderItemId)
            ->whereHas('order', fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $payload = $item->credentials_payload ?? [];
        $activationId = $item->supplier_order_reference ?? ($payload['activation_id'] ?? null);

        if ($activationId) {
            $this->smsActivationDriver->finishActivation((string) $activationId);
        }

        $payload['status'] = 'FINISHED';
        $payload['finished_at'] = now()->toIso8601String();
        $item->credentials_payload = $payload;
        $item->status = 'completed';
        $item->save();

        $item->order->status = 'completed';
        $item->order->save();

        return [
            'success' => true,
            'message' => 'Activation finished and marked as completed.',
            'order' => $item->order->fresh(['items']),
        ];
    }

    /**
     * Fallback mock payload generator for non-numbers services.
     */
    protected function generateFulfillmentPayload(string $category, array $options): array
    {
        return match ($category) {
            'growth' => [
                'target_link' => $options['link'] ?? 'https://instagram.com/profile',
                'platform' => $options['platform'] ?? 'instagram',
                'status' => 'delivering_live',
            ],
            'accounts' => [
                'username' => 'cipher_user_' . rand(1000, 9999),
                'password' => 'Pass_' . Str::random(8) . '!',
                '2fa_secret' => 'JBSWY3DPEHPK3PXP',
                'cookie' => 'sessionid=' . Str::random(24),
            ],
            'vpn' => [
                'protocol' => 'WireGuard',
                'server_location' => 'US East (New York)',
                'vpn_key' => 'wg_key_' . Str::random(32) . '=',
                'config_download' => 'https://cipher.com/vpn/download/' . Str::random(10),
            ],
            'esim' => [
                'iccid' => '898600' . rand(100000000000, 999999999999),
                'qr_code' => 'LPA:1$cipher.esim.net$' . Str::random(16),
                'data_allowance' => '1GB 7 Days',
            ],
            default => [
                'status' => 'success',
                'reference' => 'ITEM-' . Str::random(10),
            ]
        };
    }
}
