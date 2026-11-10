<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceDeskController extends Controller
{
    protected SupplierService $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    public function index(Request $request): Response
    {
        $services = Service::where('is_active', true)->get();

        return Inertia::render('services/index', [
            'services' => $services,
        ]);
    }

    public function placeOrder(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'service_code' => ['required', 'string'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:100'],
            'options' => ['nullable', 'array'],
        ]);

        $user = $request->user();

        try {
            $order = $this->supplierService->placeOrder(
                $user,
                $validated['service_code'],
                $validated['quantity'] ?? 1,
                $validated['options'] ?? []
            );

            $user->notify(new \App\Notifications\OrderPlacedNotification($order));

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Order placed successfully',
                    'order' => $order->load('items'),
                ]);
            }

            return back()->with('success', "Order {$order->public_reference} placed successfully!");
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 400);
            }
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}