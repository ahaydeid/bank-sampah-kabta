<?php

namespace App\Services;

use App\Models\TransaksiTukar;
use App\Models\RewardStok;
use Illuminate\Support\Facades\DB;

class TransaksiTukarService
{
    /**
     * Setujui transaksi tukar poin
     */
    public function approve($id, $adminId)
    {
        return DB::transaction(function () use ($id, $adminId) {
            $transaksi = TransaksiTukar::with('detail.reward')->findOrFail($id);

            if ($transaksi->status !== 'menunggu') {
                throw new \Exception('Transaksi sudah diproses sebelumnya.');
            }

            // 1. Cek & Potong Stok Per POS
            foreach ($transaksi->detail as $detail) {
                $rewardStok = RewardStok::where('reward_id', $detail->reward_id)
                    ->where('pos_id', $transaksi->pos_id)
                    ->lockForUpdate()
                    ->first();

                if (!$rewardStok || $rewardStok->stok < $detail->jumlah) {
                    $namaReward = $detail->reward->nama_reward ?? 'Barang';
                    throw new \Exception("Stok {$namaReward} di pos ini tidak mencukupi untuk persetujuan ini.");
                }

                $rewardStok->decrement('stok', $detail->jumlah);
            }

            // 2. Hitung Expiry
            $hours = SettingService::penukaranPoinKadaluwarsaJam();
            $expiredAt = now()->addHours($hours);

            // 3. Update Status
            $transaksi->update([
                'status' => 'disetujui',
                'admin_id' => $adminId,
                'expired_at' => $expiredAt,
            ]);

            return $transaksi;
        });
    }

    /**
     * Tolak transaksi tukar poin
     */
    public function reject($id, $adminId)
    {
        return DB::transaction(function () use ($id, $adminId) {
            $transaksi = TransaksiTukar::with('member.profil')->findOrFail($id);

            if ($transaksi->status !== 'menunggu') {
                throw new \Exception('Transaksi sudah diproses sebelumnya.');
            }

            // Kembalikan Poin Nasabah
            $transaksi->member->profil->increment('saldo_poin', $transaksi->total_poin);

            $transaksi->update([
                'status' => 'dibatalkan',
                'admin_id' => $adminId,
            ]);

            return $transaksi;
        });
    }

    /**
     * Batalkan persetujuan
     */
    public function undoApprove($id)
    {
        return DB::transaction(function () use ($id) {
            $transaksi = TransaksiTukar::with(['detail.reward', 'member.profil'])->findOrFail($id);

            if ($transaksi->status !== 'disetujui') {
                throw new \Exception('Hanya transaksi dengan status "disetujui" yang dapat dibatalkan persetujuannya.');
            }

            if ($transaksi->tanggal_selesai) {
                throw new \Exception('Transaksi sudah selesai (barang sudah diambil), tidak dapat dibatalkan.');
            }

            // 1. Kembalikan Stok Per POS
            foreach ($transaksi->detail as $detail) {
                $rewardStok = RewardStok::where('reward_id', $detail->reward_id)
                    ->where('pos_id', $transaksi->pos_id)
                    ->lockForUpdate()
                    ->first();

                if ($rewardStok) {
                    $rewardStok->increment('stok', $detail->jumlah);
                }
            }

            // 2. Update Status kembali ke Menunggu
            $transaksi->update([
                'status' => 'menunggu',
                'admin_id' => null,
                'expired_at' => null,
            ]);

            return $transaksi;
        });
    }

    /**
     * Batalkan penolakan
     */
    public function undoReject($id)
    {
        return DB::transaction(function () use ($id) {
            $transaksi = TransaksiTukar::with(['member.profil'])->findOrFail($id);

            if ($transaksi->status !== 'dibatalkan') {
                throw new \Exception('Hanya transaksi dengan status "Ditolak" yang dapat dibatalkan penolakannya.');
            }

            if ($transaksi->tanggal_selesai) {
                throw new \Exception('Transaksi penolakan sudah diselesaikan, tidak dapat dibatalkan.');
            }

            // 1. Potong Kembali Poin Nasabah (karena saat ditolak, poin dikembalikan)
            if ($transaksi->member && $transaksi->member->profil) {
                if ($transaksi->member->profil->saldo_poin < $transaksi->total_poin) {
                    throw new \Exception('Poin nasabah tidak mencukupi untuk mengembalikan status ke Menunggu.');
                }
                $transaksi->member->profil->decrement('saldo_poin', $transaksi->total_poin);
            }

            // 2. Update Status kembali ke Menunggu
            $transaksi->update([
                'status' => 'menunggu',
                'admin_id' => null,
                'tanggal_selesai' => null,
            ]);

            return $transaksi;
        });
    }

    /**
     * Selesaikan transaksi yang ditolak
     */
    public function finalizeReject($id, $adminId)
    {
        return DB::transaction(function () use ($id, $adminId) {
            $transaksi = TransaksiTukar::findOrFail($id);

            if ($transaksi->status !== 'dibatalkan') {
                throw new \Exception('Hanya transaksi yang DITOLAK yang dapat diselesaikan manual oleh admin.');
            }

            if ($transaksi->tanggal_selesai) {
                throw new \Exception('Transaksi sudah diselesaikan sebelumnya.');
            }

            $transaksi->update([
                'tanggal_selesai' => now(),
                'admin_id' => $adminId,
            ]);

            return $transaksi;
        });
    }
}
