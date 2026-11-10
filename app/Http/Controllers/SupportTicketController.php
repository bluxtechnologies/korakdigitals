<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->with(['latestMessage'])
            ->orderBy('updated_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('support', [
            'tickets' => $tickets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'image', 'max:5120'], // 5MB max, image only
        ]);

        $user = Auth::user();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('support_attachments', 'local');
        }

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'status' => 'open',
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $user->id,
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
        ]);

        return redirect()->route('user.support.show', $ticket->id)
            ->with('success', "Support ticket #{$ticket->id} created successfully. Our team will review it shortly.");
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        $user = Auth::user();

        if ($ticket->user_id !== $user->id) {
            abort(403, 'Unauthorized access to support ticket.');
        }

        $ticket->load(['messages']);

        return Inertia::render('support-thread', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $user = Auth::user();

        if ($ticket->user_id !== $user->id) {
            abort(403, 'Unauthorized access to support ticket.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $user->id,
            'message' => $validated['message'],
            'attachment_path' => null, // Only initial message gets attachment
        ]);

        // If ticket was marked resolved, user replying reopens it
        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        } else {
            $ticket->touch();
        }

        return back()->with('success', 'Your reply has been sent.');
    }

    public function attachment(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();

        if ($ticket->user_id !== $user->id) {
            abort(403, 'Unauthorized access to attachment.');
        }

        $firstMessage = $ticket->messages()->whereNotNull('attachment_path')->first();

        if (!$firstMessage || !$firstMessage->attachment_path || !Storage::disk('local')->exists($firstMessage->attachment_path)) {
            abort(404, 'Attachment not found.');
        }

        return Storage::disk('local')->response($firstMessage->attachment_path);
    }
}
