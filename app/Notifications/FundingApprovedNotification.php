<?php

namespace App\Notifications;

use App\Models\FundingRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FundingApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(protected FundingRequest $fundingRequest)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Wallet funded',
            'message' => "Your deposit of {$this->fundingRequest->currency_code} {$this->fundingRequest->amount} was approved and credited to your wallet.",
            'category' => 'wallet',
            'reference' => $this->fundingRequest->provider_reference,
        ];
    }
}