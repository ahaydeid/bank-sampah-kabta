<?php

namespace App\Http\Controllers;

use App\Models\TransaksiSetor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TransaksiSetorController extends Controller
{
    public function index(Request $request)
    {
        $query = TransaksiSetor::with(['member.profil', 'petugas.profil', 'pos'])
            ->latest('tanggal_waktu');

        if ($request->date_filter === 'today') {
            $query->whereDate('tanggal_waktu', now());
        }

        if ($request->search) {
            $search = strtolower($request->search);
            $query->where(DB::raw('LOWER(kode_transaksi)'), 'like', "%{$search}%")
                ->orWhereHas('member.profil', function ($q) use ($search) {
                    $q->where(DB::raw('LOWER(nama)'), 'like', "%{$search}%");
                });
        }

        $transaksi = $query->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Operasional/Setoran/Index', [
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
            'filters' => $request->only(['search', 'per_page', 'date_filter']),
        ]);
    }

    public function show($id)
    {
        $transaksi = TransaksiSetor::with(['member.profil', 'petugas.profil', 'pos', 'detail.sampah'])
            ->findOrFail($id);

        return Inertia::render('Operasional/Setoran/Show', [
            'transaksi' => $transaksi,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:berhasil,dibatalkan',
        ]);

        $transaksi = TransaksiSetor::findOrFail($id);
        $transaksi->update(['status' => $request->status]);

        $label = $request->status == 'berhasil' ? 'disetujui' : 'dibatalkan';
        return back()->with('success', "Transaksi berhasil {$label}");
    }

}
