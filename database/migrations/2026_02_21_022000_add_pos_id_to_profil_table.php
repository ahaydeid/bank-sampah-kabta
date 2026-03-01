<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profil', function (Blueprint $table) {
            $table->foreignId('pos_id')->nullable()->constrained('pos_lokasi')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('profil', function (Blueprint $table) {
            $table->dropForeign(['pos_id']);
            $table->dropColumn('pos_id');
        });
    }
};
