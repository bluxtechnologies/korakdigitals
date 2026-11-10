<?php

namespace App\Services;

use App\Models\PricingRule;

class PricingService
{
    /**
     * Calculate final selling price based on supplier cost and active pricing rules.
     */
    public function calculateSellingPrice(float $supplierCost, ?int $supplierId = null, ?int $serviceId = null): array
    {
        // Find matching pricing rule (specific service/supplier first, fallback to active global)
        $rule = PricingRule::where('is_active', true)
            ->where(function ($q) use ($supplierId, $serviceId) {
                if ($serviceId) {
                    $q->where('service_id', $serviceId);
                }
                if ($supplierId) {
                    $q->orWhere('supplier_id', $supplierId);
                }
            })
            ->orderBy('id', 'desc')
            ->first();

        $markupPercentage = $rule ? (float) $rule->markup_percentage : 20.00; // 20% fallback default
        $fixedMarkup = $rule ? (float) $rule->fixed_markup : 0.00;

        $calculatedMarkup = ($supplierCost * ($markupPercentage / 100)) + $fixedMarkup;
        $unitSellingPrice = round($supplierCost + $calculatedMarkup, 2);

        return [
            'supplier_cost' => $supplierCost,
            'markup_percentage' => $markupPercentage,
            'fixed_markup' => $fixedMarkup,
            'unit_selling_price' => $unitSellingPrice,
        ];
    }
}
