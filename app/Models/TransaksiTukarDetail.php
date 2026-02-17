<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiTukarDetail extends Model
{
    protected $table = 'transaksi_tukar_detail';

    protected $fillable = [
        'transaksi_tukar_id',
        'reward_id',
        'jumlah',
        'subtotal_poin',
    ];

    public function transaksiTukar()
    {
        return $this->belongsTo(TransaksiTukar::class, 'transaksi_tukar_id');
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class, 'reward_id');
    }
}
