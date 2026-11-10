<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\Service;
use App\Models\SupplierService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminSupplierController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): Response
    {
        $allowedSorts = ['id', 'name', 'code', 'driver_class', 'is_active', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSorts, true) ? $request->query('sort') : 'name';
        $direction = strtolower($request->query('direction', 'asc')) === 'desc' ? 'desc' : 'asc';

        $suppliers = Supplier::withCount('supplierServices')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->query('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('driver_class', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('is_active', $request->query('status') === 'active');
            })
            ->orderBy($sort, $direction)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/settings/suppliers', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $request->query('search', ''),
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
            'code' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:suppliers,code'],
            'driver_class' => ['required', 'string', 'max:150'],
            'is_active' => ['required', 'boolean'],
            'credentials' => ['nullable', 'array'],
        ]);

        $supplier = Supplier::create($validated);

        $this->auditLogService->logAdmin(
            'supplier_created',
            Supplier::class,
            $supplier->id,
            $supplier->code,
            "Created supplier '{$supplier->name}' ({$supplier->code})",
            $validated
        );

        return redirect()->route('admin.settings.suppliers.show', $supplier->id)
            ->with('success', "Supplier '{$supplier->name}' created successfully.");
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load(['supplierServices.service']);

        $availableServices = Service::where('is_active', true)
            ->whereNotIn('id', $supplier->supplierServices->pluck('service_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'category', 'code']);

        return Inertia::render('admin/settings/supplier-detail', [
            'supplier' => $supplier,
            'availableServices' => $availableServices,
        ]);
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:suppliers,code,' . $supplier->id],
            'driver_class' => ['required', 'string', 'max:150'],
            'is_active' => ['required', 'boolean'],
            'credentials' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ]);

        $supplier->update($validated);

        $this->auditLogService->logAdmin(
            'supplier_updated',
            Supplier::class,
            $supplier->id,
            $supplier->code,
            "Updated supplier details and credentials for '{$supplier->name}'",
            $validated
        );

        return back()->with('success', "Supplier '{$supplier->name}' updated successfully.");
    }

    public function toggleStatus(Supplier $supplier): RedirectResponse
    {
        $supplier->update(['is_active' => ! $supplier->is_active]);

        $state = $supplier->is_active ? 'activated' : 'deactivated';

        $this->auditLogService->logAdmin(
            'supplier_status_toggled',
            Supplier::class,
            $supplier->id,
            $supplier->code,
            "Supplier '{$supplier->name}' {$state}",
            ['is_active' => $supplier->is_active]
        );

        return back()->with('success', "Supplier '{$supplier->name}' {$state}.");
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $hasMappings = $supplier->supplierServices()->exists();
        if ($hasMappings) {
            $supplier->update(['is_active' => false]);

            $this->auditLogService->logAdmin(
                'supplier_deactivated_on_delete_attempt',
                Supplier::class,
                $supplier->id,
                $supplier->code,
                "Supplier '{$supplier->name}' has connected services; deactivated instead of deleting.",
                []
            );

            return back()->with('success', "Supplier has connected services; deactivated instead of deleted to protect order history.");
        }

        $name = $supplier->name;
        $supplier->delete();

        $this->auditLogService->logAdmin(
            'supplier_deleted',
            Supplier::class,
            null,
            $name,
            "Deleted supplier '{$name}'"
        );

        return redirect()->route('admin.settings.suppliers')
            ->with('success', "Supplier '{$name}' deleted successfully.");
    }

    public function storeService(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'supplier_sku' => ['required', 'string', 'max:100'],
            'supplier_cost' => ['required', 'numeric', 'min:0'],
            'cost_currency_code' => ['required', 'string', 'size:3', 'uppercase'],
            'is_available' => ['required', 'boolean'],
        ]);

        $existing = SupplierService::where('supplier_id', $supplier->id)
            ->where('service_id', $validated['service_id'])
            ->first();

        if ($existing) {
            return back()->withErrors(['service_id' => 'This service is already mapped to this supplier.']);
        }

        $supplierService = $supplier->supplierServices()->create($validated);
        $supplierService->load('service');

        $this->auditLogService->logAdmin(
            'supplier_service_mapped',
            SupplierService::class,
            $supplierService->id,
            $supplierService->supplier_sku,
            "Mapped service '{$supplierService->service->name}' to supplier '{$supplier->name}' at {$supplierService->cost_currency_code} {$supplierService->supplier_cost}",
            $validated
        );

        return back()->with('success', "Service mapped to supplier successfully.");
    }

    public function updateService(Request $request, Supplier $supplier, SupplierService $supplierService): RedirectResponse
    {
        if ($supplierService->supplier_id !== $supplier->id) {
            return back()->withErrors(['message' => 'Mapping does not belong to this supplier.']);
        }

        $validated = $request->validate([
            'supplier_sku' => ['required', 'string', 'max:100'],
            'supplier_cost' => ['required', 'numeric', 'min:0'],
            'cost_currency_code' => ['required', 'string', 'size:3', 'uppercase'],
            'is_available' => ['required', 'boolean'],
        ]);

        $supplierService->update($validated);
        $supplierService->load('service');

        $this->auditLogService->logAdmin(
            'supplier_service_updated',
            SupplierService::class,
            $supplierService->id,
            $supplierService->supplier_sku,
            "Updated wholesale cost / SKU for '{$supplierService->service->name}' on supplier '{$supplier->name}'",
            $validated
        );

        return back()->with('success', "Wholesale service pricing updated.");
    }

    public function destroyService(Supplier $supplier, SupplierService $supplierService): RedirectResponse
    {
        if ($supplierService->supplier_id !== $supplier->id) {
            return back()->withErrors(['message' => 'Mapping does not belong to this supplier.']);
        }

        $supplierService->load('service');
        $serviceName = $supplierService->service->name ?? 'Unknown Service';
        $supplierService->delete();

        $this->auditLogService->logAdmin(
            'supplier_service_unmapped',
            SupplierService::class,
            null,
            $supplier->code,
            "Removed wholesale mapping of '{$serviceName}' from supplier '{$supplier->name}'"
        );

        return back()->with('success', "Service mapping removed from supplier.");
    }
}