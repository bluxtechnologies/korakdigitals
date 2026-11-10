<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\VerifyEmailLinkNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class EmailVerificationService
{
    protected const EXPIRES_IN_MINUTES = 60;
    protected const RESEND_COOLDOWN_SECONDS = 60;

    public function sendVerificationLink(User $user): void
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(self::EXPIRES_IN_MINUTES),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $user->forceFill([
            'email_verification_otp_expires_at' => Carbon::now()->addMinutes(self::EXPIRES_IN_MINUTES),
        ])->save();

        $user->notify(new VerifyEmailLinkNotification($verificationUrl, self::EXPIRES_IN_MINUTES));
    }

    public function verifyLink(User $user, string $hash): bool
    {
        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return false;
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return true;
    }

    public function secondsUntilResendAllowed(User $user): int
    {
        if ($user->email_verification_otp_expires_at === null) {
            return 0;
        }

        $sentAt = $user->email_verification_otp_expires_at->copy()->subMinutes(self::EXPIRES_IN_MINUTES);
        $availableAt = $sentAt->addSeconds(self::RESEND_COOLDOWN_SECONDS);

        return max(0, (int) Carbon::now()->diffInSeconds($availableAt, false));
    }
}