<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class PosLokasi extends Model
{
    use LogsActivity;
    protected $table = 'pos_lokasi';

    protected $fillable = [
        'nama_pos',
        'kode_pos',
        'alamat',
        'jadwal_buka',
        'jadwal_tutup',
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
