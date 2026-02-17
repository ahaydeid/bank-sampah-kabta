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
        Schema::create('reward', function (Blueprint $table) {
            $table->id();
            $table->string('nama_reward');
            $table->integer('stok')->default(0);
            $table->decimal('poin_tukar', 15, 2);
            $table->string('kategori_reward')->default('Sembako');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward');
    }
};
