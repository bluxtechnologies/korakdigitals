<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TempEmailMessage extends Model
{
    protected $fillable = [
        'temp_email_id',
        'sender',
        'subject',
        'body_text',
        'body_html',
        'verification_code',
        'received_at',
    ];

    protected $casts = [
        'received_at' => 'datetime',
    ];

    public function tempEmail(): BelongsTo
    {
        return $this->belongsTo(TempEmail::class);
    }
}
