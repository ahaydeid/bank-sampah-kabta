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
            $table->string('kode_pos', 3)->nullable()->unique()->after('nama_pos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_lokasi', function (Blueprint $table) {
            $table->dropColumn('kode_pos');
        });
    }
};
