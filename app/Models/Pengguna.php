<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use Notifiable, HasRoles, HasApiTokens;

    protected $table = 'pengguna';

    protected $guard_name = 'web';

    protected $fillable = [
        'username',
        'email',
        'password',
        'peran',
        'is_aktif',
        'first_login_at',
    ];

    protected $appends = ['role_name'];

    public function getRoleNameAttribute()
    {
        return $this->getRoleNames()->first() ?: $this->peran;
    }

    protected $casts = [
        'first_login_at' => 'datetime',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function profil()
    {
        return $this->hasOne(Profil::class, 'pengguna_id');
    }
}
