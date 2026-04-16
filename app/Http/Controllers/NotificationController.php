<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use App\Models\RewardStok;
use App\Models\TransaksiSetor;
use App\Models\TransaksiTukar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class NotificationController extends Controller
{
    /**
     * Ambil semua notifikasi real-time.
     * Query dari data existing, tanpa tabel notifikasi terpisah — zero duplikasi.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = [];
        $now = now();

        // ─── 1. Setoran Sampah Pending (24 jam terakhir) ──────────────
        $setoranPending = TransaksiSetor::where('status', 'berhasil')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->select('id', 'kode_transaksi', 'total_berat', 'tanggal_waktu', 'member_id')
            ->with(['member:id', 'member.profil:id,pengguna_id,nama'])
            ->orderByDesc('tanggal_waktu')
            ->limit(10)
            ->get();

        foreach ($setoranPending as $setor) {
            $nama = $setor->member?->profil?->nama ?? 'Member';
            $notifications[] = [
                'id'    => 'setor-' . $setor->id,
                'type'  => 'setoran',
                'icon'  => 'recycle',
                'color' => 'emerald',
                'title' => 'Setoran Baru',
                'message' => "{$nama} menyetor {$setor->total_berat} kg sampah",
                'url'   => route('operasional.setoran.show', $setor->id),
                'time'  => $setor->tanggal_waktu->toISOString(),
            ];
        }

        // ─── 2. Tukar Poin Menunggu (24 jam terakhir) ─────────────────
        $tukarMenunggu = TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->select('id', 'kode_penukaran', 'total_poin', 'tanggal', 'member_id')
            ->with(['member:id', 'member.profil:id,pengguna_id,nama'])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get();

        foreach ($tukarMenunggu as $tukar) {
            $nama = $tukar->member?->profil?->nama ?? 'Member';
            $notifications[] = [
                'id'    => 'tukar-' . $tukar->id,
                'type'  => 'tukar_poin',
                'icon'  => 'wallet',
                'color' => 'blue',
                'title' => 'Permintaan Tukar Poin',
                'message' => "{$nama} minta tukar {$tukar->total_poin} poin",
                'url'   => route('operasional.tukar-poin.show', $tukar->id),
                'time'  => $tukar->tanggal->toISOString(),
            ];
        }

        // ─── 3. Stok Sembako Menipis (< 5) ────────────────────────────
        $stokRendah = RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->select('id', 'reward_id', 'pos_id', 'stok')
            ->with(['reward:id,nama_reward', 'pos:id,nama_pos'])
            ->orderBy('stok')
            ->limit(10)
            ->get();

        foreach ($stokRendah as $stok) {
            $namaReward = $stok->reward?->nama_reward ?? 'Barang';
            $namaPos = $stok->pos?->nama_pos ?? 'Pos';
            $notifications[] = [
                'id'    => 'stok-' . $stok->id,
                'type'  => 'stok_rendah',
                'icon'  => 'alert-triangle',
                'color' => 'amber',
                'title' => 'Stok Menipis',
                'message' => "{$namaReward} tersisa {$stok->stok} di {$namaPos}",
                'url'   => route('operasional.stok-sembako', ['pos_id' => $stok->pos_id]),
                'time'  => $now->toISOString(),
            ];
        }

        // ─── 4. Stok Sembako Habis (= 0) ──────────────────────────────
        $stokHabis = RewardStok::where('stok', 0)
            ->select('id', 'reward_id', 'pos_id', 'stok')
            ->with(['reward:id,nama_reward', 'pos:id,nama_pos'])
            ->limit(5)
            ->get();

        foreach ($stokHabis as $stok) {
            $namaReward = $stok->reward?->nama_reward ?? 'Barang';
            $namaPos = $stok->pos?->nama_pos ?? 'Pos';
            $notifications[] = [
                'id'    => 'stokhabis-' . $stok->id,
                'type'  => 'stok_habis',
                'icon'  => 'package-x',
                'color' => 'red',
                'title' => 'Stok Habis!',
                'message' => "{$namaReward} habis di {$namaPos}",
                'url'   => route('operasional.stok-sembako', ['pos_id' => $stok->pos_id]),
                'time'  => $now->toISOString(),
            ];
        }

        // ─── 5. Member Baru (24 jam terakhir) ─────────────────────────
        $memberBaru = Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->select('id', 'created_at')
            ->with('profil:id,pengguna_id,nama')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        foreach ($memberBaru as $member) {
            $nama = $member->profil?->nama ?? 'Member Baru';
            $notifications[] = [
                'id'    => 'member-' . $member->id,
                'type'  => 'member_baru',
                'icon'  => 'user-plus',
                'color' => 'violet',
                'title' => 'Member Baru Terdaftar',
                'message' => "{$nama} baru saja mendaftar",
                'url'   => route('master.nasabah.edit', $member->id),
                'time'  => $member->created_at->toISOString(),
            ];
        }

        // Sort by time descending
        usort($notifications, fn($a, $b) => strcmp($b['time'], $a['time']));

        // Get dismissed IDs from session
        $dismissed = $request->session()->get('dismissed_notifications', []);
        $notifications = array_values(array_filter($notifications, fn($n) => !in_array($n['id'], $dismissed)));

        $readIds = $request->session()->get('read_notifications', []);
        
        // Count unread notifications
        $unreadCount = 0;
        foreach ($notifications as $notif) {
            if (!in_array($notif['id'], $readIds)) {
                $unreadCount++;
            }
        }

        return response()->json([
            'notifications' => $notifications, // Still returns all (unless dismissed)
            'count' => $unreadCount,
        ]);
    }

    /**
     * Tandai semua notifikasi sebagai dibaca / dismiss semua.
     */
    public function dismissAll(Request $request): JsonResponse
    {
        // Ambil semua notifikasi aktif lalu simpan ID-nya ke session
        $current = $this->getCurrentNotificationIds();
        $request->session()->put('dismissed_notifications', $current);

        return response()->json(['success' => true]);
    }

    /**
     * Tandai semua notifikasi sebagai dibaca.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $current = $this->getCurrentNotificationIds();
        $readIds = $request->session()->get('read_notifications', []);
        
        $merged = array_unique(array_merge($readIds, $current));
        $request->session()->put('read_notifications', $merged);

        return response()->json(['success' => true]);
    }

    /**
     * Dismiss satu notifikasi.
     */
    public function dismiss(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|string']);

        $dismissed = $request->session()->get('dismissed_notifications', []);
        $dismissed[] = $request->id;
        $request->session()->put('dismissed_notifications', array_unique($dismissed));

        return response()->json(['success' => true]);
    }

    /**
     * Helper: ambil semua ID notifikasi aktif saat ini.
     */
    private function getCurrentNotificationIds(): array
    {
        $ids = [];
        $now = now();

        // Setoran pending
        $ids = array_merge($ids, TransaksiSetor::where('status', 'berhasil')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'setor-' . $id)->toArray());

        // Tukar menunggu
        $ids = array_merge($ids, TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'tukar-' . $id)->toArray());

        // Stok rendah
        $ids = array_merge($ids, RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->pluck('id')
            ->map(fn($id) => 'stok-' . $id)->toArray());

        // Stok habis
        $ids = array_merge($ids, RewardStok::where('stok', 0)
            ->pluck('id')
            ->map(fn($id) => 'stokhabis-' . $id)->toArray());

        // Member baru
        $ids = array_merge($ids, Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'member-' . $id)->toArray());

        return $ids;
    }

    /**
     * Static helper untuk Inertia shared props — hitung notifikasi count (ringan).
     */
    public static function getNotificationCount(?int $userId = null): int
    {
        $now = now();
        $dismissed = session('dismissed_notifications', []);
        $readIds = session('read_notifications', []);
        $ignored = array_merge($dismissed, $readIds);

        $count = 0;

        // Count setoran pending
        $setoranIds = TransaksiSetor::where('status', 'berhasil')
            ->where('tanggal_waktu', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'setor-' . $id)
            ->diff($ignored)
            ->count();
        $count += $setoranIds;

        // Count tukar menunggu
        $tukarIds = TransaksiTukar::where('status', 'menunggu')
            ->where('tanggal', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'tukar-' . $id)
            ->diff($ignored)
            ->count();
        $count += $tukarIds;

        // Count stok rendah + habis
        $stokRendahIds = RewardStok::where('stok', '<', 5)
            ->where('stok', '>', 0)
            ->pluck('id')
            ->map(fn($id) => 'stok-' . $id)
            ->diff($ignored)
            ->count();
        $count += $stokRendahIds;

        $stokHabisIds = RewardStok::where('stok', 0)
            ->pluck('id')
            ->map(fn($id) => 'stokhabis-' . $id)
            ->diff($ignored)
            ->count();
        $count += $stokHabisIds;

        // Count member baru
        $memberIds = Pengguna::where('peran', 'member')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->pluck('id')
            ->map(fn($id) => 'member-' . $id)
            ->diff($ignored)
            ->count();
        $count += $memberIds;

        return $count;
    }
}
