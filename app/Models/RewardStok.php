<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardStok extends Model
{
    protected $table = 'reward_stok';

    protected $fillable = [
        'reward_id',
        'pos_id',
        'stok',
    ];

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class, 'reward_id');
    }

    public function pos(): BelongsTo
    {
        return $this->belongsTo(PosLokasi::class, 'pos_id');
    }
}
