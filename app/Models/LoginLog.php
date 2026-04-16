<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    protected $table = 'login_logs';

    /**
     * Only created_at is used, no updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'pengguna_id',
        'nama_user',
        'event',
        'ip_address',
        'user_agent',
        'status',
        'created_at',
    ];

    protected $casts = [
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
