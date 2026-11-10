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
        Schema::create('temp_email_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('temp_email_id')->constrained('temp_emails')->cascadeOnDelete();
            $table->string('sender', 150);
            $table->string('subject', 255);
            $table->longText('body_text')->nullable();
            $table->longText('body_html')->nullable();
            $table->string('verification_code', 50)->nullable()->index();
            $table->timestamp('received_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_email_messages');
    }
};
