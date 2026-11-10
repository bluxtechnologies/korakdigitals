<?php

namespace App\Services;

use App\Models\User;
use App\Models\TempEmail;
use App\Models\TempEmailMessage;
use Illuminate\Support\Str;

class TempEmailService
{
    /**
     * Generate a new 10-minute temporary email.
     */
    public function generateEmail(User $user): TempEmail
    {
        $domain = 'cipherinbox.com';
        $emailAddr = 'temp_' . strtolower(Str::random(10)) . '@' . $domain;

        return TempEmail::create([
            'user_id' => $user->id,
            'email_address' => $emailAddr,
            'expires_at' => now()->addMinutes(10),
            'status' => 'active',
        ]);
    }

    /**
     * Check/poll inbox messages for temporary email.
     */
    public function checkMessages(TempEmail $tempEmail): array
    {
        // If no messages exist yet, generate sample incoming verification code message
        if ($tempEmail->messages()->count() === 0) {
            $code = (string) rand(100000, 999999);
            TempEmailMessage::create([
                'temp_email_id' => $tempEmail->id,
                'sender' => 'verify@service.com',
                'subject' => "Your Verification Code is {$code}",
                'body_text' => "Your single-use verification code is {$code}. It will expire in 10 minutes.",
                'body_html' => "<p>Your single-use verification code is <strong>{$code}</strong>.</p>",
                'verification_code' => $code,
                'received_at' => now(),
            ]);
        }

        return $tempEmail->messages()->orderBy('id', 'desc')->get()->toArray();
    }
}
