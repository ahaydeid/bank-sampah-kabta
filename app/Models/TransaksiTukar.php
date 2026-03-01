<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiTukar extends Model
{
    protected $table = 'transaksi_tukar';

    protected $fillable = [
        'kode_penukaran',
        'member_id',
        'admin_id',
        'petugas_id',
        'pos_id',
        'tanggal',
        'total_poin',
        'expired_at',
        'tanggal_selesai',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
        'expired_at' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'total_poin' => 'integer',
    ];

    protected $appends = ['status_label'];

    public function getStatusLabelAttribute()
    {
        if ($this->tanggal_selesai) {
            return 'Selesai';
        }

        if ($this->status === 'disetujui') {
            return 'Disetujui';
        }

        if ($this->status === 'dibatalkan') {
            return 'Ditolak';
        }

        return ucfirst($this->status);
    }

    public function member()
    {
        return $this->belongsTo(Pengguna::class, 'member_id');
    }

    public function admin()
    {
        return $this->belongsTo(Pengguna::class, 'admin_id');
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
        return $this->hasMany(TransaksiTukarDetail::class, 'transaksi_tukar_id');
    }
}
