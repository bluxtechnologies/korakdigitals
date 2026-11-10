<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'profile_pic',
        'user_currency_id',
        'status',
        'finitypay_customer_uuid',
        'email_verified_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_otp',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_otp_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'user_currency_id');
    }

    public function account(): HasOne
    {
        return $this->hasOne(Account::class);
    }

    public function fundingAccounts(): HasMany
    {
        return $this->hasMany(FundingAccount::class);
    }

    public function fundingRequests(): HasMany
    {
        return $this->hasMany(FundingRequest::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function tempEmails(): HasMany
    {
        return $this->hasMany(TempEmail::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }
}