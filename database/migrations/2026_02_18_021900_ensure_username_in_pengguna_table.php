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
        Schema::table('pengguna', function (Blueprint $table) {
            if (!Schema::hasColumn('pengguna', 'username')) {
                $table->string('username')->unique()->after('id')->nullable();
            }
            if (!Schema::hasColumn('pengguna', 'first_login_at')) {
                $table->timestamp('first_login_at')->nullable()->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            // We don't drop them here to avoid accidental data loss if this was a fix
        });
    }
};
