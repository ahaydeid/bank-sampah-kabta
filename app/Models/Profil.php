<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profil extends Model
{
    protected $table = 'profil';

    protected $fillable = [
        'pengguna_id',
        'nama',
        'nik',
        'alamat',
        'no_hp',
        'jabatan',
        'saldo_poin',
        'token_qr',
        'foto_profil',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
