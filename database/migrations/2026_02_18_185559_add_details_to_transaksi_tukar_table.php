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
        Schema::table('transaksi_tukar', function (Blueprint $table) {
            $table->foreignId('admin_id')->nullable()->constrained('pengguna')->onDelete('set null');
            $table->foreignId('petugas_id')->nullable()->constrained('pengguna')->onDelete('set null');
            $table->foreignId('pos_id')->nullable()->constrained('pos_lokasi')->onDelete('set null');
            $table->timestamp('expired_at')->nullable();
            
            // Re-define status to include new types if necessary, 
            // but for simplicity in SQLite/others, we keep it as string or update it carefully.
            // Currently it is 'menunggu', 'berhasil', 'dibatalkan'.
            // We want: 'menunggu', 'disetujui', 'selesai', 'kadaluwarsa', 'dibatalkan'.
        });
    }

    public function down(): void
    {
        Schema::table('transaksi_tukar', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);
            $table->dropForeign(['pos_id']);
            $table->dropColumn(['admin_id', 'petugas_id', 'pos_id', 'expired_at']);
        });
    }
};
