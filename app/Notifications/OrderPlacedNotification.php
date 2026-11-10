<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(protected Order $order)
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
            'title' => 'Order placed',
            'message' => "Your order {$this->order->public_reference} for {$this->order->service_category} was placed successfully.",
            'category' => 'order',
            'reference' => $this->order->public_reference,
        ];
    }
}