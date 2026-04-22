<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\LogsActivity;

class Pengguna extends Authenticatable
{
    use Notifiable, HasRoles, HasApiTokens, LogsActivity;

    public const SUPERADMIN = 'superadmin';
    public const ADMIN = 'admin';
    public const PETUGAS = 'petugas';
    public const MEMBER = 'member';

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

    public function isSuperAdmin(): bool
    {
        return $this->peran === self::SUPERADMIN;
    }

    public function isAdminLevel(): bool
    {
        return in_array($this->peran, [self::SUPERADMIN, self::ADMIN], true);
    }

    public function allowedManagedStaffRoles(): array
    {
        if ($this->isSuperAdmin()) {
            return [self::SUPERADMIN, self::ADMIN, self::PETUGAS];
        }

        return [self::ADMIN, self::PETUGAS];
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
