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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('item_title', 150);
            $table->unsignedInteger('quantity')->default(1);
            
            // Price snapshots
            $table->decimal('supplier_cost', 20, 4)->default(0);
            $table->decimal('markup_percentage', 8, 2)->default(0);
            $table->decimal('unit_selling_price', 20, 4);
            $table->decimal('subtotal', 20, 4);
            $table->char('currency_code', 3);

            // Fulfillment details
            $table->string('supplier_order_reference', 100)->nullable()->index();
            $table->string('status', 30)->default('pending')->index();
            $table->json('credentials_payload')->nullable(); // phone number, vpn key, esim iccid, social login details
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
