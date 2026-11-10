<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $verificationUrl,
        protected int $expiresInMinutes = 60,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify Your Korak Digitals Email Address')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for registering with Korak Digitals. Please click the button below to verify your email address.')
            ->action('Verify Email Address', $this->verificationUrl)
            ->line("This verification link will expire in {$this->expiresInMinutes} minutes.")
            ->line('If you did not create a Korak Digitals account, no further action is required.')
            ->salutation('Best regards, ' . config('app.name', 'Korak Digitals'));
    }
}
