<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sampah extends Model
{
    protected $table = 'sampah';

    protected $fillable = [
        'nama_sampah',
        'kategori',
        'poin_per_satuan',
    ];
}
