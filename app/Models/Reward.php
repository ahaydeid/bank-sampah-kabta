<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Reward extends Model
{
    use LogsActivity;
    protected $table = 'reward';

    protected $fillable = [
        'nama_reward',
        'stok', // Keep for backward compatibility or as global sum
        'poin_tukar',
        'kategori_reward',
        'foto',
    ];

    protected $casts = [
        'stok' => 'integer',
        'poin_tukar' => 'integer',
    ];

    protected $appends = ['foto_url'];

    public function stokPerPos()
    {
        return $this->hasMany(RewardStok::class, 'reward_id');
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }
}
