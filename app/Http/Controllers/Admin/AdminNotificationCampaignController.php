<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotificationCampaign;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminNotificationCampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');
        $search = $request->query('search', '');

        $query = AdminNotificationCampaign::with('createdBy:id,name,email')
            ->when($status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('title', 'like', "%{$search}%")
                       ->orWhere('body', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc');

        $campaigns = $query->paginate(15)->withQueryString();

        $counts = [
            'all' => AdminNotificationCampaign::count(),
            'draft' => AdminNotificationCampaign::where('status', 'draft')->count(),
            'scheduled' => AdminNotificationCampaign::where('status', 'scheduled')->count(),
            'active' => AdminNotificationCampaign::where('status', 'active')->count(),
            'paused' => AdminNotificationCampaign::where('status', 'paused')->count(),
            'completed' => AdminNotificationCampaign::where('status', 'completed')->count(),
        ];

        return Inertia::render('admin/notifications/index', [
            'campaigns' => $campaigns,
            'counts' => $counts,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['required', 'string', 'in:info,warning,promo,system'],
            'target' => ['required', 'string', 'in:all,verified,custom'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $admin = Auth::guard('admin')->user();

        $campaign = AdminNotificationCampaign::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'type' => $validated['type'],
            'target' => $validated['target'],
            'status' => !empty($validated['scheduled_at']) ? 'scheduled' : 'draft',
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'created_by' => $admin?->id,
            'sent_count' => 0,
        ]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin?->id,
            'action' => 'notification_campaign_created',
            'target_type' => AdminNotificationCampaign::class,
            'target_id' => $campaign->id,
            'reference' => 'CAMP-' . $campaign->id,
            'reason' => "Created notification campaign: {$campaign->title}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('admin.notifications.index')
            ->with('success', "Notification campaign '{$campaign->title}' created successfully.");
    }

    public function show(AdminNotificationCampaign $notification): Response
    {
        $notification->load('createdBy:id,name,email');

        return Inertia::render('admin/notifications/show', [
            'campaign' => $notification,
        ]);
    }

    public function update(Request $request, AdminNotificationCampaign $notification): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['required', 'string', 'in:info,warning,promo,system'],
            'target' => ['required', 'string', 'in:all,verified,custom'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $notification->update($validated);

        return back()->with('success', "Campaign updated successfully.");
    }

    public function activate(Request $request, AdminNotificationCampaign $notification): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        // Calculate audience count
        $recipientCount = match ($notification->target) {
            'verified' => User::whereNotNull('email_verified_at')->count(),
            default => User::count(),
        };

        $notification->update([
            'status' => 'active',
            'sent_count' => $recipientCount,
        ]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin?->id,
            'action' => 'notification_campaign_activated',
            'target_type' => AdminNotificationCampaign::class,
            'target_id' => $notification->id,
            'reference' => 'CAMP-' . $notification->id,
            'reason' => "Activated campaign '{$notification->title}' to {$recipientCount} recipients",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Campaign activated and broadcast to {$recipientCount} accounts.");
    }

    public function pause(Request $request, AdminNotificationCampaign $notification): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        $notification->update(['status' => 'paused']);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin?->id,
            'action' => 'notification_campaign_paused',
            'target_type' => AdminNotificationCampaign::class,
            'target_id' => $notification->id,
            'reference' => 'CAMP-' . $notification->id,
            'reason' => "Paused notification campaign: {$notification->title}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Campaign has been paused.");
    }

    public function destroy(Request $request, AdminNotificationCampaign $notification): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $title = $notification->title;

        $notification->delete();

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin?->id,
            'action' => 'notification_campaign_deleted',
            'target_type' => AdminNotificationCampaign::class,
            'target_id' => $notification->id,
            'reference' => 'CAMP-' . $notification->id,
            'reason' => "Deleted campaign '{$title}'",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('admin.notifications.index')
            ->with('success', "Campaign deleted successfully.");
    }
}
