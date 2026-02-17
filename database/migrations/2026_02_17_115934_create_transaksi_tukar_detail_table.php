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
        Schema::create('transaksi_tukar_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaksi_tukar_id')->constrained('transaksi_tukar')->onDelete('cascade');
            $table->foreignId('reward_id')->constrained('reward');
            $table->integer('jumlah');
            $table->decimal('subtotal_poin', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_tukar_detail');
    }
};
