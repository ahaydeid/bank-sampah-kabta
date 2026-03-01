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
        Schema::table('transaksi_tukar', function (Blueprint $table) {
            $table->timestamp('tanggal_selesai')->nullable()->after('status');
        });

        // Migrate existing data: 'selesai' -> 'disetujui' + tanggal_selesai
        DB::table('transaksi_tukar')
            ->where('status', 'selesai')
            ->update([
                'tanggal_selesai' => DB::raw('updated_at'), // approximate
                'status' => 'disetujui'
            ]);

        // Update constraint
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE transaksi_tukar DROP CONSTRAINT transaksi_tukar_status_check');
            DB::statement("ALTER TABLE transaksi_tukar ADD CONSTRAINT transaksi_tukar_status_check CHECK (status IN ('menunggu', 'disetujui', 'kadaluwarsa', 'dibatalkan'))");
        } else {
             // For MySQL/Others using enum column
            Schema::table('transaksi_tukar', function (Blueprint $table) {
                // Modifying native enum is tricky in Laravel migration without raw SQL usually
                // But let's assume standard Laravel enum change
                // $table->enum('status', ['menunggu', 'disetujui', 'kadaluwarsa', 'dibatalkan'])->default('menunggu')->change();
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
            DB::statement("ALTER TABLE transaksi_tukar ADD CONSTRAINT transaksi_tukar_status_check CHECK (status IN ('menunggu', 'disetujui', 'selesai', 'kadaluwarsa', 'dibatalkan'))");
        }

        // Revert data: tanggal_selesai IS NOT NULL -> 'selesai'
        DB::table('transaksi_tukar')
            ->whereNotNull('tanggal_selesai')
            ->update(['status' => 'selesai']);

        Schema::table('transaksi_tukar', function (Blueprint $table) {
            $table->dropColumn('tanggal_selesai');
        });
    }
};
