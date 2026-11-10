<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\PricingRule;
use App\Models\Supplier;
use App\Models\Service;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminPricingController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function index(): Response
    {
        return Inertia::render('admin/settings/pricing', [
            'currencies' => Currency::orderBy('is_default', 'desc')->orderBy('code')->get(),
            'pricingRules' => PricingRule::with(['supplier:id,name', 'service:id,name,category'])
                ->orderBy('id', 'desc')
                ->get(),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'services' => Service::orderBy('name')->get(['id', 'name', 'category']),
        ]);
    }

    public function storeCurrency(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'size:3', 'uppercase', 'unique:currencies,code'],
            'name' => ['required', 'string', 'max:100'],
            'symbol' => ['required', 'string', 'max:10'],
            'rate' => ['required', 'numeric', 'min:0.00000001'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:8'],
            'is_active' => ['required', 'boolean'],
        ]);

        $currency = Currency::create($validated);

        $this->auditLogService->logAdmin(
            'currency_created',
            Currency::class,
            $currency->id,
            $currency->code,
            "Created currency {$currency->code} ({$currency->name}) with rate {$currency->rate}",
            $validated
        );

        return back()->with('success', "Currency {$currency->code} created successfully.");
    }

    public function updateCurrency(Request $request, Currency $currency): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'symbol' => ['sometimes', 'string', 'max:10'],
            'rate' => ['required', 'numeric', 'min:0.00000001'],
            'decimal_places' => ['sometimes', 'integer', 'min:0', 'max:8'],
            'is_active' => ['required', 'boolean'],
        ]);

        $oldRate = $currency->rate;
        $currency->update($validated);

        $this->auditLogService->logAdmin(
            'currency_rate_updated',
            Currency::class,
            $currency->id,
            $currency->code,
            "Updated {$currency->code} rate from {$oldRate} to {$validated['rate']}",
            $validated
        );

        return back()->with('success', "{$currency->code} currency settings updated.");
    }

    public function storePricingRule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'markup_percentage' => ['required', 'numeric', 'min:0', 'max:1000'],
            'fixed_markup' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $rule = PricingRule::create($validated);

        $this->auditLogService->logAdmin(
            'pricing_rule_created',
            PricingRule::class,
            $rule->id,
            $rule->name,
            "Created pricing rule '{$rule->name}' ({$rule->markup_percentage}% + {$rule->fixed_markup})",
            $validated
        );

        return back()->with('success', "Pricing rule '{$rule->name}' created.");
    }

    public function updatePricingRule(Request $request, PricingRule $pricingRule): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'markup_percentage' => ['required', 'numeric', 'min:0', 'max:1000'],
            'fixed_markup' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $pricingRule->update($validated);

        $this->auditLogService->logAdmin(
            'pricing_rule_updated',
            PricingRule::class,
            $pricingRule->id,
            $pricingRule->name,
            "Updated pricing rule '{$pricingRule->name}'",
            $validated
        );

        return back()->with('success', "Pricing rule '{$pricingRule->name}' updated.");
    }

    public function destroyPricingRule(PricingRule $pricingRule): RedirectResponse
    {
        $name = $pricingRule->name;
        $pricingRule->delete();

        $this->auditLogService->logAdmin(
            'pricing_rule_deleted',
            PricingRule::class,
            null,
            $name,
            "Deleted pricing rule '{$name}'"
        );

        return back()->with('success', "Pricing rule '{$name}' deleted.");
    }
}