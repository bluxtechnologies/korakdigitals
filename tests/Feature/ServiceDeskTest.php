<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Account;
use App\Models\Currency;
use App\Models\Supplier;
use App\Models\Service;
use App\Models\SupplierService;
use App\Models\PricingRule;
use App\Services\SupplierService as ServiceDeskSupplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceDeskTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $ngn = Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $mockSupplier = Supplier::create([
            'name' => 'Mock Supplier',
            'code' => 'mock_provider',
            'driver_class' => 'App\\Domain\\Services\\Drivers\\MockSupplierDriver',
            'is_active' => true,
        ]);

        $service = Service::create([
            'category' => 'numbers',
            'name' => 'Instagram Verification Number',
            'code' => 'num_instagram',
            'is_active' => true,
        ]);

        SupplierService::create([
            'supplier_id' => $mockSupplier->id,
            'service_id' => $service->id,
            'supplier_sku' => 'SKU_INSTAGRAM',
            'supplier_cost' => 2.00, // $2.00
            'cost_currency_code' => 'USD',
            'is_available' => true,
        ]);

        PricingRule::create([
            'name' => 'Default 20% Markup',
            'markup_percentage' => 20.00,
            'fixed_markup' => 0.00,
            'is_active' => true,
        ]);
    }

    public function test_user_can_place_order_and_receives_credentials_payload(): void
    {
        $ngn = Currency::where('code', 'NGN')->first();

        $user = User::factory()->create(['user_currency_id' => $ngn->id]);
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-SD100',
            'available_balance' => 50000.00,
            'ledger_balance' => 50000.00,
            'total_deposit' => 50000.00,
            'status' => 'active',
        ]);

        $supplierService = app(ServiceDeskSupplier::class);

        $order = $supplierService->placeOrder($user, 'num_instagram', 1, ['country' => 'US']);

        $this->assertEquals('active', $order->status);
        $this->assertDatabaseHas('orders', ['public_reference' => $order->public_reference]);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'item_title' => 'Instagram Verification Number']);

        $account->refresh();
        $this->assertLessThan(50000.00, $account->available_balance);
    }

    public function test_authenticated_user_can_access_services_hub(): void
    {
        $ngn = Currency::where('code', 'NGN')->first();
        $user = User::factory()->create(['user_currency_id' => $ngn->id]);
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-SERVICES',
            'available_balance' => 5000.00,
            'ledger_balance' => 5000.00,
            'total_deposit' => 5000.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/user/services');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('services/index')
            ->has('services')
        );
    }
}
