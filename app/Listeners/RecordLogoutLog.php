<?php

namespace App\Listeners;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Request;

class RecordLogoutLog
{
    /**
     * Handle the Logout event.
     * Deduplicate: hanya simpan 1 log per user per 10 detik untuk mencegah double entry.
     */
    public function handle(Logout $event): void
    {
        $user = $event->user;

        if (!$user) {
            return;
        }

        // Cegah duplikasi: cek apakah sudah ada log logout untuk user ini dalam 10 detik terakhir
        $recentLog = LoginLog::where('pengguna_id', $user->id)
            ->where('event', 'logout')
            ->where('created_at', '>=', now()->subSeconds(10))
            ->exists();

        if ($recentLog) {
            return; // Skip — sudah tercatat
        }

        LoginLog::create([
            'pengguna_id' => $user->id,
            'nama_user'   => $user->profil?->nama ?? $user->username ?? $user->email ?? 'User #' . $user->id,
            'event'       => 'logout',
            'ip_address'  => Request::ip(),
            'user_agent'  => Request::userAgent(),
            'status'      => 'berhasil',
            'created_at'  => now(),
        ]);
    }
}
