<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class KuisQuestion extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'kuis_questions';

    protected $fillable = [
        'pertanyaan',
        'opsi_a',
        'opsi_b',
        'opsi_c',
        'opsi_d',
        'jawaban_benar',
        'penjelasan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
