<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->string('peran_backup')->nullable()->after('peran');
        });

        DB::table('pengguna')->update([
            'peran_backup' => DB::raw('peran'),
        ]);

        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('peran');
        });

        Schema::table('pengguna', function (Blueprint $table) {
            $table->enum('peran', ['superadmin', 'admin', 'petugas', 'member'])->default('member')->after('password');
        });

        DB::table('pengguna')
            ->whereNotNull('peran_backup')
            ->update([
                'peran' => DB::raw('peran_backup'),
            ]);

        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('peran_backup');
        });
    }

    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->string('peran_backup')->nullable()->after('peran');
        });

        DB::table('pengguna')->update([
            'peran_backup' => DB::raw("CASE WHEN peran = 'superadmin' THEN 'admin' ELSE peran END"),
        ]);

        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('peran');
        });

        Schema::table('pengguna', function (Blueprint $table) {
            $table->enum('peran', ['admin', 'petugas', 'member'])->default('member')->after('password');
        });

        DB::table('pengguna')
            ->whereNotNull('peran_backup')
            ->update([
                'peran' => DB::raw('peran_backup'),
            ]);

        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('peran_backup');
        });
    }
};
