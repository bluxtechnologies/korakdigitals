<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Notifications\SupportReplyNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSupportController extends Controller
{
    public function index(Request $request): Response
    {
        $allowedSorts = ['id', 'status', 'created_at', 'updated_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'updated_at';
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $totalTickets = SupportTicket::count();
        $openTickets = SupportTicket::where('status', 'open')->count();
        $resolvedTickets = SupportTicket::where('status', 'resolved')->count();

        $tickets = SupportTicket::with(['user:id,name,email', 'latestMessage'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('messages', function ($mq) use ($search) {
                            $mq->where('message', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderBy($sort, $direction)
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/support/index', [
            'tickets' => $tickets,
            'stats' => [
                'total' => $totalTickets,
                'open' => $openTickets,
                'resolved' => $resolvedTickets,
            ],
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        $ticket->load(['user:id,name,email,created_at', 'messages']);

        return Inertia::render('admin/support/show', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'admin',
            'sender_id' => $admin->id,
            'message' => $validated['message'],
            'attachment_path' => null,
        ]);

        $ticket->touch();

        // Fire notification to user
        if ($ticket->user) {
            $ticket->user->notify(new SupportReplyNotification($ticket, $message));
        }

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'action' => 'support_ticket_reply',
            'target_type' => SupportTicket::class,
            'target_id' => $ticket->id,
            'reference' => 'TICKET-' . $ticket->id,
            'reason' => 'Admin replied to support ticket',
            'metadata' => [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
            ],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Your reply has been sent to the customer.');
    }

    public function updateStatus(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        $validated = $request->validate([
            'status' => ['required', 'in:open,resolved'],
        ]);

        $oldStatus = $ticket->status;
        $ticket->update(['status' => $validated['status']]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'action' => 'support_ticket_status_change',
            'target_type' => SupportTicket::class,
            'target_id' => $ticket->id,
            'reference' => 'TICKET-' . $ticket->id,
            'reason' => "Status changed from {$oldStatus} to {$validated['status']}",
            'metadata' => [
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
            ],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Ticket marked as {$validated['status']}.");
    }

    public function attachment(Request $request, SupportTicket $ticket)
    {
        $firstMessage = $ticket->messages()->whereNotNull('attachment_path')->first();

        if (!$firstMessage || !$firstMessage->attachment_path || !Storage::disk('local')->exists($firstMessage->attachment_path)) {
            abort(404, 'Attachment not found.');
        }

        return Storage::disk('local')->response($firstMessage->attachment_path);
    }
}
