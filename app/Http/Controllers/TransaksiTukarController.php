<?php

namespace App\Http\Controllers;

use App\Models\TransaksiTukar;
use App\Models\Reward;
use App\Services\SettingService;
use App\Services\TransaksiTukarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiTukarController extends Controller
{
    protected $tukarService;

    public function __construct(TransaksiTukarService $tukarService)
    {
        $this->tukarService = $tukarService;
    }

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
            if ($request->status == 'selesai') {
                $query->where('status', 'disetujui')->whereNotNull('tanggal_selesai');
            } elseif ($request->status == 'disetujui') {
                $query->where('status', 'disetujui')->whereNull('tanggal_selesai');
            } else {
                $query->where('status', $request->status);
            }
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
        try {
            $this->tukarService->approve($id, auth()->id());
            return back()->with('success', 'Permintaan penukaran berhasil disetujui.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $this->tukarService->reject($id, auth()->id());
            return back()->with('success', 'Permintaan penukaran berhasil ditolak dan poin telah dikembalikan.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function undoApprove(Request $request, $id)
    {
        try {
            $this->tukarService->undoApprove($id);
            return back()->with('success', 'Persetujuan dibatalkan. Status kembali menjadi "Menunggu".');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function undoReject(Request $request, $id)
    {
        try {
            $this->tukarService->undoReject($id);
            return back()->with('success', 'Penolakan dibatalkan. Status kembali menjadi "Menunggu".');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function finalize(Request $request, $id)
    {
        try {
            $this->tukarService->finalizeReject($id, auth()->id());
            return back()->with('success', 'Transaksi penolakan berhasil diselesaikan.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
