<?php

namespace App\Services;

use App\Models\Pengguna;
use App\Models\RewardStok;
use App\Models\TransaksiSetor;
use App\Models\TransaksiTukar;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    /**
     * Ambil semua notifikasi real-time (tanpa tabel notifikasi)
     */
    public function getNotifications($dismissedIds)
    {
        $notifications = [];
        $now = now();

        // 1. Setoran Sampah Pending (24 jam terakhir)
        $setoranPending = TransaksiSetor::where('status', 'pending')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->select('id', 'kode_transaksi', 'total_berat', 'tanggal_waktu', 'member_id')
            ->with(['member:id', 'member.profil:id,pengguna_id,nama'])
            ->orderByDesc('tanggal_waktu')
            ->limit(10)
            ->get();

        foreach ($setoranPending as $setor) {
            $id = 'setor-' . $setor->id;
            if (in_array($id, $dismissedIds)) continue;

            $nama = $setor->member?->profil?->nama ?? 'Member';
            $notifications[] = [
                'id'    => $id,
                'type'  => 'setoran',
                'icon'  => 'recycle',
                'color' => 'emerald',
                'title' => 'Setoran Baru',
                'message' => "{$nama} menyetor {$setor->total_berat} kg sampah",
                'url'   => route('operasional.setoran.show', $setor->id),
                'time'  => $setor->tanggal_waktu->toISOString(),
            ];
        }

        // 2. Tukar Poin Menunggu (24 jam terakhir)
        $tukarMenunggu = TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->select('id', 'kode_penukaran', 'total_poin', 'tanggal', 'member_id')
            ->with(['member:id', 'member.profil:id,pengguna_id,nama'])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get();

        foreach ($tukarMenunggu as $tukar) {
            $id = 'tukar-' . $tukar->id;
            if (in_array($id, $dismissedIds)) continue;

            $nama = $tukar->member?->profil?->nama ?? 'Member';
            $notifications[] = [
                'id'    => $id,
                'type'  => 'tukar_poin',
                'icon'  => 'wallet',
                'color' => 'blue',
                'title' => 'Permintaan Tukar Poin',
                'message' => "{$nama} minta tukar {$tukar->total_poin} poin",
                'url'   => route('operasional.tukar-poin.show', $tukar->id),
                'time'  => $tukar->tanggal->toISOString(),
            ];
        }

        // 3. Stok Sembako Menipis (< 5)
        $stokRendah = RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->select('id', 'reward_id', 'pos_id', 'stok')
            ->with(['reward:id,nama_reward', 'pos:id,nama_pos'])
            ->orderBy('stok')
            ->limit(10)
            ->get();

        foreach ($stokRendah as $stok) {
            $id = 'stok-' . $stok->id;
            if (in_array($id, $dismissedIds)) continue;

            $namaReward = $stok->reward?->nama_reward ?? 'Barang';
            $namaPos = $stok->pos?->nama_pos ?? 'Pos';
            $notifications[] = [
                'id'    => $id,
                'type'  => 'stok_rendah',
                'icon'  => 'alert-triangle',
                'color' => 'amber',
                'title' => 'Stok Menipis',
                'message' => "{$namaReward} tersisa {$stok->stok} di {$namaPos}",
                'url'   => route('operasional.stok-sembako', ['pos_id' => $stok->pos_id]),
                'time'  => $now->toISOString(),
            ];
        }

        // 4. Stok Sembako Habis (= 0)
        $stokHabis = RewardStok::where('stok', 0)
            ->select('id', 'reward_id', 'pos_id', 'stok')
            ->with(['reward:id,nama_reward', 'pos:id,nama_pos'])
            ->limit(5)
            ->get();

        foreach ($stokHabis as $stok) {
            $id = 'stokhabis-' . $stok->id;
            if (in_array($id, $dismissedIds)) continue;

            $namaReward = $stok->reward?->nama_reward ?? 'Barang';
            $namaPos = $stok->pos?->nama_pos ?? 'Pos';
            $notifications[] = [
                'id'    => $id,
                'type'  => 'stok_habis',
                'icon'  => 'package-x',
                'color' => 'red',
                'title' => 'Stok Habis!',
                'message' => "{$namaReward} habis di {$namaPos}",
                'url'   => route('operasional.stok-sembako', ['pos_id' => $stok->pos_id]),
                'time'  => $now->toISOString(),
            ];
        }

        // 5. Member Baru (24 jam terakhir)
        $memberBaru = Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->select('id', 'created_at')
            ->with('profil:id,pengguna_id,nama')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        foreach ($memberBaru as $member) {
            $id = 'member-' . $member->id;
            if (in_array($id, $dismissedIds)) continue;

            $nama = $member->profil?->nama ?? 'Member Baru';
            $notifications[] = [
                'id'    => $id,
                'type'  => 'member_baru',
                'icon'  => 'user-plus',
                'color' => 'violet',
                'title' => 'Member Baru Terdaftar',
                'message' => "{$nama} baru saja mendaftar",
                'url'   => route('master.nasabah.show', $member->id),
                'time'  => $member->created_at->toISOString(),
            ];
        }

        usort($notifications, fn($a, $b) => strcmp($b['time'], $a['time']));

        return $notifications;
    }

    /**
     * Ambil semua ID notifikasi aktif saat ini.
     */
    public function getCurrentNotificationIds(): array
    {
        $ids = [];
        $now = now();

        $ids = array_merge($ids, TransaksiSetor::where('status', 'pending')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'setor-' . $id)->toArray());

        $ids = array_merge($ids, TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'tukar-' . $id)->toArray());

        $ids = array_merge($ids, RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->pluck('id')->map(fn($id) => 'stok-' . $id)->toArray());

        $ids = array_merge($ids, RewardStok::where('stok', 0)
            ->pluck('id')->map(fn($id) => 'stokhabis-' . $id)->toArray());

        $ids = array_merge($ids, Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'member-' . $id)->toArray());

        return $ids;
    }

    /**
     * Hitung jumlah notifikasi yang belum dibaca/dismiss
     */
    public function getUnreadCount($userId): int
    {
        $now = now();
        $dismissed = Cache::get("notifications_dismissed_{$userId}", []);
        $readIds = Cache::get("notifications_read_{$userId}", []);
        $ignored = array_merge($dismissed, $readIds);

        $count = 0;

        $count += TransaksiSetor::where('status', 'pending')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'setor-' . $id)->diff($ignored)->count();

        $count += TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'tukar-' . $id)->diff($ignored)->count();

        $count += RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->pluck('id')->map(fn($id) => 'stok-' . $id)->diff($ignored)->count();

        $count += RewardStok::where('stok', 0)
            ->pluck('id')->map(fn($id) => 'stokhabis-' . $id)->diff($ignored)->count();

        $count += Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->pluck('id')->map(fn($id) => 'member-' . $id)->diff($ignored)->count();

        return $count;
    }
}
