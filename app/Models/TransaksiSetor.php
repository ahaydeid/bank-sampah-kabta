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

    protected $casts = [
        'foto_bukti' => 'json',
        'tanggal_waktu' => 'datetime',
    ];

    public function getFotoBuktiAttribute($value)
    {
        if (is_array($value)) {
            $photos = $value;
        } else {
            $photos = json_decode($value, true) ?: [];
        }

        // Handle potential double encoding (if the database has a double-encoded string)
        if (is_string($photos)) {
            $decodeAgain = json_decode($photos, true);
            if (is_array($decodeAgain)) {
                $photos = $decodeAgain;
            }
        }

        // Ensure we always return an array
        if (!is_array($photos)) {
            $photos = [];
        }

        return array_map(function ($photo) {
            if (!is_string($photo)) {
                return $photo;
            }
            if (str_starts_with($photo, 'http')) {
                return $photo;
            }
            return url($photo);
        }, $photos);
    }

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
