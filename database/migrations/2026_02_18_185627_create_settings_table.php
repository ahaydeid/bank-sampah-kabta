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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->string('label')->nullable();
            $table->timestamps();
        });

        // Insert default setting for point exchange expiration
        DB::table('settings')->insert([
            'key' => 'penukaran_poin_kadaluwarsa_jam',
            'value' => '24',
            'group' => 'penukaran_poin',
            'type' => 'integer',
            'label' => 'Batas Waktu Penukaran (Jam)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
