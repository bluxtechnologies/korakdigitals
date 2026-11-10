<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketMessage extends Model
{
    protected $fillable = [
        'support_ticket_id',
        'sender_type',
        'sender_id',
        'message',
        'attachment_path',
    ];

    protected $appends = [
        'sender_name',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function getSenderNameAttribute(): string
    {
        if ($this->sender_type === 'admin') {
            $admin = Admin::find($this->sender_id);
            return $admin ? $admin->name : 'Support Agent';
        }

        $user = User::find($this->sender_id);
        return $user ? $user->name : 'Customer';
    }
}
