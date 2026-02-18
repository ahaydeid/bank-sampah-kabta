<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosLokasi extends Model
{
    protected $table = 'pos_lokasi';

    protected $fillable = [
        'nama_pos',
        'kode_pos',
        'alamat',
        'latitude',
        'longitude',
        'is_aktif',
    ];

    public function rewards()
    {
        return $this->belongsToMany(Reward::class, 'reward_stok', 'pos_id', 'reward_id')
                    ->withPivot('stok')
                    ->withTimestamps();
    }
}
