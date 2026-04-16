<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Sampah extends Model
{
    use LogsActivity;
    protected $table = 'sampah';

    protected $fillable = [
        'nama_sampah',
        'kategori',
        'poin_per_satuan',
    ];

    protected $casts = [
        'poin_per_satuan' => 'integer',
    ];
}
