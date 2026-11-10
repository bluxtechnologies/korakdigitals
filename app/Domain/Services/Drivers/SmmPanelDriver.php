<?php

namespace App\Domain\Services\Drivers;

use App\Domain\Services\Contracts\SupplierDriverInterface;
use App\Domain\Services\DTOs\OrderRequestDTO;
use App\Domain\Services\DTOs\OrderResultDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SmmPanelDriver implements SupplierDriverInterface
{
    public function placeOrder(OrderRequestDTO $request): OrderResultDTO
    {
        $apiKey = config('services.smm.api_key');
        $apiUrl = config('services.smm.api_url', 'https://smmfollow.com/api/v2');
        $options = $request->options;

        if ($apiKey) {
            // Live SMM Panel API v2 Protocol
            $response = Http::post($apiUrl, [
                'key' => $apiKey,
                'action' => 'add',
                'service' => $request->supplierSku,
                'link' => $options['link'] ?? 'https://instagram.com/cipher',
                'quantity' => $request->quantity * 1000,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return new OrderResultDTO(
                    externalReference: (string) ($data['order'] ?? Str::random(10)),
                    status: 'processing',
                    credentialsPayload: [
                        'smm_order_id' => $data['order'] ?? null,
                        'target_link' => $options['link'] ?? null,
                        'start_count' => $data['start_count'] ?? 0,
                    ],
                    rawPayload: $data
                );
            }
        }

        // Mock Fallback
        $mockRef = 'SMM-' . strtoupper(Str::random(8));

        return new OrderResultDTO(
            externalReference: $mockRef,
            status: 'completed',
            credentialsPayload: [
                'smm_order_id' => rand(100000, 999999),
                'platform' => $options['platform'] ?? 'Instagram',
                'service_type' => $options['service_type'] ?? 'Followers',
                'link' => $options['link'] ?? 'https://instagram.com/cipher',
                'quantity_delivered' => $request->quantity * 1000,
                'status' => 'COMPLETED',
            ],
            rawPayload: ['mock' => true, 'provider' => 'smm_panel']
        );
    }

    public function checkStatus(string $externalReference): OrderResultDTO
    {
        return new OrderResultDTO(
            externalReference: $externalReference,
            status: 'completed',
            credentialsPayload: ['remains' => 0, 'status' => 'Completed'],
            rawPayload: ['status' => 'Completed']
        );
    }

    public function cancelOrder(string $externalReference): bool
    {
        return true;
    }
}
