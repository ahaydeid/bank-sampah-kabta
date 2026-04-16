<?php

namespace App\Listeners;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Schema;

class RecordFailedLoginLog
{
    /**
     * Handle the Failed login event.
     */
    public function handle(Failed $event): void
    {
        try {
            if (!Schema::hasTable('login_logs')) {
                return;
            }

            LoginLog::create([
                'pengguna_id' => $event->user?->id,
                'nama_user'   => $event->credentials['email'] ?? $event->credentials['username'] ?? 'Tidak diketahui',
                'event'       => 'login_gagal',
                'ip_address'  => Request::ip(),
                'user_agent'  => Request::userAgent(),
                'status'      => 'gagal',
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Lewati pencatatan failed login log: ' . $e->getMessage());
        }
    }
}
