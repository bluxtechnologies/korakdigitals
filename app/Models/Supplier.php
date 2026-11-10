<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'code',
        'driver_class',
        'is_active',
        'credentials',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'credentials' => 'array',
        'metadata' => 'array',
    ];

    public function supplierServices(): HasMany
    {
        return $this->hasMany(SupplierService::class);
    }
}
