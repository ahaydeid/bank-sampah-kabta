<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    protected $table = 'reward';

    protected $fillable = [
        'nama_reward',
        'stok',
        'poin_tukar',
        'kategori_reward',
    ];
}
