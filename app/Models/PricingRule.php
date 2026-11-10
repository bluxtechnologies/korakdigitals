<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricingRule extends Model
{
    protected $fillable = [
        'supplier_id',
        'service_id',
        'name',
        'markup_percentage',
        'fixed_markup',
        'is_active',
    ];

    protected $casts = [
        'markup_percentage' => 'decimal:2',
        'fixed_markup' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
