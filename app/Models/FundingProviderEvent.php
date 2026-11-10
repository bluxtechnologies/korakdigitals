<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundingProviderEvent extends Model
{
    protected $fillable = [
        'provider',
        'event_reference',
        'event_type',
        'payload',
        'status',
        'funding_request_id',
        'processed_at',
        'failure_reason',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function fundingRequest(): BelongsTo
    {
        return $this->belongsTo(FundingRequest::class);
    }
}
