<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use App\Models\Account;
use App\Models\Currency;
use App\Models\Order;
use App\Models\FundingRequest;
use App\Models\LedgerEntry;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected Admin $admin;
    protected Currency $currency;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Http::fake();
        \Illuminate\Support\Facades\Notification::fake();

        $this->currency = Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $this->admin = Admin::create([
            'name' => 'Super Admin',
            'email' => 'admin@cipher.com',
            'password' => bcrypt('admin123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_login_with_valid_credentials(): void
    {
        $response = $this->post('/admin/login', [
            'email' => 'admin@cipher.com',
            'password' => 'admin123',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticatedAs($this->admin, 'admin');
    }

    public function test_admin_can_adjust_user_wallet_with_audit_log(): void
    {
        $user = User::factory()->create(['user_currency_id' => $this->currency->id]);
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-TEST-ADM1',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin, 'admin')
            ->post("/admin/users/{$user->id}/wallet-adjust", [
                'type' => 'credit',
                'amount' => 5000.00,
                'reason' => 'Test promotional grant',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('ledger_entries', [
            'account_id' => $account->id,
            'amount' => 5000.00,
        ]);
        $this->assertEquals(5000.00, (float) Account::find($account->id)->available_balance);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'wallet_credit',
            'target_id' => $user->id,
            'reason' => 'Test promotional grant',
        ]);
    }

    public function test_admin_can_approve_manual_funding_request(): void
    {
        $user = User::factory()->create(['user_currency_id' => $this->currency->id]);
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-TEST-ADM2',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $fundingReq = FundingRequest::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'public_reference' => 'FREQ-TEST100',
            'provider' => 'manual',
            'amount' => 10000.00,
            'currency_code' => 'NGN',
            'sender_bank_name' => 'Wema Bank',
            'sender_name' => 'John Customer',
            'provider_reference' => 'TXN-REF-100200',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin, 'admin')
            ->post("/admin/funding-requests/{$fundingReq->id}/approve", [
                'reason' => 'Bank credit verified',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();
        $this->assertEquals(10000.00, (float) Account::find($account->id)->available_balance);
        $this->assertEquals('approved', $fundingReq->fresh()->status);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'funding_request_approved',
            'reference' => 'TXN-REF-100200',
        ]);
    }

    public function test_admin_can_create_user_with_auto_provisioning(): void
    {
        $response = $this->actingAs($this->admin, 'admin')
            ->post('/admin/users', [
                'name' => 'Admin Created User',
                'email' => 'admin_created@cipher.com',
                'phone' => '+2348099887766',
                'password' => 'Password123!',
                'currency_id' => $this->currency->id,
                'initial_balance' => 500.00,
                'is_verified' => true,
                'auto_provision_finitypay' => true,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $user = User::where('email', 'admin_created@cipher.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($user->account);
        $this->assertEquals(500.00, (float) $user->account->available_balance);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_created_by_admin',
            'actor_type' => 'admin',
        ]);
    }
}
