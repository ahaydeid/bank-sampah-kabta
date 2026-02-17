<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiSetor extends Model
{
    protected $table = 'transaksi_setor';

    protected $fillable = [
        'kode_transaksi',
        'member_id',
        'petugas_id',
        'pos_id',
        'total_berat',
        'total_poin',
        'tanggal_waktu',
        'foto_bukti',
        'status',
    ];

    public function member()
    {
        return $this->belongsTo(Pengguna::class, 'member_id');
    }

    public function petugas()
    {
        return $this->belongsTo(Pengguna::class, 'petugas_id');
    }

    public function pos()
    {
        return $this->belongsTo(PosLokasi::class, 'pos_id');
    }

    public function detail()
    {
        return $this->hasMany(TransaksiSetorDetail::class, 'transaksi_setor_id');
    }
}
