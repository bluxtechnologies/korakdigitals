<?php

use App\Models\Account;
use App\Models\Currency;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->currency = Currency::create([
        'name' => 'Nigerian Naira',
        'code' => 'NGN',
        'symbol' => '₦',
        'rate' => 1500.0,
        'is_default' => true,
    ]);

    $this->user = User::factory()->create([
        'user_currency_id' => $this->currency->id,
    ]);

    $this->account = Account::create([
        'user_id' => $this->user->id,
        'public_reference' => 'ACC-TEST-NUMBERS',
        'available_balance' => 50000.00,
        'ledger_balance' => 50000.00,
        'total_deposit' => 50000.00,
        'status' => 'active',
    ]);

    $this->supplier = Supplier::create([
        'code' => 'mock_provider',
        'name' => 'Cipher Supplier',
        'driver_class' => 'App\\Domain\\Services\\Drivers\\SmsActivationDriver',
        'is_active' => true,
    ]);
});

test('user can access the numbers desk page and receive dynamic initial catalog', function () {
    $response = $this->actingAs($this->user)->get(route('user.numbers'));

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->component('numbers')
        ->has('popularCountries')
        ->has('popularServices')
        ->has('initialCatalog')
        ->has('activeOrders')
    );
});

test('user can access the rent numbers desk page as a dedicated separate page', function () {
    $response = $this->actingAs($this->user)->get(route('user.numbers.rent'));

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->component('numbers-rent')
        ->has('rentedOrders')
        ->has('walletBalance')
        ->has('userCurrency')
    );
});

test('user can fetch dynamic offers via api', function () {
    $response = $this->actingAs($this->user)->getJson(route('user.numbers.offers'));

    $response->assertOk();
    $response->assertJsonStructure(['catalog', 'currency', 'rate']);
});

test('user can purchase a quick activation number and wallet is debited', function () {
    $initialBalance = (float) $this->account->fresh()->available_balance;

    $response = $this->actingAs($this->user)->post(route('user.numbers.purchase'), [
        'service_code' => 'tg',
        'service_name' => 'Telegram',
        'country_id' => 187,
        'country_name' => 'United States',
        'cost_usd' => 1.50,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verify order and item created in DB
    $order = Order::where('user_id', $this->user->id)
        ->where('service_category', 'numbers')
        ->first();

    expect($order)->not->toBeNull();
    expect($order->status)->toBe('active');

    $item = $order->items->first();
    expect($item)->not->toBeNull();
    expect($item->credentials_payload)->toHaveKeys(['phone_number', 'activation_id', 'status', 'expires_at']);
    expect($item->credentials_payload['service_code'])->toBe('tg');

    // Verify wallet was debited
    $newBalance = (float) $this->account->fresh()->available_balance;
    expect($newBalance)->toBeLessThan($initialBalance);
});

test('user can cancel an active number and receive a refund', function () {
    $this->actingAs($this->user)->post(route('user.numbers.purchase'), [
        'service_code' => 'tg',
        'service_name' => 'Telegram',
        'country_id' => 187,
        'country_name' => 'United States',
        'cost_usd' => 1.50,
    ]);

    $order = Order::where('user_id', $this->user->id)->first();
    $item = $order->items->first();
    $balanceAfterPurchase = (float) $this->account->fresh()->available_balance;

    $cancelResponse = $this->actingAs($this->user)->post(route('user.numbers.cancel', ['orderItemId' => $item->id]));
    $cancelResponse->assertSessionHasNoErrors();

    // Verify status updated to cancelled
    expect($item->fresh()->status)->toBe('cancelled');
    expect($order->fresh()->status)->toBe('cancelled');

    // Verify wallet was refunded
    $balanceAfterRefund = (float) $this->account->fresh()->available_balance;
    expect($balanceAfterRefund)->toBeGreaterThan($balanceAfterPurchase);
});

test('sms webhook delivers incoming OTP and marks activation completed', function () {
    $this->actingAs($this->user)->post(route('user.numbers.purchase'), [
        'service_code' => 'tg',
        'service_name' => 'Telegram',
        'country_id' => 187,
        'country_name' => 'United States',
        'cost_usd' => 1.50,
    ]);

    $order = Order::where('user_id', $this->user->id)->first();
    $item = $order->items->first();
    $activationId = $item->supplier_order_reference;

    $webhookSecret = config('services.sms_activation.webhook_secret');

    $webhookResponse = $this->postJson(route('webhooks.numbers', ['token' => $webhookSecret]), [
        'activationId' => $activationId,
        'code' => '482910',
        'text' => 'Your Telegram code is: 482910',
    ]);

    $webhookResponse->assertOk();

    $refreshedItem = $item->fresh();
    expect($refreshedItem->status)->toBe('completed');
    expect($refreshedItem->credentials_payload['sms_code'])->toBe('482910');
    expect($refreshedItem->credentials_payload['sms_text'])->toBe('Your Telegram code is: 482910');
});
