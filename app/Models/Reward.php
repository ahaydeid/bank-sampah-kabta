<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    protected $table = 'reward';

    protected $fillable = [
        'nama_reward',
        'stok', // Keep for backward compatibility or as global sum
        'poin_tukar',
        'kategori_reward',
    ];

    protected $casts = [
        'stok' => 'integer',
        'poin_tukar' => 'integer',
    ];

    public function stokPerPos()
    {
        return $this->hasMany(RewardStok::class, 'reward_id');
    }
}
