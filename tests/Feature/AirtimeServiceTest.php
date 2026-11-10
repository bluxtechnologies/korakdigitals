<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Account;
use App\Models\Currency;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AirtimeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_airtime_purchase_page()
    {
        $currency = Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $user = User::factory()->create([
            'user_currency_id' => $currency->id,
        ]);

        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-AIRTIME-100',
            'available_balance' => 25000.00,
            'ledger_balance' => 25000.00,
            'total_deposit' => 25000.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/user/services/airtime');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('services/airtime')
            ->has('networks', 4)
            ->where('networks.0.id', 'mtn')
            ->where('networks.1.id', 'airtel')
            ->where('networks.2.id', 'glo')
            ->where('networks.3.id', '9mobile')
        );
    }
}
