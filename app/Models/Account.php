<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'user_id',
        'public_reference',
        'available_balance',
        'ledger_balance',
        'total_deposit',
        'status',
    ];

    protected $casts = [
        'available_balance' => 'decimal:4',
        'ledger_balance' => 'decimal:4',
        'total_deposit' => 'decimal:4',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function fundingAccounts(): HasMany
    {
        return $this->hasMany(FundingAccount::class);
    }
}
