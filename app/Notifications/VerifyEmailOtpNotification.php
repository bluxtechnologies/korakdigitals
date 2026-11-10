<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $otp,
        protected int $expiresInMinutes,
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
            ->subject('Verify your Korak Digitals email address')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Use the code below to verify your email address and finish setting up your Korak account.')
            ->line(new \Illuminate\Support\HtmlString(
                '<div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;margin:24px 0;">' . $this->otp . '</div>'
            ))
            ->line("This code expires in {$this->expiresInMinutes} minutes.")
            ->line('If you did not create a Korak Digitals account, no further action is required.');
    }
}
