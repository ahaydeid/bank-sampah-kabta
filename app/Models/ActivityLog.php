<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    /**
     * Only created_at is used, no updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'pengguna_id',
        'nama_user',
        'modul',
        'aksi',
        'deskripsi',
        'data_lama',
        'data_baru',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'data_lama' => 'array',
        'data_baru' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Relasi ke Pengguna.
     */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
