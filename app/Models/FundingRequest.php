<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundingRequest extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'funding_account_id',
        'public_reference',
        'provider',
        'amount',
        'currency_code',
        'status',
        'payment_method',
        'sender_name',
        'sender_bank_name',
        'sender_account_number',
        'proof_path',
        'provider_reference',
        'approved_by_admin_id',
        'rejected_by_admin_id',
        'processed_at',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'processed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function fundingAccount(): BelongsTo
    {
        return $this->belongsTo(FundingAccount::class);
    }
}
