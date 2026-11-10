<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\OrderItem;
use App\Models\Supplier;
use App\Models\SupplierService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminServiceController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): Response
    {
        $allowedSorts = ['id', 'name', 'code', 'category', 'is_active', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'name';
        $direction = strtolower($request->query('direction', 'asc')) === 'desc' ? 'desc' : 'asc';

        $services = Service::withCount('supplierServices')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category') && $request->query('category') !== 'all', function ($query) use ($request) {
                $query->where('category', $request->query('category'));
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('is_active', $request->query('status') === 'active');
            })
            ->orderBy($sort, $direction)
            ->paginate(25)
            ->withQueryString();

        $categoryCounts = [
            'all' => Service::count(),
            'numbers' => Service::where('category', 'numbers')->count(),
            'growth' => Service::where('category', 'growth')->count(),
            'vpn' => Service::where('category', 'vpn')->count(),
            'esim' => Service::where('category', 'esim')->count(),
            'airtime' => Service::where('category', 'airtime')->count(),
            'accounts' => Service::where('category', 'accounts')->count(),
        ];

        return Inertia::render('admin/services/index', [
            'services' => $services,
            'categoryCounts' => $categoryCounts,
            'filters' => [
                'search' => $request->query('search', ''),
                'category' => $request->query('category', 'all'),
                'status' => $request->query('status', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:numbers,growth,vpn,esim,airtime,accounts'],
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:80', 'alpha_dash', 'unique:services,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        $service = Service::create($validated);

        $this->auditLogService->logAdmin(
            'service_created',
            Service::class,
            $service->id,
            $service->code,
            "Created service '{$service->name}' in category {$service->category}",
            $validated
        );

        return redirect()->route('admin.services.show', $service->id)
            ->with('success', "Service '{$service->name}' created successfully.");
    }

    public function show(Service $service): Response
    {
        $service->load(['supplierServices.supplier']);

        $allSuppliers = Supplier::where('is_active', true)
            ->whereNotIn('id', $service->supplierServices->pluck('supplier_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $totalOrdersCount = OrderItem::where('service_id', $service->id)->count();

        return Inertia::render('admin/services/edit', [
            'service' => $service,
            'availableSuppliers' => $allSuppliers,
            'stats' => [
                'totalOrders' => $totalOrdersCount,
                'activeSuppliers' => $service->supplierServices->where('is_available', true)->count(),
            ],
        ]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:numbers,growth,vpn,esim,airtime,accounts'],
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:80', 'alpha_dash', 'unique:services,code,' . $service->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        $service->update($validated);

        $this->auditLogService->logAdmin(
            'service_updated',
            Service::class,
            $service->id,
            $service->code,
            "Updated service '{$service->name}'",
            $validated
        );

        return back()->with('success', "Service '{$service->name}' updated successfully.");
    }

    public function toggleStatus(Service $service): RedirectResponse
    {
        $service->update(['is_active' => ! $service->is_active]);

        $state = $service->is_active ? 'activated' : 'deactivated';

        $this->auditLogService->logAdmin(
            'service_status_toggled',
            Service::class,
            $service->id,
            $service->code,
            "Service '{$service->name}' {$state}",
            ['is_active' => $service->is_active]
        );

        return back()->with('success', "Service '{$service->name}' {$state}.");
    }

    public function destroy(Service $service): RedirectResponse
    {
        $hasOrders = OrderItem::where('service_id', $service->id)->exists();
        if ($hasOrders) {
            $service->update(['is_active' => false]);

            $this->auditLogService->logAdmin(
                'service_deactivated_on_delete_attempt',
                Service::class,
                $service->id,
                $service->code,
                "Service '{$service->name}' has existing customer orders; deactivated instead of deleted.",
                []
            );

            return back()->with('success', "Service has historical customer orders; deactivated instead of deleted to protect order audit history.");
        }

        $name = $service->name;
        $service->delete();

        $this->auditLogService->logAdmin(
            'service_deleted',
            Service::class,
            null,
            $name,
            "Deleted service '{$name}'"
        );

        return redirect()->route('admin.services')
            ->with('success', "Service '{$name}' deleted successfully.");
    }
}