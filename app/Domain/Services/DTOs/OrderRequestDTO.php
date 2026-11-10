<?php

namespace App\Domain\Services\DTOs;

class OrderRequestDTO
{
    public function __construct(
        public string $supplierSku,
        public int $quantity = 1,
        public array $options = [],
        public ?float $amount = null,
        public ?int $userId = null,
    ) {}
}
