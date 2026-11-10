<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('funding_provider_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50)->index();
            $table->string('event_reference', 100)->unique();
            $table->string('event_type', 80)->index();
            $table->json('payload');
            $table->string('status', 20)->default('received')->index();
            $table->foreignId('funding_request_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['provider', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funding_provider_events');
    }
};
