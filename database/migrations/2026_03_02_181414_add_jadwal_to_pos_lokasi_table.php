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
        Schema::table('pos_lokasi', function (Blueprint $table) {
            $table->time('jadwal_buka')->nullable()->after('alamat');
            $table->time('jadwal_tutup')->nullable()->after('jadwal_buka');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_lokasi', function (Blueprint $table) {
            $table->dropColumn(['jadwal_buka', 'jadwal_tutup']);
        });
    }
};
