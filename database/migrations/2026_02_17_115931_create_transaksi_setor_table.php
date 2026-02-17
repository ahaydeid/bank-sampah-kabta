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
        Schema::create('transaksi_setor', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi')->unique();
            $table->foreignId('member_id')->constrained('pengguna');
            $table->foreignId('petugas_id')->constrained('pengguna');
            $table->foreignId('pos_id')->constrained('pos_lokasi');
            $table->decimal('total_berat', 12, 4);
            $table->decimal('total_poin', 15, 2);
            $table->dateTime('tanggal_waktu');
            $table->string('foto_bukti')->nullable();
            $table->enum('status', ['berhasil', 'dibatalkan'])->default('berhasil');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_setor');
    }
};
