<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminNotificationCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'type',
        'target',
        'status',
        'scheduled_at',
        'sent_count',
        'created_by',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'metadata' => 'array',
        'sent_count' => 'integer',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
