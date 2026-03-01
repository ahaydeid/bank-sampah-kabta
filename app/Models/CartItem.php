<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'reward_id', 'pos_id', 'jumlah'];

    protected $appends = ['stok'];

    public function getStokAttribute()
    {
        $rewardStok = \App\Models\RewardStok::where('reward_id', $this->reward_id)
            ->where('pos_id', $this->pos_id)
            ->first();
        
        return $rewardStok ? $rewardStok->stok : 0;
    }

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }

    public function pos()
    {
        return $this->belongsTo(PosLokasi::class, 'pos_id');
    }
}
