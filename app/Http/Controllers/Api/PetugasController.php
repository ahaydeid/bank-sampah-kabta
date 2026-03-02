<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransaksiSetor;
use App\Models\TransaksiTukar;
use Illuminate\Http\Request;

class PetugasController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $posId = $request->query('pos_id') ?: ($user->profil->pos_id ?? null);

        $querySetor = TransaksiSetor::whereDate('tanggal_waktu', now());
        $queryTukar = TransaksiTukar::whereDate('tanggal', now());

        if ($posId) {
            $querySetor->where('pos_id', $posId);
            $queryTukar->where('pos_id', $posId);
        }

        return response()->json([
            'data' => [
                'sampah_hari_ini' => (float)$querySetor->sum('total_berat'),
                'setor_hari_ini' => $querySetor->count(),
                'tukar_hari_ini' => $queryTukar->count(),
                'poin_hari_ini' => (int)$querySetor->sum('total_poin'),
            ]
        ]);
    }

    public function queue(Request $request)
    {
        $posId = $request->query('pos_id') ?: ($request->user()->profil->pos_id ?? null);
        
        $query = TransaksiTukar::with(['member.profil', 'detail'])
            ->where('status', 'disetujui') 
            ->whereNull('tanggal_selesai');

        if ($posId) {
            $query->where('pos_id', $posId);
        }

        return response()->json([
            'data' => $query->latest()->get()
        ]);
    }
}
