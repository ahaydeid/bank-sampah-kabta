<?php

namespace App\Http\Controllers;

use App\Models\TransaksiTukar;
use App\Models\Reward;
use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiTukarController extends Controller
{
    public function index(Request $request)
    {
        $query = TransaksiTukar::with(['member.profil', 'admin.profil', 'petugas.profil', 'pos'])
            ->latest();

        if ($request->search) {
            $search = $request->search;
            $query->where('kode_penukaran', 'like', "%{$search}%")
                ->orWhereHas('member.profil', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $transaksi = $query->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Operasional/TukarPoin/Index', [
            'transaksi' => [
                'data' => $transaksi->items(),
                'links' => $transaksi->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $transaksi->currentPage(),
                    'from' => $transaksi->firstItem(),
                    'last_page' => $transaksi->lastPage(),
                    'per_page' => $transaksi->perPage(),
                    'to' => $transaksi->lastItem(),
                    'total' => $transaksi->total(),
                ],
            ],
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function show($id)
    {
        $transaksi = TransaksiTukar::with([
            'member.profil', 
            'admin.profil', 
            'petugas.profil', 
            'pos', 
            'detail.reward'
        ])->findOrFail($id);

        return Inertia::render('Operasional/TukarPoin/Show', [
            'transaksi' => $transaksi
        ]);
    }

    public function approve(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $transaksi = TransaksiTukar::with('detail.reward')->findOrFail($id);

            if ($transaksi->status !== 'menunggu') {
                return back()->with('error', 'Transaksi sudah diproses sebelumnya.');
            }

            // 1. Cek & Potong Stok Per POS
            foreach ($transaksi->detail as $detail) {
                $rewardStok = \App\Models\RewardStok::where('reward_id', $detail->reward_id)
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
                'admin_id' => auth()->id(),
                'expired_at' => $expiredAt,
            ]);

            return back()->with('success', 'Permintaan penukaran berhasil disetujui.');
        });
    }

    public function reject(Request $request, $id)
    {
        return DB::transaction(function () use ($id) {
            $transaksi = TransaksiTukar::with('member.profil')->findOrFail($id);

            if ($transaksi->status !== 'menunggu') {
                return back()->with('error', 'Transaksi sudah diproses sebelumnya.');
            }

            // Kembalikan Poin Nasabah
            $transaksi->member->profil->increment('saldo_poin', $transaksi->total_poin);

            $transaksi->update([
                'status' => 'dibatalkan',
                'admin_id' => auth()->id(),
            ]);

            return back()->with('success', 'Permintaan penukaran berhasil ditolak dan poin telah dikembalikan.');
        });
    }
}
