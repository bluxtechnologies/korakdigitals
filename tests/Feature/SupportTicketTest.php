<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Currency;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Notifications\SupportReplyNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Admin $admin;
    protected Currency $currency;

    protected function setUp(): void
    {
        parent::setUp();

        $this->currency = Currency::create([
            'code' => 'NGN',
            'name' => 'Nigerian Naira',
            'symbol' => '₦',
            'rate' => 1500.00,
            'is_default' => true,
            'is_active' => true,
            'decimal_places' => 2,
        ]);

        $this->user = User::factory()->create([
            'user_currency_id' => $this->currency->id,
        ]);

        $this->admin = Admin::create([
            'name' => 'Support Admin',
            'email' => 'admin@cipher.com',
            'password' => bcrypt('admin123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        Storage::fake('local');
    }

    public function test_customer_can_view_support_hub(): void
    {
        $response = $this->actingAs($this->user)->get('/user/support');
        $response->assertStatus(200);
    }

    public function test_customer_can_create_ticket_with_attachment(): void
    {
        $file = UploadedFile::fake()->create('screenshot.png', 100, 'image/png');

        $response = $this->actingAs($this->user)->post('/user/support', [
            'subject' => 'Payment not reflecting',
            'message' => 'I made a transfer 30 minutes ago and it has not shown in my balance.',
            'attachment' => $file,
        ]);

        $this->assertDatabaseHas('support_tickets', [
            'user_id' => $this->user->id,
            'subject' => 'Payment not reflecting',
            'status' => 'open',
        ]);

        $ticket = SupportTicket::where('user_id', $this->user->id)->first();
        $this->assertNotNull($ticket);

        $response->assertRedirect(route('user.support.show', $ticket->id));

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $this->user->id,
            'message' => 'I made a transfer 30 minutes ago and it has not shown in my balance.',
        ]);

        $firstMessage = $ticket->messages()->first();
        $this->assertNotNull($firstMessage->attachment_path);
        Storage::disk('local')->assertExists($firstMessage->attachment_path);
    }

    public function test_customer_cannot_view_another_users_ticket(): void
    {
        $otherUser = User::factory()->create(['user_currency_id' => $this->currency->id]);
        $ticket = SupportTicket::create([
            'user_id' => $otherUser->id,
            'subject' => 'Private Issue',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)->get("/user/support/{$ticket->id}");
        $response->assertStatus(403);
    }

    public function test_customer_can_reply_to_their_ticket(): void
    {
        $ticket = SupportTicket::create([
            'user_id' => $this->user->id,
            'subject' => 'Need Help',
            'status' => 'open',
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $this->user->id,
            'message' => 'Initial question',
        ]);

        $response = $this->actingAs($this->user)->post("/user/support/{$ticket->id}/reply", [
            'message' => 'Following up on this.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $this->user->id,
            'message' => 'Following up on this.',
            'attachment_path' => null,
        ]);
    }

    public function test_admin_can_view_support_queue(): void
    {
        SupportTicket::create([
            'user_id' => $this->user->id,
            'subject' => 'Queue test',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'admin')->get('/admin/support');
        $response->assertStatus(200);
    }

    public function test_admin_can_reply_to_ticket_and_trigger_notification(): void
    {
        Notification::fake();

        $ticket = SupportTicket::create([
            'user_id' => $this->user->id,
            'subject' => 'Issue with SMS',
            'status' => 'open',
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $this->user->id,
            'message' => 'SMS not arriving.',
        ]);

        $response = $this->actingAs($this->admin, 'admin')->post("/admin/support/{$ticket->id}/reply", [
            'message' => 'We have checked the provider and re-routed your request.',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'admin',
            'sender_id' => $this->admin->id,
            'message' => 'We have checked the provider and re-routed your request.',
        ]);

        Notification::assertSentTo(
            $this->user,
            SupportReplyNotification::class,
            function ($notification) use ($ticket) {
                $arrayData = $notification->toArray($this->user);
                return $arrayData['ticket_id'] === $ticket->id && $arrayData['category'] === 'support';
            }
        );
    }

    public function test_admin_can_update_ticket_status(): void
    {
        $ticket = SupportTicket::create([
            'user_id' => $this->user->id,
            'subject' => 'Resolution test',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'admin')->post("/admin/support/{$ticket->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('resolved', $ticket->fresh()->status);

        $this->assertDatabaseHas('audit_logs', [
            'actor_type' => 'admin',
            'actor_id' => $this->admin->id,
            'action' => 'support_ticket_status_change',
            'target_id' => $ticket->id,
        ]);
    }

    public function test_authorized_user_and_admin_can_stream_attachment(): void
    {
        $file = UploadedFile::fake()->create('proof.jpg', 100, 'image/jpeg');
        $path = $file->store('support_attachments', 'local');

        $ticket = SupportTicket::create([
            'user_id' => $this->user->id,
            'subject' => 'Attachment Stream Test',
            'status' => 'open',
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'sender_id' => $this->user->id,
            'message' => 'Here is the proof',
            'attachment_path' => $path,
        ]);

        // Customer can stream their attachment
        $customerResponse = $this->actingAs($this->user)->get("/user/support/{$ticket->id}/attachment");
        $customerResponse->assertStatus(200);

        // Admin can stream the attachment
        $adminResponse = $this->actingAs($this->admin, 'admin')->get("/admin/support/{$ticket->id}/attachment");
        $adminResponse->assertStatus(200);

        // Other customer cannot stream
        $otherUser = User::factory()->create(['user_currency_id' => $this->currency->id]);
        $unauthorizedResponse = $this->actingAs($otherUser)->get("/user/support/{$ticket->id}/attachment");
        $unauthorizedResponse->assertStatus(403);
    }
}
