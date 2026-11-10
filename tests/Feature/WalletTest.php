<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Account;
use App\Models\Currency;
use App\Services\WalletService;
use App\Services\FinityPayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
        \Illuminate\Support\Facades\Notification::fake();
        Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);
    }

    public function test_wallet_service_credits_and_debits_atomically(): void
    {
        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W100',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $walletService = app(WalletService::class);

        // Credit wallet
        $walletService->creditWallet(
            $account,
            10000.00,
            'NGN',
            'deposit',
            'Test Deposit',
            'REF-CR-1',
            'idempotency_cr_1'
        );

        $account->refresh();
        $this->assertEquals(10000.00, $account->available_balance);
        $this->assertDatabaseHas('ledger_entries', ['reference' => 'REF-CR-1', 'amount' => 10000.00]);

        // Debit wallet
        $walletService->debitWallet(
            $account,
            2500.00,
            'NGN',
            'service_purchase',
            'Test Debit',
            'REF-DR-1',
            'idempotency_dr_1'
        );

        $account->refresh();
        $this->assertEquals(7500.00, $account->available_balance);
        $this->assertDatabaseHas('ledger_entries', ['reference' => 'REF-DR-1', 'amount' => 2500.00]);
    }

    public function test_finitypay_webhook_credits_wallet_with_idempotency(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W200',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $finityPayService = app(FinityPayService::class);
        $fundingAcc = $finityPayService->generateVirtualAccount($user);

        $payload = [
            'event' => 'charge.success',
            'account_number' => $fundingAcc->account_number,
            'amount' => 15000.00,
            'sender_name' => 'John Bank Transfer',
        ];

        $processed = $finityPayService->processWebhook($payload, 'EVT-FP-9988');
        $this::assertTrue($processed);

        $account->refresh();
        $this->assertEquals(15000.00, $account->available_balance);

        // Replay same webhook
        $reprocessed = $finityPayService->processWebhook($payload, 'EVT-FP-9988');
        $this::assertTrue($reprocessed);

        $account->refresh();
        $this->assertEquals(15000.00, $account->available_balance); // Balance must NOT duplicate
    }

    public function test_authenticated_user_can_access_wallet_overview_and_receives_currencies(): void
    {
        $user = User::factory()->create();
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W300',
            'available_balance' => 5000.00,
            'ledger_balance' => 5000.00,
            'total_deposit' => 5000.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/user/wallet');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('wallet')
            ->has('currencies')
            ->has('transactions')
            ->has('account')
        );
    }

    public function test_authenticated_user_can_access_wallet_fund_and_history(): void
    {
        Http::fake();

        $user = User::factory()->create();
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W400',
            'available_balance' => 5000.00,
            'ledger_balance' => 5000.00,
            'total_deposit' => 5000.00,
            'status' => 'active',
        ]);

        $fundResponse = $this->actingAs($user)->get('/user/wallet/fund');
        $fundResponse->assertStatus(200);
        $fundResponse->assertInertia(fn ($page) => $page
            ->component('wallet-fund')
            ->has('fundingAccount')
            ->has('recentDeposits')
        );

        $historyResponse = $this->actingAs($user)->get('/user/wallet/history');
        $historyResponse->assertStatus(200);
        $historyResponse->assertInertia(fn ($page) => $page
            ->component('wallet-history')
            ->has('transactions')
        );
    }

    public function test_user_can_initiate_dynamic_payment_session(): void
    {
        $user = User::factory()->create();
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W500',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->postJson('/user/wallet/fund/initiate', [
            'amount' => 5000,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'reference',
                'payment_url',
                'amount',
                'currency',
                'expires_at',
            ]);
    }

    public function test_cofinance_webhook_credits_wallet_with_hmac_sha512_signature(): void
    {
        config(['services.finitypay.webhook_secret' => 'test_webhook_secret_key_123']);

        $user = User::factory()->create(['email' => 'dynamic_depositor@cipher.com']);
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W600',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $reference = "CLQ-DEP-{$user->id}-TESTREF99";
        $payload = [
            'id' => 'evt_01JXMOCKTEST1234567890',
            'type' => 'wallet.funded',
            'data' => [
                'account' => [
                    'account_number' => '1234567890',
                ],
                'customer' => [
                    'email' => 'dynamic_depositor@cipher.com',
                    'name' => 'Dynamic Tester',
                ],
                'transaction' => [
                    'reference' => $reference,
                    'amount' => 15000.00,
                    'fee' => 10.00,
                    'net_amount' => 14990.00,
                    'currency' => 'NGN',
                ],
            ],
        ];

        $rawBody = json_encode($payload);
        $validSignature = hash_hmac('sha256', $rawBody, 'test_webhook_secret_key_123');

        // 1. Invalid signature should be rejected with 401
        $invalidResponse = $this->call(
            'POST',
            '/webhooks/cofinance',
            [],
            [],
            [],
            [
                'HTTP_X_COFINANCE_SIGNATURE' => 'invalid_fake_signature_hex',
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );
        $invalidResponse->assertStatus(401);

        // 2. Valid signature should succeed and credit net_amount
        $response = $this->call(
            'POST',
            '/webhooks/cofinance',
            [],
            [],
            [],
            [
                'HTTP_X_COFINANCE_SIGNATURE' => $validSignature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success', 'received' => true]);

        $account->refresh();
        // Brief §6: credit net_amount (14990.00), not gross (15000.00)
        $this->assertEquals(14990.00, $account->available_balance);
        $this->assertDatabaseHas('ledger_entries', [
            'account_id' => $account->id,
            'amount' => 14990.00,
            'type' => 'credit',
        ]);

        // 3. Idempotency test: Replay should not double-credit
        $replayResponse = $this->call(
            'POST',
            '/webhooks/cofinance',
            [],
            [],
            [],
            [
                'HTTP_X_COFINANCE_SIGNATURE' => $validSignature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );
        $replayResponse->assertStatus(200);
        $account->refresh();
        $this->assertEquals(14990.00, $account->available_balance);
    }

    public function test_customer_provisioning_and_virtual_account_generation(): void
    {
        Http::fake();

        $user = User::factory()->create(['finitypay_customer_uuid' => null]);
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W700',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        $finityPayService = app(FinityPayService::class);
        $fundingAccount = $finityPayService->generateVirtualAccount($user);

        $this->assertNotNull($fundingAccount);
        $this->assertNotEmpty($fundingAccount->account_number);

        $user->refresh();
        $this->assertNotNull($user->finitypay_customer_uuid);
        $this->assertDatabaseHas('funding_accounts', [
            'user_id' => $user->id,
            'provider' => 'finitypay',
            'status' => 'active',
        ]);
    }

    public function test_real_finitypay_webhook_payload_format(): void
    {
        config(['services.finitypay.webhook_secret' => 'test_webhook_secret_key_123']);

        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-W800',
            'available_balance' => 0.00,
            'ledger_balance' => 0.00,
            'total_deposit' => 0.00,
            'status' => 'active',
        ]);

        \App\Models\FundingAccount::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'provider' => 'finitypay',
            'account_number' => '1842957330',
            'bank_name' => 'Paga',
            'account_name' => 'CIPHER/SimonHolm',
            'external_reference' => 'ref-simon-1',
            'status' => 'active',
        ]);

        $payload = [
            'transaction_id' => 1350,
            'reference' => 'tx_d13c4f49-c0a8-4dfe-9dcf-f812f5c4a56e',
            'payment_method' => 'bank_transfer',
            'processing_fee' => '10.00',
            'cleared_amount' => '100.00',
            'gateway_status' => 'success',
            'payload' => [
                'provider_transaction_id' => 'MPVAT-P_20260906002527208_1176480277_X8NGD_tf6q8',
                'account_type' => 'customer_reserved',
                'account_number' => '1842957330',
                'reserved_account_id' => 709,
                'business_reserved_account_id' => null,
                'account_reference' => 'MPVAT-P_20260906002527208_1176480277_X8NGD_tf6q8',
                'reserved_account_reference' => 'MPVAT-P_20260906002527208_1176480277_X8NGD_tf6q8',
                'provider_callback' => [
                    'statusCode' => '0',
                    'statusMessage' => 'success',
                    'transactionReference' => 'MPVAT-P_20260906002527208_1176480277_X8NGD_tf6q8',
                    'fundingTransactionReference' => 'DFB-U_20260906002526979_1176480276_DB82K_tf6q8',
                    'fundingPaymentReference' => '100004260905232523170450488047',
                    'accountNumber' => '1842957330',
                    'accountName' => 'CIPHER/SimonHolm',
                    'financialIdentificationNumber' => null,
                    'amount' => '100.00',
                    'clearingFeeAmount' => '0.75',
                    'payerDetails' => [
                        'paymentReferenceNumber' => '100004260905232523170450488047 - 100004260905232523170450488047',
                        'narration' => 'Transfer from COLLINS OGHENERUKEVWE OBASEKI',
                        'paymentMethod' => 'BANK_TRANSFER',
                        'payerName' => 'COLLINS OGHENERUKEVWE OBASEKI',
                        'payerBankName' => 'Opay',
                        'payerBankAccountNumber' => '9017063088',
                    ],
                    'narration' => 'Transfer from COLLINS OGHENERUKEVWE OBASEKI',
                    'hash' => 'f6fdd9a253f6a96f1437e0dc0e9a733fa3080e877eadb873f00be9e18f481a0d45c4009f092d1872aa37ae72bfda9046ce3199654c97e5daca60a49915cb26ad',
                    'transactionDate' => '2026-09-05T23:25:26.98',
                ],
                'provider' => 'paga',
                'callback_reference' => 'MPVAT-P_20260906002527208_1176480277_X8NGD_tf6q8',
                'settled_amount' => 90,
                'customer_charge' => 100,
                'calculated_fee' => 10,
                'fee_payer' => 'merchant_pays_fee',
            ],
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, 'test_webhook_secret_key_123');

        $response = $this->call(
            'POST',
            '/funding/webhook/finitypay',
            [],
            [],
            [],
            [
                'HTTP_X_FINITYPAY_SIGNATURE' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success', 'received' => true]);

        $account->refresh();
        $this->assertEquals(90.00, $account->available_balance);
        $this->assertDatabaseHas('ledger_entries', [
            'account_id' => $account->id,
            'amount' => 90.00,
            'type' => 'credit',
        ]);
        $this->assertDatabaseHas('funding_requests', [
            'account_id' => $account->id,
            'amount' => 90.00,
            'sender_name' => 'COLLINS OGHENERUKEVWE OBASEKI',
            'status' => 'approved',
        ]);
    }

    public function test_wallet_balance_converts_when_user_switches_currency_in_profile(): void
    {
        $usd = Currency::create([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'rate' => 1.00,
            'is_default' => false,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $ngn = Currency::where('code', 'NGN')->first();

        // User starts with NGN currency and ₦15,000 balance
        $user = User::create([
            'name' => 'FX User',
            'email' => 'fx_test_user@cipher.com',
            'phone' => '+2348011223344',
            'password' => bcrypt('password'),
            'user_currency_id' => $ngn->id,
        ]);

        $account = Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-FX-TEST',
            'available_balance' => 15000.00,
            'ledger_balance' => 15000.00,
            'total_deposit' => 15000.00,
            'status' => 'active',
        ]);

        // User switches currency from NGN (rate 1500) to USD (rate 1)
        // Expected: 15,000 / 1500 = $10.00
        $response = $this->actingAs($user)->put('/user/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'user_currency_id' => $usd->id,
        ]);

        $response->assertSessionHas('success');
        $account->refresh();

        $this->assertEquals(10.00, (float) $account->available_balance);
        $this->assertEquals(10.00, (float) $account->ledger_balance);

        $this->assertDatabaseHas('ledger_entries', [
            'account_id' => $account->id,
            'category' => 'currency_conversion',
            'currency_code' => 'USD',
            'amount' => 10.00,
        ]);
    }
}
