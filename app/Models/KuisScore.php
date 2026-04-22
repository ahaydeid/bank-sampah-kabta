<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class KuisScore extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'kuis_scores';

    protected $fillable = [
        'pengguna_id',
        'skor',
        'benar',
        'salah',
        'poin_didapat',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
