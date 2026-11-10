<?php

namespace App\Domain\Services\Contracts;

use App\Domain\Services\DTOs\OrderRequestDTO;
use App\Domain\Services\DTOs\OrderResultDTO;

interface SupplierDriverInterface
{
    public function placeOrder(OrderRequestDTO $request): OrderResultDTO;

    public function checkStatus(string $externalReference): OrderResultDTO;

    public function cancelOrder(string $externalReference): bool;
}
