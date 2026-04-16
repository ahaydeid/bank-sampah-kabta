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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengguna_id')->nullable();
            $table->string('nama_user');
            $table->string('modul'); // Nama model: TransaksiSetor, TransaksiTukar, dll
            $table->string('aksi'); // dibuat, diperbarui, dihapus
            $table->string('deskripsi');
            $table->json('data_lama')->nullable();
            $table->json('data_baru')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('pengguna_id')
                ->references('id')
                ->on('pengguna')
                ->onDelete('set null');

            $table->index(['pengguna_id', 'created_at']);
            $table->index('modul');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
