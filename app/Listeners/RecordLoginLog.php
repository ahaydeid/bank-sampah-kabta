<?php

namespace App\Listeners;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Request;

class RecordLoginLog
{
    /**
     * Handle the Login event.
     * Deduplicate: hanya simpan 1 log per user per 10 detik untuk mencegah double entry.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // Cegah duplikasi: cek apakah sudah ada log login untuk user ini dalam 10 detik terakhir
        $recentLog = LoginLog::where('pengguna_id', $user->id)
            ->where('event', 'login')
            ->where('created_at', '>=', now()->subSeconds(10))
            ->exists();

        if ($recentLog) {
            return; // Skip — sudah tercatat
        }

        LoginLog::create([
            'pengguna_id' => $user->id,
            'nama_user'   => $user->profil?->nama ?? $user->username ?? $user->email ?? 'User #' . $user->id,
            'event'       => 'login',
            'ip_address'  => Request::ip(),
            'user_agent'  => Request::userAgent(),
            'status'      => 'berhasil',
            'created_at'  => now(),
        ]);
    }
}
