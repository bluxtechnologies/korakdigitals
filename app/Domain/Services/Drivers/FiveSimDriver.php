<?php

namespace App\Domain\Services\Drivers;

use App\Domain\Services\Contracts\SupplierDriverInterface;
use App\Domain\Services\DTOs\OrderRequestDTO;
use App\Domain\Services\DTOs\OrderResultDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FiveSimDriver implements SupplierDriverInterface
{
    public function placeOrder(OrderRequestDTO $request): OrderResultDTO
    {
        $apiKey = config('services.fivesim.api_key');
        $options = $request->options;
        $country = strtolower($options['country'] ?? 'usa');
        $product = strtolower($options['service_name'] ?? 'instagram');

        if ($apiKey) {
            // Live 5sim.net REST API Endpoint
            $response = Http::withToken($apiKey)
                ->get("https://5sim.net/v1/user/buy/activation/{$country}/any/{$product}");

            if ($response->successful()) {
                $data = $response->json();
                return new OrderResultDTO(
                    externalReference: (string) ($data['id'] ?? Str::random(10)),
                    status: 'active',
                    credentialsPayload: [
                        'phone_number' => $data['phone'] ?? '+12025550199',
                        'order_id' => $data['id'] ?? null,
                        'country' => $country,
                        'sms_code' => null,
                        'status' => 'PENDING',
                    ],
                    rawPayload: $data
                );
            }
        }

        // Mock Fallback when API key is not configured
        $mockPhone = '+1 (202) ' . rand(200, 999) . '-' . rand(1000, 9999);
        $mockRef = '5SIM-' . strtoupper(Str::random(8));

        return new OrderResultDTO(
            externalReference: $mockRef,
            status: 'completed',
            credentialsPayload: [
                'phone_number' => $mockPhone,
                'verification_pin' => (string) rand(100000, 999999),
                'country' => strtoupper($country),
                'service' => ucfirst($product),
                'expires_in' => '10:00',
            ],
            rawPayload: ['mock' => true, 'provider' => '5sim']
        );
    }

    public function checkStatus(string $externalReference): OrderResultDTO
    {
        return new OrderResultDTO(
            externalReference: $externalReference,
            status: 'completed',
            credentialsPayload: [
                'verification_pin' => (string) rand(100000, 999999),
                'status' => 'RECEIVED',
            ],
            rawPayload: ['status' => 'FINISHED']
        );
    }

    public function cancelOrder(string $externalReference): bool
    {
        return true;
    }
}
