<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to drop the constraint and add it back
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE transaksi_tukar DROP CONSTRAINT transaksi_tukar_status_check');
            DB::statement("ALTER TABLE transaksi_tukar ADD CONSTRAINT transaksi_tukar_status_check CHECK (status IN ('menunggu', 'disetujui', 'selesai', 'kadaluwarsa', 'dibatalkan'))");
            
            // Default value was 'pending', change it to 'menunggu'
            DB::statement("ALTER TABLE transaksi_tukar ALTER COLUMN status SET DEFAULT 'menunggu'");
            
            // Update existing record statuses if any
            DB::table('transaksi_tukar')->where('status', 'pending')->update(['status' => 'menunggu']);
            DB::table('transaksi_tukar')->where('status', 'berhasil')->update(['status' => 'selesai']);
        } else {
            Schema::table('transaksi_tukar', function (Blueprint $table) {
                $table->string('status')->default('menunggu')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE transaksi_tukar DROP CONSTRAINT transaksi_tukar_status_check');
            DB::statement("ALTER TABLE transaksi_tukar ADD CONSTRAINT transaksi_tukar_status_check CHECK (status IN ('pending', 'berhasil', 'dibatalkan'))");
            DB::statement("ALTER TABLE transaksi_tukar ALTER COLUMN status SET DEFAULT 'pending'");
        } else {
            Schema::table('transaksi_tukar', function (Blueprint $table) {
                $table->string('status')->default('pending')->change();
            });
        }
    }
};
