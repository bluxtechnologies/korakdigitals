<?php

namespace App\Domain\Services\DTOs;

class OrderResultDTO
{
    public function __construct(
        public string $externalReference,
        public string $status,
        public array $credentialsPayload = [],
        public array $rawPayload = [],
        public bool $isSuccess = true,
        public ?string $errorMessage = null,
    ) {}
}
