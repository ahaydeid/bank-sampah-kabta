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
        Schema::create('profil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengguna_id')->constrained('pengguna')->onDelete('cascade');
            $table->string('nama');
            $table->string('nik')->nullable()->unique();
            $table->text('alamat')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('jabatan')->nullable();
            $table->decimal('saldo_poin', 15, 2)->default(0);
            $table->string('token_qr')->nullable()->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil');
    }
};
