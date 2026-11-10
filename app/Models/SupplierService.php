<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierService extends Model
{
    protected $fillable = [
        'supplier_id',
        'service_id',
        'supplier_sku',
        'supplier_cost',
        'cost_currency_code',
        'is_available',
    ];

    protected $casts = [
        'supplier_cost' => 'decimal:4',
        'is_available' => 'boolean',
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
