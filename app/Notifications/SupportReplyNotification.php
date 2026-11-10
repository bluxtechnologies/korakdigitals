<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SupportReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected SupportTicket $ticket,
        protected SupportTicketMessage $replyMessage
    ) {
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
        $preview = \Illuminate\Support\Str::limit($this->replyMessage->message, 80);

        return [
            'title' => 'New reply on ticket #' . $this->ticket->id,
            'message' => "Support replied: \"{$preview}\"",
            'category' => 'support',
            'reference' => 'TICKET-' . $this->ticket->id,
            'ticket_id' => $this->ticket->id,
        ];
    }
}
