<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Account;
use App\Services\FinityPayService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BillsController extends Controller
{
    protected FinityPayService $finityPayService;
    protected WalletService $walletService;

    public function __construct(FinityPayService $finityPayService, WalletService $walletService)
    {
        $this->finityPayService = $finityPayService;
        $this->walletService = $walletService;
    }

    /**
     * Supported telecom networks in Nigeria.
     */
    protected function getSupportedNetworks(): array
    {
        return [
            [
                'id'              => 'mtn',
                'name'            => 'MTN Nigeria',
                'short'           => 'MTN',
                'data_service'    => 'MTN_DATA',
                'airtime_service' => 'MTN_VTU',
                'discount'        => '₦1 OFF',
                'color'           => '#EAB308',
                'logo'            => '/telecom-logos/mtn-seeklogo.svg',
                'prefix'          => ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916'],
            ],
            [
                'id'              => 'airtel',
                'name'            => 'Airtel Nigeria',
                'short'           => 'Airtel',
                'data_service'    => 'AIRTEL_DATA',
                'airtime_service' => 'AIRTEL_VTU',
                'discount'        => '₦1 OFF',
                'color'           => '#EF4444',
                'logo'            => '/telecom-logos/airtel.svg',
                'prefix'          => ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'],
            ],
            [
                'id'              => 'glo',
                'name'            => 'Glo Nigeria',
                'short'           => 'Glo',
                'data_service'    => 'GLO_DATA',
                'airtime_service' => 'GLO_VTU',
                'discount'        => '₦1 OFF',
                'color'           => '#22C55E',
                'logo'            => '/telecom-logos/glo-limited-seeklogo.svg',
                'prefix'          => ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
            ],
            [
                'id'              => '9mobile',
                'name'            => '9mobile Nigeria',
                'short'           => '9mobile',
                'data_service'    => '9MOBILE_DATA',
                'airtime_service' => '9MOBILE_VTU',
                'discount'        => '₦1 OFF',
                'color'           => '#10B981',
                'logo'            => '/telecom-logos/9mobile-seeklogo.svg',
                'prefix'          => ['0809', '0818', '0817', '0909', '0908'],
            ],
        ];
    }

    /**
     * Display the Airtime purchase page.
     */
    public function airtimeIndex(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->where('service_category', 'airtime')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('services/airtime', [
            'networks'     => $this->getSupportedNetworks(),
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Display the Mobile Data Bundles purchase page.
     */
    public function dataIndex(Request $request): Response
    {
        $user = $request->user();

        // Preload MTN bundles for fast initial render
        $initialBundles = $this->finityPayService->getDataBundles('MTN_DATA');

        $recentOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->where('service_category', 'mobile_data')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('services/data', [
            'networks'      => $this->getSupportedNetworks(),
            'initialBundles' => $initialBundles,
            'recentOrders'  => $recentOrders,
        ]);
    }

    /**
     * Retrieve live data bundle packages for a given service code.
     */
    public function getBundles(Request $request, string $serviceCode): JsonResponse
    {
        $validCodes = ['MTN_DATA', 'AIRTEL_DATA', 'GLO_DATA', '9MOBILE_DATA'];
        $code = strtoupper(trim($serviceCode));

        if (!in_array($code, $validCodes)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid data service code.',
            ], 422);
        }

        $bundles = $this->finityPayService->getDataBundles($code);

        return response()->json([
            'status' => 'success',
            'service_code' => $code,
            'data' => $bundles,
        ]);
    }

    /**
     * Purchase Mobile Data bundle or Airtime via FinityPay.
     */
    public function purchase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:data,airtime'],
            'network' => ['required', 'string', 'in:mtn,airtel,glo,9mobile'],
            'service_code' => ['required', 'string'],
            'package_code' => ['nullable', 'string'],
            'phone' => ['required', 'string', 'min:10', 'max:15'],
            'amount' => ['required', 'numeric', 'min:1', 'max:50000'],
            'package_name' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $account = $user->account;

        if (!$account) {
            return response()->json([
                'status' => 'error',
                'message' => 'User wallet account not found.',
            ], 400);
        }

        // Clean and normalize Nigerian phone number (080... or 234...)
        $rawPhone = preg_replace('/[^\d]/', '', $validated['phone']);
        if (str_starts_with($rawPhone, '234') && strlen($rawPhone) === 13) {
            $cleanedPhone = '0' . substr($rawPhone, 3);
        } elseif (strlen($rawPhone) === 10) {
            $cleanedPhone = '0' . $rawPhone;
        } else {
            $cleanedPhone = $rawPhone;
        }

        if (strlen($cleanedPhone) !== 11) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please enter a valid 11-digit phone number (e.g. 08012345678).',
            ], 422);
        }

        $mode = $validated['mode'];
        $serviceCode = strtoupper(trim($validated['service_code']));
        $packageCode = $validated['package_code'] ?? null;
        $amountNgn = (float) $validated['amount'];
        $packageName = $validated['package_name'] ?? ($mode === 'data' ? 'Mobile Data Plan' : "₦" . number_format($amountNgn) . " Airtime");

        // Resolve network details
        $networks = collect($this->getSupportedNetworks());
        $networkInfo = $networks->firstWhere('id', $validated['network']) ?? [
            'name' => strtoupper($validated['network']),
        ];
        $networkName = $networkInfo['name'];

        // Determine user wallet currency and conversion rate
        $userCurrency = $user->currency ? $user->currency->code : 'NGN';
        $rate = $user->currency ? (float) $user->currency->rate : 1.0;

        // Exact amount: provider packages already reflect provider discounts.
        $chargedNgn = $amountNgn;
        $apiAmountNgn = $amountNgn;

        // Calculate amount to debit from customer in their wallet currency
        $sellingPrice = ($userCurrency === 'USD')
            ? round($chargedNgn / max($rate, 1), 2)
            : round($chargedNgn, 2);

        // Step 1: Atomic wallet balance check and deduction to prevent double-spending
        try {
            $orderData = DB::transaction(function () use (
                $account, 
                $user, 
                $sellingPrice, 
                $userCurrency, 
                $mode, 
                $cleanedPhone, 
                $networkName, 
                $packageName, 
                $serviceCode, 
                $packageCode, 
                $amountNgn
            ) {
                // Lock account row for update
                $lockedAccount = Account::where('id', $account->id)->lockForUpdate()->firstOrFail();

                if ((float) $lockedAccount->available_balance < $sellingPrice) {
                    throw new \InvalidArgumentException('Insufficient wallet balance. Please fund your wallet to continue.');
                }

                // Debit wallet
                $publicRef = 'CLQ-VTU-' . rand(100000, 999999);
                $idempotencyKey = 'vtu_debit_' . Str::random(16);

                $this->walletService->debitWallet(
                    $lockedAccount,
                    $sellingPrice,
                    $userCurrency,
                    'service_purchase',
                    "{$networkName} " . ($mode === 'data' ? $packageName : "₦" . number_format($amountNgn) . " Airtime") . " ({$cleanedPhone})",
                    'ORD-DR-' . Str::upper(Str::random(10)),
                    $idempotencyKey,
                    [
                        'phone' => $cleanedPhone,
                        'service_code' => $serviceCode,
                        'package_code' => $packageCode,
                        'amount_ngn' => $amountNgn,
                    ]
                );

                // Create Order Header
                $order = Order::create([
                    'user_id' => $user->id,
                    'account_id' => $lockedAccount->id,
                    'public_reference' => $publicRef,
                    'service_category' => $mode === 'data' ? 'mobile_data' : 'airtime',
                    'total_amount' => $sellingPrice,
                    'currency_code' => $userCurrency,
                    'status' => 'processing',
                    'metadata' => [
                        'phone' => $cleanedPhone,
                        'network' => $networkName,
                        'service_code' => $serviceCode,
                        'package_code' => $packageCode,
                        'package_name' => $packageName,
                        'amount_ngn' => $amountNgn,
                    ],
                ]);

                // Create Order Item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'item_title' => "{$networkName} " . ($mode === 'data' ? $packageName : "₦" . number_format($amountNgn) . " Airtime"),
                    'quantity' => 1,
                    'supplier_cost' => $amountNgn,
                    'markup_percentage' => 0.00,
                    'unit_selling_price' => $sellingPrice,
                    'subtotal' => $sellingPrice,
                    'currency_code' => $userCurrency,
                    'status' => 'processing',
                    'credentials_payload' => [
                        'phone' => $cleanedPhone,
                        'network' => $networkName,
                        'service' => $serviceCode,
                        'package' => $packageName,
                        'delivered_at' => now()->toDateTimeString(),
                    ],
                    'metadata' => [
                        'service_code' => $serviceCode,
                        'package_code' => $packageCode,
                        'amount_ngn' => $amountNgn,
                    ],
                ]);

                return [$order, $orderItem];
            });

            /** @var Order $order */
            [$order, $orderItem] = $orderData;
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('VTU Order placement transaction failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unable to process transaction. ' . $e->getMessage(),
            ], 500);
        }

        // Step 2: Send purchase request to FinityPay API (outside database lock)
        try {
            $fpResponse = $this->finityPayService->payBill(
                $serviceCode,
                $packageCode,
                $cleanedPhone,
                $apiAmountNgn   // airtime = chargedNgn (₦1 off), data = full bundle price
            );

            Log::info('FinityPay Bill purchase response', [
                'order_ref' => $order->public_reference,
                'response' => $fpResponse,
            ]);

            $status = $fpResponse['status'] ?? 'error';
            $fpData = $fpResponse['data'] ?? [];

            if ($status === 'success') {
                $providerRef = $fpData['reference'] ?? $fpData['uuid'] ?? ('BIL-' . Str::upper(Str::random(10)));

                $order->update(['status' => 'completed']);
                $orderItem->update([
                    'status' => 'completed',
                    'supplier_order_reference' => $providerRef,
                    'metadata' => array_merge($orderItem->metadata ?? [], [
                        'uuid' => $fpData['uuid'] ?? null,
                        'reference' => $providerRef,
                        'discount_amount' => $fpData['discount_amount'] ?? 0,
                        'charged_amount' => $fpData['charged_amount'] ?? $amountNgn,
                    ]),
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => "Successfully sent {$packageName} to {$cleanedPhone}!",
                    'order' => [
                        'reference' => $order->public_reference,
                        'provider_reference' => $providerRef,
                        'amount' => $sellingPrice,
                        'currency' => $userCurrency,
                        'phone' => $cleanedPhone,
                        'network' => $networkName,
                        'package' => $packageName,
                        'created_at' => $order->created_at->toISOString(),
                    ],
                ]);
            }

            // If pending with provider
            if ($status === 'pending') {
                $providerRef = $fpData['reference'] ?? null;
                $order->update(['status' => 'pending']);
                $orderItem->update([
                    'status' => 'pending',
                    'supplier_order_reference' => $providerRef,
                ]);

                return response()->json([
                    'status' => 'pending',
                    'message' => "Your recharge request has been submitted and is processing with {$networkName}.",
                    'order' => [
                        'reference' => $order->public_reference,
                        'provider_reference' => $providerRef,
                        'amount' => $sellingPrice,
                        'currency' => $userCurrency,
                        'phone' => $cleanedPhone,
                    ],
                ]);
            }

            // If provider returned failure: automatically refund customer's wallet!
            $errorMessage = $fpResponse['message'] ?? 'Provider failed to process recharge.';
            if (!empty($fpResponse['errors']) && is_array($fpResponse['errors'])) {
                $firstError = collect($fpResponse['errors'])->flatten()->first();
                if ($firstError) {
                    $errorMessage = $firstError;
                }
            }
            $this->refundFailedOrder($order, $orderItem, $errorMessage);

            return response()->json([
                'status' => 'error',
                'message' => $errorMessage,
            ], 400);

        } catch (\Exception $e) {
            Log::error('FinityPay Bill exception occurred', [
                'order_ref' => $order->public_reference,
                'exception' => $e->getMessage(),
            ]);

            // Automatic refund on network exception
            $this->refundFailedOrder($order, $orderItem, $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Service provider error. Your wallet has been automatically refunded.',
            ], 500);
        }
    }

    /**
     * Gracefully refund a failed bill order.
     */
    protected function refundFailedOrder(Order $order, OrderItem $orderItem, string $reason): void
    {
        try {
            if ($order->status !== 'refunded' && $order->account) {
                $this->walletService->creditWallet(
                    $order->account,
                    (float) $order->total_amount,
                    $order->currency_code,
                    'service_refund',
                    "Automated Refund for failed order {$order->public_reference}: {$reason}",
                    'RF-' . $order->public_reference
                );
                $order->update(['status' => 'refunded']);
                $orderItem->update(['status' => 'failed']);
            }
        } catch (\Exception $e) {
            Log::error('Failed to refund failed VTU order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
