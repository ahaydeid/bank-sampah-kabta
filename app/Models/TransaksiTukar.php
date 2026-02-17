<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiTukar extends Model
{
    protected $table = 'transaksi_tukar';

    protected $fillable = [
        'kode_penukaran',
        'member_id',
        'tanggal',
        'total_poin',
        'status',
    ];

    public function member()
    {
        return $this->belongsTo(Pengguna::class, 'member_id');
    }

    public function detail()
    {
        return $this->hasMany(TransaksiTukarDetail::class, 'transaksi_tukar_id');
    }
}
