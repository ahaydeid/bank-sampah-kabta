<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'pos_id' => 'required|exists:pos_lokasi,id',
            'kategori' => 'nullable|string',
            'search' => 'nullable|string',
        ]);

        $query = Reward::query();

        // 1. Filter by Search
        if ($request->search) {
            $searchTerm = strtolower($request->search);
            $query->whereRaw('LOWER(nama_reward) LIKE ?', ["%{$searchTerm}%"]);
        }

        // 2. Filter by Category
        if ($request->kategori) {
            $query->where('kategori_reward', $request->kategori);
        }

        // 3. Load Stock for specific POS
        $posId = $request->pos_id;

        // Only show rewards that are assigned to this POS
        $query->whereHas('stokPerPos', function ($q) use ($posId) {
            $q->where('pos_id', $posId);
        });

        $rewards = $query->with(['stokPerPos' => function ($q) use ($posId) {
            $q->where('pos_id', $posId);
        }])->get()->map(function ($reward) {
            // Flatten the structure for easier consumption by mobile app
            $stokPos = $reward->stokPerPos->first();
            
            return [
                'id' => $reward->id,
                'nama_reward' => $reward->nama_reward,
                'kategori' => $reward->kategori_reward,
                'poin_tukar' => $reward->poin_tukar,
                'stok' => $stokPos ? $stokPos->stok : 0,
                'foto_url' => $reward->foto_url, // Uses accessor from Reward model
            ];
        });

        return response()->json([
            'message' => 'Data reward berhasil diambil.',
            'data' => $rewards
        ]);
    }
    public function units()
    {
        $units = \App\Models\PosLokasi::select('id', 'nama_pos', 'alamat', 'latitude', 'longitude')
            ->where('is_aktif', true)
            ->orderBy('nama_pos')
            ->get();

        return response()->json([
            'message' => 'Data unit berhasil diambil.',
            'data' => $units
        ]);
    }
}
