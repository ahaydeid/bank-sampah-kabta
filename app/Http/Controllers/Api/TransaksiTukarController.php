<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\TransaksiTukar;
use App\Models\TransaksiTukarDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransaksiTukarController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.reward_id' => 'required|exists:reward,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'pos_id' => 'required|exists:pos_lokasi,id',
        ]);

        $user = $request->user();
        $profil = $user->profil;

        if (!$profil) {
            return response()->json(['message' => 'Profil nasabah tidak ditemukan.'], 404);
        }

        $pos = \App\Models\PosLokasi::findOrFail($request->pos_id);

        return DB::transaction(function () use ($request, $profil, $user, $pos) {
            $totalPoin = 0;
            $itemsToTukar = [];

            foreach ($request->items as $item) {
                // Check stock specifically at the requested POS
                $rewardStok = \App\Models\RewardStok::where('reward_id', $item['reward_id'])
                    ->where('pos_id', $pos->id)
                    ->lockForUpdate()
                    ->first();
                
                $reward = Reward::find($item['reward_id']); // Keep for basic info like poin_tukar

                if (!$rewardStok || $rewardStok->stok < $item['jumlah']) {
                     // Check if reward exists generally to give better error
                    if (!$reward) {
                         throw new \Exception("Barang tidak ditemukan.");
                    }
                    throw new \Exception("Stok {$reward->nama_reward} di lokasi ini tidak mencukupi.");
                }

                $subtotal = $reward->poin_tukar * $item['jumlah'];
                $totalPoin += $subtotal;

                $itemsToTukar[] = [
                    'reward_id' => $reward->id,
                    'jumlah' => $item['jumlah'],
                    'poin_per_item' => $reward->poin_tukar,
                    'subtotal_poin' => $subtotal,
                ];
            }

            if ($profil->saldo_poin < $totalPoin) {
                throw new \Exception("Saldo poin tidak mencukupi. (Saldo: {$profil->saldo_poin}, Butuh: {$totalPoin})");
            }

            // 1. Potong saldo poin Nasabah
            $profil->decrement('saldo_poin', $totalPoin);

            // 2. Generate Kode Penukaran: TKR-YYMMDDXXNNN
            $dateCode = now()->format('ymd'); // 260218
            $posCode = str_pad($pos->kode_pos, 2, '0', STR_PAD_LEFT); // Ensure 2 digits
            $prefix = "TKR-{$dateCode}{$posCode}";

            // Find last sequence
            $lastTransaction = TransaksiTukar::where('kode_penukaran', 'like', "{$prefix}%")
                ->orderBy('kode_penukaran', 'desc')
                ->first();

            $sequence = 1;
            if ($lastTransaction) {
                // Extract last 3 digits
                $lastSequence = intval(substr($lastTransaction->kode_penukaran, -3));
                $sequence = $lastSequence + 1;
            }

            $urutan = str_pad($sequence, 3, '0', STR_PAD_LEFT);
            $kodePenukaran = "{$prefix}{$urutan}";

            // 3. Buat record TransaksiTukar
            $transaksi = TransaksiTukar::create([
                'kode_penukaran' => $kodePenukaran,
                'member_id' => $user->id,
                'tanggal' => now(),
                'total_poin' => $totalPoin,
                'status' => 'menunggu',
                'pos_id' => $pos->id,
            ]);

            // 3. Buat record Detail
            foreach ($itemsToTukar as $item) {
                $transaksi->detail()->create($item);
            }

            return response()->json([
                'message' => 'Checkout berhasil, menunggu konfirmasi admin.',
                'data' => $transaksi->load('detail.reward')
            ]);
        }, 5); // Retry 5 times on deadlock
    }

    public function history(Request $request)
    {
        $transaksi = TransaksiTukar::with('detail.reward')
            ->where('member_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($transaksi);
    }

    public function showQr(Request $request, $id)
    {
        $transaksi = TransaksiTukar::with('detail.reward')
            ->where('member_id', $request->user()->id)
            ->findOrFail($id);

        if ($transaksi->status !== 'disetujui') {
            return response()->json([
                'message' => 'QR Code hanya tersedia untuk transaksi yang sudah disetujui.',
                'status' => $transaksi->status
            ], 403);
        }

        // Bonus: Calculate remaining time for countdown
        $remainingSeconds = now()->diffInSeconds($transaksi->expired_at, false);

        return response()->json([
            'data' => $transaksi,
            'qr_data' => $transaksi->kode_penukaran,
            'remaining_seconds' => max(0, $remainingSeconds),
            'is_expired' => $remainingSeconds <= 0
        ]);
    }

    // --- Petugas APIs ---

    public function scan(Request $request)
    {
        $request->validate([
            'kode_penukaran' => 'required|string',
        ]);

        $transaksi = TransaksiTukar::with(['member.profil', 'detail.reward'])
            ->where('kode_penukaran', $request->kode_penukaran)
            ->first();

        if (!$transaksi) {
            return response()->json(['message' => 'Kode penukaran tidak valid.'], 404);
        }

        if ($transaksi->status === 'kadaluwarsa') {
            return response()->json(['message' => 'Transaksi ini sudah kadaluwarsa.'], 422);
        }

        if ($transaksi->status !== 'disetujui') {
            return response()->json([
                'message' => 'Transaksi tidak dalam status siap tukar.',
                'status' => $transaksi->status
            ], 422);
        }

        // Double check runtime expiry (Safety)
        if (now()->greaterThan($transaksi->expired_at)) {
            return response()->json(['message' => 'Transaksi ini baru saja kadaluwarsa.'], 422);
        }

        return response()->json([
            'message' => 'Data ditemukan.',
            'data' => $transaksi
        ]);
    }

    public function konfirmasiAmbil(Request $request, $id)
    {
        $request->validate([
            'pos_id' => 'required|exists:pos_lokasi,id',
        ]);

        $transaksi = TransaksiTukar::findOrFail($id);

        if ($transaksi->status !== 'disetujui') {
            return response()->json(['message' => 'Transaksi tidak dalam status disetujui.'], 422);
        }

        if (now()->greaterThan($transaksi->expired_at)) {
            return response()->json(['message' => 'Transaksi sudah kadaluwarsa.'], 422);
        }

        $transaksi->update([
            'status' => 'selesai',
            'petugas_id' => $request->user()->id,
            'pos_id' => $request->pos_id,
        ]);

        return response()->json([
            'message' => 'Penukaran berhasil diselesaikan. Barang dapat diserahkan ke nasabah.',
            'data' => $transaksi
        ]);
    }
}
