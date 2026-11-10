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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->unique()->after('email');
            $table->string('profile_pic')->nullable()->after('phone');
            $table->foreignId('user_currency_id')
                ->nullable()
                ->after('profile_pic')
                ->constrained('currencies')
                ->restrictOnDelete();
            $table->string('status', 20)->default('active')->index()->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['user_currency_id']);
            $table->dropColumn([
                'phone',
                'profile_pic',
                'user_currency_id',
                'status',
            ]);
        });
    }
};
