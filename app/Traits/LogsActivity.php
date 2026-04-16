<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Trait LogsActivity
 *
 * Secara otomatis mencatat event created, updated, deleted
 * ke tabel activity_logs. Cukup `use LogsActivity` pada model.
 */
trait LogsActivity
{
    /**
     * Boot trait — register model event listeners.
     */
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            static::recordActivity($model, 'dibuat');
        });

        static::updated(function ($model) {
            // Hanya catat jika ada perubahan nyata (bukan hanya timestamps)
            $changes = $model->getChanges();
            unset($changes['updated_at'], $changes['created_at']);

            if (!empty($changes)) {
                static::recordActivity($model, 'diperbarui');
            }
        });

        static::deleted(function ($model) {
            static::recordActivity($model, 'dihapus');
        });
    }

    /**
     * Record activity ke database.
     */
    protected static function recordActivity($model, string $aksi): void
    {
        $user = Auth::user();
        $namaUser = 'Sistem';
        $penggunaId = null;

        if ($user) {
            $penggunaId = $user->id;
            $namaUser = $user->profil?->nama ?? $user->username ?? $user->email ?? 'User #' . $user->id;
        }

        $modul = static::getActivityModuleName();
        $deskripsi = static::buildActivityDescription($model, $aksi, $modul);

        $dataLama = null;
        $dataBaru = null;

        if ($aksi === 'diperbarui') {
            $dataLama = collect($model->getOriginal())
                ->only(array_keys($model->getChanges()))
                ->except(['updated_at', 'created_at', 'password'])
                ->toArray();

            $dataBaru = collect($model->getChanges())
                ->except(['updated_at', 'created_at', 'password'])
                ->toArray();
        } elseif ($aksi === 'dibuat') {
            $dataBaru = collect($model->getAttributes())
                ->except(['password', 'remember_token'])
                ->toArray();
        } elseif ($aksi === 'dihapus') {
            $dataLama = collect($model->getOriginal())
                ->except(['password', 'remember_token'])
                ->toArray();
        }

        try {
            ActivityLog::create([
                'pengguna_id' => $penggunaId,
                'nama_user'   => $namaUser,
                'modul'       => $modul,
                'aksi'        => $aksi,
                'deskripsi'   => $deskripsi,
                'data_lama'   => $dataLama,
                'data_baru'   => $dataBaru,
                'ip_address'  => Request::ip(),
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            // Jangan sampai logging error mengganggu operasi utama
            \Illuminate\Support\Facades\Log::warning('Gagal mencatat activity log: ' . $e->getMessage());
        }
    }

    /**
     * Nama modul yang ditampilkan di log.
     * Override di model jika ingin custom.
     */
    protected static function getActivityModuleName(): string
    {
        return class_basename(static::class);
    }

    /**
     * Build deskripsi aktivitas.
     * Override di model jika ingin custom.
     */
    protected static function buildActivityDescription($model, string $aksi, string $modul): string
    {
        $label = $model->nama ?? $model->kode_transaksi ?? $model->kode_penukaran ?? $model->username ?? '#' . ($model->id ?? '?');

        $aksiLabel = match ($aksi) {
            'dibuat'     => 'Menambahkan',
            'diperbarui' => 'Memperbarui',
            'dihapus'    => 'Menghapus',
            default      => $aksi,
        };

        return "{$aksiLabel} {$modul}: {$label}";
    }
}
