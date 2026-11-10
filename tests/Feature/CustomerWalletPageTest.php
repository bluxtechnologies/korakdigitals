<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Account;
use App\Models\Currency;
use App\Models\LedgerEntry;
use App\Models\FundingAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CustomerWalletPageTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Currency $ngn;
    protected Currency $usd;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
        \Illuminate\Support\Facades\Notification::fake();

        $this->ngn = Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $this->usd = Currency::create([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'rate' => 1.00,
            'is_default' => false,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $this->user = User::factory()->create([
            'user_currency_id' => $this->ngn->id,
        ]);

        $this->account = Account::create([
            'user_id' => $this->user->id,
            'public_reference' => 'CLQ-ACC-12345',
            'available_balance' => 50000.00,
            'ledger_balance' => 50000.00,
            'total_deposit' => 100000.00,
            'status' => 'active',
        ]);
    }

    public function test_guest_cannot_access_wallet_page(): void
    {
        $response = $this->get('/user/wallet');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_wallet_page_with_inertia_props(): void
    {
        // Seed a transaction
        LedgerEntry::create([
            'account_id' => $this->account->id,
            'reference' => 'TXN-DEP-001',
            'type' => 'credit',
            'category' => 'deposit',
            'amount' => 5000.00,
            'balance_after' => 50000.00,
            'currency_code' => 'NGN',
            'description' => 'Wallet Funded via Bank Transfer',
            'idempotency_key' => 'idemp_dep_001',
        ]);

        // Seed a funding account
        FundingAccount::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'provider' => 'finity',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
            'account_name' => 'CIPHER-TEST USER',
            'external_reference' => 'EXT-123',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)->get('/user/wallet');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('wallet')
            ->has('account')
            ->has('transactions', 1)
            ->has('currencies', 2)
            ->has('fundingAccount')
            ->where('account.public_reference', 'CLQ-ACC-12345')
            ->where('fundingAccount.account_number', '1234567890')
        );
    }

    public function test_user_can_switch_wallet_currency(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/user/wallet/switch-currency', [
                'currency_id' => $this->usd->id,
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        $this->assertEquals($this->usd->id, $this->user->user_currency_id);
    }
}
