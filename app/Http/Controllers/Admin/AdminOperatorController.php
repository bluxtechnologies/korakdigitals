<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminOperatorController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): Response
    {
        $allowedSorts = ['id', 'name', 'email', 'role', 'status', 'last_login_at', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'name';
        $direction = strtolower($request->query('direction', 'asc')) === 'desc' ? 'desc' : 'asc';

        $admins = Admin::when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('role') && $request->query('role') !== 'all', function ($query) use ($request) {
                $query->where('role', $request->query('role'));
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderBy($sort, $direction)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/admins/index', [
            'administrators' => $admins,
            'currentAdminId' => Auth::guard('admin')->id(),
            'filters' => [
                'search' => $request->query('search', ''),
                'role' => $request->query('role', 'all'),
                'status' => $request->query('status', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:admins,email'],
            'phone' => ['nullable', 'string', 'max:50', 'unique:admins,phone'],
            'role' => ['required', 'string', 'in:super_admin,admin,support_agent'],
            'password' => ['required', 'string', Password::min(8)],
            'status' => ['required', 'string', 'in:active,inactive,suspended'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $admin = Admin::create($validated);

        $this->auditLogService->logAdmin(
            'admin_operator_created',
            Admin::class,
            $admin->id,
            $admin->email,
            "Created new administrator account '{$admin->name}' with role '{$admin->role}'",
            ['role' => $admin->role, 'email' => $admin->email]
        );

        return redirect()->route('admin.administrators.show', $admin->id)
            ->with('success', "Administrator account for '{$admin->name}' created successfully.");
    }

    public function show(Admin $adminUser): Response
    {
        $recentActivity = AuditLog::where('actor_type', 'admin')
            ->where('actor_id', $adminUser->id)
            ->orderBy('id', 'desc')
            ->take(15)
            ->get();

        return Inertia::render('admin/admins/edit', [
            'adminUser' => $adminUser,
            'currentAdminId' => Auth::guard('admin')->id(),
            'recentActivity' => $recentActivity,
        ]);
    }

    public function update(Request $request, Admin $adminUser): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:admins,email,' . $adminUser->id],
            'phone' => ['nullable', 'string', 'max:50', 'unique:admins,phone,' . $adminUser->id],
            'role' => ['required', 'string', 'in:super_admin,admin,support_agent'],
            'status' => ['required', 'string', 'in:active,inactive,suspended'],
            'password' => ['nullable', 'string', Password::min(8)],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $oldRole = $adminUser->role;
        $oldStatus = $adminUser->status;
        $adminUser->update($validated);

        $this->auditLogService->logAdmin(
            'admin_operator_updated',
            Admin::class,
            $adminUser->id,
            $adminUser->email,
            "Updated administrator '{$adminUser->name}' (Role: {$oldRole}->{$adminUser->role}, Status: {$oldStatus}->{$adminUser->status})",
            $validated
        );

        return back()->with('success', "Administrator '{$adminUser->name}' updated successfully.");
    }

    public function toggleStatus(Admin $adminUser): RedirectResponse
    {
        if ($adminUser->id === Auth::guard('admin')->id()) {
            return back()->withErrors(['message' => 'You cannot deactivate your own active session.']);
        }

        $newStatus = $adminUser->status === 'active' ? 'inactive' : 'active';
        $adminUser->update(['status' => $newStatus]);

        $this->auditLogService->logAdmin(
            'admin_status_toggled',
            Admin::class,
            $adminUser->id,
            $adminUser->email,
            "Administrator '{$adminUser->name}' status changed to {$newStatus}",
            ['status' => $newStatus]
        );

        return back()->with('success', "Administrator status changed to {$newStatus}.");
    }

    public function destroy(Admin $adminUser): RedirectResponse
    {
        if ($adminUser->id === Auth::guard('admin')->id()) {
            return back()->withErrors(['message' => 'You cannot delete your own active administrator account.']);
        }

        $adminUser->update(['status' => 'inactive']);

        $this->auditLogService->logAdmin(
            'admin_operator_deactivated',
            Admin::class,
            $adminUser->id,
            $adminUser->email,
            "Administrator '{$adminUser->name}' deactivated to preserve audit integrity.",
            []
        );

        return redirect()->route('admin.administrators')
            ->with('success', "Administrator '{$adminUser->name}' deactivated successfully.");
    }
}