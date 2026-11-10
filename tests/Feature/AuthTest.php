<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Currency;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
        Notification::fake();
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

    public function test_unauthenticated_user_redirected_from_user_dashboard(): void
    {
        $response = $this->get('/user/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_user_can_register_and_auto_provisions_wallet_account(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'phone' => '+2348123456789',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect('/verify-email');
        $this->assertDatabaseHas('users', ['email' => 'customer@test.com']);

        $user = User::where('email', 'customer@test.com')->first();
        $this->assertNotNull($user->account);
        $this->assertEquals(0.00, $user->account->available_balance);
    }

    public function test_authenticated_user_can_access_user_dashboard(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);
        Account::create([
            'user_id' => $user->id,
            'public_reference' => 'ACC-TEST1234',
            'available_balance' => 1000.00,
            'ledger_balance' => 1000.00,
            'total_deposit' => 1000.00,
            'status' => 'active',
        ]);

        // Unverified user can access dashboard (email verification is optional)
        $response = $this->actingAs($user)->get('/user/dashboard');
        $response->assertStatus(200);
    }

    public function test_user_can_verify_email_via_signed_link(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->actingAs($user)->get($url);
        $response->assertRedirect('/user/dashboard');
        $response->assertSessionHas('success');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_request_resend_verification_link(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $response = $this->actingAs($user)->post('/verify-email/resend');
        $response->assertSessionHas('success');
    }

    public function test_user_can_view_login_page(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'login_test@cipher.com',
            'password' => bcrypt('SecretPassword123!'),
        ]);

        $response = $this->post('/login', [
            'email' => 'login_test@cipher.com',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertRedirect('/user/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_can_login_with_phone_number(): void
    {
        $user = User::factory()->create([
            'phone' => '+2348123456789',
            'password' => bcrypt('SecretPassword123!'),
        ]);

        // Login using phone format
        $response = $this->post('/login', [
            'email' => '08123456789',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertRedirect('/user/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'valid@cipher.com',
            'password' => bcrypt('RealPassword123!'),
        ]);

        $response = $this->post('/login', [
            'email' => 'valid@cipher.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }
}
