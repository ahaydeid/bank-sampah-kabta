<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiSetorDetail extends Model
{
    protected $table = 'transaksi_setor_detail';

    protected $fillable = [
        'transaksi_setor_id',
        'sampah_id',
        'berat',
        'subtotal_poin',
    ];

    public function transaksiSetor()
    {
        return $this->belongsTo(TransaksiSetor::class, 'transaksi_setor_id');
    }

    public function sampah()
    {
        return $this->belongsTo(Sampah::class, 'sampah_id');
    }
}
