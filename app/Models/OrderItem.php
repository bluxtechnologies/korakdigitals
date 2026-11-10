<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'service_id',
        'supplier_id',
        'item_title',
        'quantity',
        'supplier_cost',
        'markup_percentage',
        'unit_selling_price',
        'subtotal',
        'currency_code',
        'supplier_order_reference',
        'status',
        'credentials_payload',
        'metadata',
    ];

    protected $casts = [
        'supplier_cost' => 'decimal:4',
        'markup_percentage' => 'decimal:2',
        'unit_selling_price' => 'decimal:4',
        'subtotal' => 'decimal:4',
        'credentials_payload' => 'array',
        'metadata' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
