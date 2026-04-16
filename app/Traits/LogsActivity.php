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
     * Atribut yang tidak boleh masuk ke activity log.
     */
    protected static array $activityLogExcludedAttributes = [
        'password',
        'remember_token',
        'token_qr',
        'nik',
        'alamat',
        'no_hp',
        'email',
        'foto_profil',
    ];

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
                ->toArray();

            $dataBaru = collect($model->getChanges())
                ->toArray();
        } elseif ($aksi === 'dibuat') {
            $dataBaru = $model->getAttributes();
        } elseif ($aksi === 'dihapus') {
            $dataLama = $model->getOriginal();
        }

        $dataLama = static::sanitizeActivityData($dataLama);
        $dataBaru = static::sanitizeActivityData($dataBaru);

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

    /**
     * Filter atribut sensitif dan noisy dari payload log.
     */
    protected static function sanitizeActivityData(?array $data): ?array
    {
        if ($data === null) {
            return null;
        }

        $sanitized = collect($data)
            ->except(['updated_at', 'created_at', ...static::$activityLogExcludedAttributes])
            ->toArray();

        return empty($sanitized) ? null : $sanitized;
    }
}
