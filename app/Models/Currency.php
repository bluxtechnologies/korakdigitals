<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'rate',
        'is_default',
        'is_active',
        'decimal_places',
    ];

    protected $casts = [
        'rate' => 'decimal:8',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'decimal_places' => 'integer',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'user_currency_id');
    }
}
