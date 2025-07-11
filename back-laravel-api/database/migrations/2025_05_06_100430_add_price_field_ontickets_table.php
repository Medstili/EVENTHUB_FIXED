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
        Schema::table('tickets', function (Blueprint $table) {
            
            $table->decimal('price', 8, 2)->after('status')->nullable()->default(0.00);
            $table->string('currency', 3)->after('price')->nullable()->default('DH');
            $table->string('payment_status')->after('currency')->nullable()->default('pending')->comment('Payment status of the ticket');
            $table->string('transaction_id')->after('payment_status')->nullable()->comment('Transaction ID for the payment');
            $table->string('payment_method')->after('transaction_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->dropColumn('currency');
            $table->dropColumn('payment_status');
            $table->dropColumn('transaction_id');
            $table->dropColumn('payment_method');
        });
    }
};
