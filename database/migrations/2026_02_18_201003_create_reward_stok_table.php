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
        Schema::create('reward_stok', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reward_id')->constrained('reward')->onDelete('cascade');
            $table->foreignId('pos_id')->constrained('pos_lokasi')->onDelete('cascade');
            $table->integer('stok')->default(0);
            $table->timestamps();

            $table->unique(['reward_id', 'pos_id']);
        });

        // Data migration: Move existing global stock to the first available POS
        $firstPos = DB::table('pos_lokasi')->orderBy('id', 'asc')->first();
        
        if ($firstPos) {
            $rewards = DB::table('reward')->get();
            foreach ($rewards as $reward) {
                DB::table('reward_stok')->insert([
                    'reward_id' => $reward->id,
                    'pos_id' => $firstPos->id,
                    'stok' => $reward->stok,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Optionally remove old column, but let's keep it for safety during transition
        // Schema::table('reward', function (Blueprint $table) {
        //     $table->dropColumn('stok');
        // });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_stok');
    }
};
