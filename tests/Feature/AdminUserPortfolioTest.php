<?php

use App\Models\Admin;
use App\Models\User;
use App\Models\Account;
use App\Models\ApiKey;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createAdmin() {
    return Admin::create([
        'name' => 'Super Admin',
        'email' => 'admin_' . uniqid() . '@cipher.com',
        'password' => bcrypt('admin123'),
        'role' => 'super_admin',
        'is_active' => true,
    ]);
}

function createAccountForUser($userId) {
    return Account::create([
        'user_id' => $userId,
        'public_reference' => 'ACC-TEST-' . uniqid(),
        'available_balance' => 1000.00,
        'ledger_balance' => 1000.00,
        'total_deposit' => 1000.00,
        'status' => 'active',
    ]);
}

test('admin can access nested user portfolio overview page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    createAccountForUser($user->id);

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}");

    $response->assertStatus(200);
});

test('admin can access nested user wallet page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    createAccountForUser($user->id);

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}/wallet");

    $response->assertStatus(200);
});

test('admin can access nested user orders page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}/orders");

    $response->assertStatus(200);
});

test('admin can access nested user funding page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}/funding");

    $response->assertStatus(200);
});

test('admin can access nested user temp emails page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}/temp-emails");

    $response->assertStatus(200);
});

test('admin can access nested user api keys page and revoke key', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $apiKey = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Default Test Key',
        'key_prefix' => 'cipher_live_1234',
        'secret_hash' => hash('sha256', 'secret'),
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin, 'admin')->get("/admin/users/{$user->id}/api-keys");
    $response->assertStatus(200);

    $revokeResponse = $this->actingAs($admin, 'admin')->post("/admin/users/{$user->id}/api-keys/{$apiKey->id}/revoke");
    $revokeResponse->assertRedirect();
    $this->assertDatabaseHas('api_keys', ['id' => $apiKey->id, 'is_active' => false]);
});

test('admin can update user profile details under portfolio edit page', function () {
    $admin = createAdmin();
    $user = User::factory()->create(['name' => 'Old Name', 'status' => 'active']);
    createAccountForUser($user->id);

    $response = $this->actingAs($admin, 'admin')->put("/admin/users/{$user->id}", [
        'name' => 'New Updated Name',
        'email' => 'updated@cipher.com',
        'phone' => '+2348000000000',
        'status' => 'suspended',
    ]);

    $response->assertRedirect("/admin/users/{$user->id}");
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'New Updated Name',
        'email' => 'updated@cipher.com',
        'status' => 'suspended',
    ]);
    $this->assertDatabaseHas('accounts', [
        'user_id' => $user->id,
        'status' => 'frozen',
    ]);
});
