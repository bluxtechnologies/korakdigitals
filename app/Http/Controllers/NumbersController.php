<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Services\PricingService;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class NumbersController extends Controller
{
    protected SupplierService $supplierService;
    protected PricingService $pricingService;

    public function __construct(SupplierService $supplierService, PricingService $pricingService)
    {
        $this->supplierService = $supplierService;
        $this->pricingService = $pricingService;
    }

    /**
     * Display the Virtual Numbers desk (Quick Activation tab active, Rent tab slot).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Fetch active & recent number orders from database
        $activeOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->where('service_category', 'numbers')
            ->orderBy('id', 'desc')
            ->take(25)
            ->get();

        // Popular country defaults with HeroSMS country IDs
        $popularCountries = [
            ['id' => 187, 'name' => 'United States', 'code' => 'US', 'flag' => '🇺🇸', 'dialCode' => '+1'],
            ['id' => 16,  'name' => 'United Kingdom', 'code' => 'GB', 'flag' => '🇬🇧', 'dialCode' => '+44'],
            ['id' => 6,   'name' => 'Indonesia',      'code' => 'ID', 'flag' => '🇮🇩', 'dialCode' => '+62'],
            ['id' => 36,  'name' => 'Canada',         'code' => 'CA', 'flag' => '🇨🇦', 'dialCode' => '+1'],
            ['id' => 43,  'name' => 'Germany',        'code' => 'DE', 'flag' => '🇩🇪', 'dialCode' => '+49'],
            ['id' => 78,  'name' => 'France',         'code' => 'FR', 'flag' => '🇫🇷', 'dialCode' => '+33'],
        ];

        // Popular service codes with display metadata
        $popularServices = [
            ['code' => 'tg', 'name' => 'Telegram', 'icon' => 'send', 'description' => 'Receive OTP for Telegram login'],
            ['code' => 'wa', 'name' => 'WhatsApp', 'icon' => 'message-circle', 'description' => 'Receive OTP for WhatsApp / Business'],
            ['code' => 'ig', 'name' => 'Instagram', 'icon' => 'camera', 'description' => 'Instagram account verification'],
            ['code' => 'go', 'name' => 'Google / Gmail', 'icon' => 'mail', 'description' => 'Google, YouTube, Gmail verification'],
            ['code' => 'oi', 'name' => 'OpenAI / ChatGPT', 'icon' => 'cpu', 'description' => 'OpenAI, ChatGPT, Claude accounts'],
            ['code' => 'vi', 'name' => 'Viber', 'icon' => 'phone-call', 'description' => 'Viber messenger activation'],
        ];

        // Currency info for pricing
        $currencyCode = $user->currency ? $user->currency->code : 'NGN';
        $exchangeRate = $user->currency ? (float) $user->currency->rate : 1500.0;

        // Fetch initial offers and pre-calculate user prices
        $rawOffers = $this->supplierService->getSmsDriver()->getOffers('sms');
        $initialCatalog = $this->formatOffersForCurrency($rawOffers, $currencyCode, $exchangeRate);

        return Inertia::render('numbers', [
            'activeOrders' => $activeOrders,
            'popularCountries' => $popularCountries,
            'popularServices' => $popularServices,
            'initialCatalog' => $initialCatalog,
            'walletBalance' => (float) ($user->account?->available_balance ?? 0),
            'userCurrency' => $currencyCode,
        ]);
    }

    /**
     * Display the Rent Numbers desk (multi-day extended access).
     */
    public function rentIndex(Request $request): Response
    {
        $user = $request->user();

        // Fetch rented number orders (with duration/rental metadata)
        $rentedOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->where('service_category', 'numbers')
            ->whereNotNull('metadata->duration')
            ->orderBy('id', 'desc')
            ->get();

        $currencyCode = $user->currency ? $user->currency->code : 'NGN';
        $exchangeRate = $user->currency ? (float) $user->currency->rate : 1500.0;

        return Inertia::render('numbers-rent', [
            'rentedOrders' => $rentedOrders,
            'walletBalance' => (float) ($user->account?->available_balance ?? 0),
            'userCurrency' => $currencyCode,
            'exchangeRate' => $exchangeRate,
        ]);
    }

    /**
     * Get live dynamic offers catalog with prices converted to user currency.
     */
    public function offers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currencyCode = $user->currency ? $user->currency->code : 'NGN';
        $exchangeRate = $user->currency ? (float) $user->currency->rate : 1500.0;

        $rawOffers = $this->supplierService->getSmsDriver()->getOffers('sms');
        $catalog = $this->formatOffersForCurrency($rawOffers, $currencyCode, $exchangeRate);

        return response()->json([
            'catalog' => $catalog,
            'currency' => $currencyCode,
            'rate' => $exchangeRate,
        ]);
    }

    /**
     * Purchase a virtual phone number.
     */
    public function purchase(Request $request): RedirectResponse
    {
        $request->validate([
            'service_code' => ['required', 'string', 'max:20'],
            'service_name' => ['required', 'string', 'max:100'],
            'country_id' => ['required', 'integer'],
            'country_name' => ['required', 'string', 'max:100'],
            'cost_usd' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();

        return redirect()->back()->withErrors([
            'purchase' => 'Virtual Numbers service is currently deactivated.',
        ]);
    }

    /**
     * Poll latest OTP status for an order item.
     */
    public function status(Request $request, int $orderItemId): JsonResponse
    {
        try {
            $result = $this->supplierService->checkNumberStatus($request->user(), $orderItemId);
            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Cancel number and refund wallet.
     */
    public function cancel(Request $request, int $orderItemId): JsonResponse|RedirectResponse
    {
        try {
            $result = $this->supplierService->cancelNumberOrder($request->user(), $orderItemId);

            if ($request->wantsJson()) {
                return response()->json($result);
            }
            return redirect()->back()->with('success', $result['message']);
        } catch (\Throwable $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 422);
            }
            return redirect()->back()->withErrors(['cancel' => $e->getMessage()]);
        }
    }

    /**
     * Mark number activation as completed.
     */
    public function finish(Request $request, int $orderItemId): JsonResponse|RedirectResponse
    {
        try {
            $result = $this->supplierService->finishNumberOrder($request->user(), $orderItemId);

            if ($request->wantsJson()) {
                return response()->json($result);
            }
            return redirect()->back()->with('success', $result['message']);
        } catch (\Throwable $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 422);
            }
            return redirect()->back()->withErrors(['finish' => $e->getMessage()]);
        }
    }

    /**
     * Incoming SMS webhook callback from SMS provider.
     */
    public function webhook(Request $request, string $token): JsonResponse
    {
        $expectedSecret = config('services.sms_activation.webhook_secret');
        if (empty($expectedSecret) || !hash_equals($expectedSecret, $token)) {
            Log::warning('Unauthorized numbers webhook attempt', ['token' => $token]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $activationId = $request->input('activationId') ?? $request->input('id');
        $code = $request->input('code');
        $text = $request->input('text');

        if (!$activationId) {
            return response()->json(['error' => 'Missing activationId'], 422);
        }

        // Validate that this activation belongs to an active Cipher order
        $item = OrderItem::where('supplier_order_reference', (string) $activationId)
            ->orWhere('credentials_payload->activation_id', (string) $activationId)
            ->first();

        if (!$item) {
            Log::info("Webhook received for unknown or external activationId: {$activationId}");
            return response()->json(['status' => 'ignored', 'message' => 'Activation not found'], 200);
        }

        $payload = $item->credentials_payload ?? [];
        $payload['sms_code'] = $code;
        $payload['sms_text'] = $text;
        $payload['status'] = 'STATUS_OK';
        $payload['received_at'] = now()->toIso8601String();

        $item->credentials_payload = $payload;
        $item->status = 'completed';
        $item->save();

        if ($item->order) {
            $item->order->status = 'completed';
            $item->order->save();
        }

        Log::info("Successfully processed SMS webhook for activation {$activationId}, code: {$code}");

        return response()->json(['status' => 'ok']);
    }

    /**
     * Format raw HeroSMS offers matrix with PricingService markup and currency rates.
     */
    protected function formatOffersForCurrency(array $rawOffers, string $currencyCode, float $exchangeRate): array
    {
        $formatted = [];

        foreach ($rawOffers as $serviceCode => $countries) {
            if (!is_array($countries)) {
                continue;
            }

            $formatted[$serviceCode] = [];

            foreach ($countries as $countryId => $data) {
                $baseUsd = (float) ($data['prices']['default'] ?? $data['prices']['retail'] ?? 1.50);
                $pricing = $this->pricingService->calculateSellingPrice($baseUsd);
                $sellingUsd = $pricing['unit_selling_price'];

                $userPrice = ($currencyCode === 'NGN')
                    ? round($sellingUsd * $exchangeRate, 2)
                    : round($sellingUsd, 2);

                $formatted[$serviceCode][$countryId] = [
                    'cost_usd' => $baseUsd,
                    'price' => $userPrice,
                    'total_count' => (int) ($data['counts']['total'] ?? 0),
                ];
            }
        }

        return $formatted;
    }
}
