<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $posId = $request->input('pos_id');
        $perPage = $request->input('per_page', 10);

        // Fetch all POS for the filter dropdown
        $posLokasi = \App\Models\PosLokasi::select('id', 'nama_pos')->where('is_aktif', true)->get();

        $query = Reward::query();

        if ($posId) {
            $query->with(['stokPerPos' => function ($q) use ($posId) {
                $q->where('pos_id', $posId);
            }]);
        } else {
            $query->withSum('stokPerPos as total_stok', 'stok');
        }

        $reward = $query->when($search, function ($query, $search) {
                $query->where('nama_reward', 'ilike', "%{$search}%")
                      ->orWhere('kategori_reward', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        // Transform collection to set a consistent stock field
        $reward->getCollection()->transform(function ($item) use ($posId) {
            if ($posId) {
                $stokEntry = $item->stokPerPos->first();
                $item->stok_tampil = $stokEntry ? $stokEntry->stok : 0;
            } else {
                $item->stok_tampil = $item->total_stok ?? 0;
            }
            return $item;
        });

        return Inertia::render('Master/Reward/Index', [
            'reward' => [
                'data' => $reward->items(),
                'links' => $reward->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $reward->currentPage(),
                    'from' => $reward->firstItem(),
                    'last_page' => $reward->lastPage(),
                    'per_page' => $reward->perPage(),
                    'to' => $reward->lastItem(),
                    'total' => $reward->total(),
                ],
            ],
            'pos_lokasi' => $posLokasi,
            'filters' => array_merge($request->only(['search', 'per_page']), ['pos_id' => $posId])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Reward/CreateEdit', [
            'pos_lokasi' => \App\Models\PosLokasi::select('id', 'nama_pos')->where('is_aktif', true)->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_reward' => ['required', 'string', 'max:255'],
            'poin_tukar' => ['required', 'numeric', 'min:0'],
            'kategori_reward' => ['required', 'string', 'max:255'],
        ]);

        Reward::create($validated);

        return redirect()->route('master.reward.index')->with('success', 'Data reward berhasil ditambahkan');
    }

    public function edit(Reward $reward)
    {
        $reward->load('stokPerPos');
        return Inertia::render('Master/Reward/CreateEdit', [
            'reward' => $reward,
            'pos_lokasi' => \App\Models\PosLokasi::select('id', 'nama_pos')->where('is_aktif', true)->get()
        ]);
    }

    public function update(Request $request, Reward $reward): RedirectResponse
    {
        $validated = $request->validate([
            'nama_reward' => ['required', 'string', 'max:255'],
            'poin_tukar' => ['required', 'numeric', 'min:0'],
            'kategori_reward' => ['required', 'string', 'max:255'],
        ]);

        $reward->update($validated);

        return redirect()->route('master.reward.index')->with('success', 'Data reward berhasil diperbarui');
    }

    public function destroy(Reward $reward): RedirectResponse
    {
        $reward->delete();

        return redirect()->route('master.reward.index')->with('success', 'Data reward berhasil dihapus');
    }

    public function stok(Request $request)
    {
        $search = $request->input('search');
        $posId = $request->input('pos_id');
        $perPage = $request->input('per_page', 10);

        // Fetch all POS for the dropdown
        $posLokasi = \App\Models\PosLokasi::select('id', 'nama_pos')->where('is_aktif', true)->get();

        // If no pos_id is selected, default to the first one available
        if (!$posId && $posLokasi->isNotEmpty()) {
            $posId = $posLokasi->first()->id;
        }

        $query = Reward::query();

        if ($posId) {
            $query->whereHas('stokPerPos', function ($q) use ($posId) {
                $q->where('pos_id', $posId);
            });
            $query->with(['stokPerPos' => function ($q) use ($posId) {
                $q->where('pos_id', $posId);
            }]);
        }

        $reward = $query->when($search, function ($query, $search) {
                $query->where('nama_reward', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        // Transform data to show stock for the selected POS
        $reward->getCollection()->transform(function ($item) use ($posId) {
            $stokEntry = $item->stokPerPos->first();
            $item->stok_saat_ini = $stokEntry ? $stokEntry->stok : 0;
            return $item;
        });

        return Inertia::render('Operasional/StokSembako/Index', [
            'reward' => [
                'data' => $reward->items(),
                'links' => $reward->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $reward->currentPage(),
                    'from' => $reward->firstItem(),
                    'last_page' => $reward->lastPage(),
                    'per_page' => $reward->perPage(),
                    'to' => $reward->lastItem(),
                    'total' => $reward->total(),
                ],
            ],
            'pos_lokasi' => $posLokasi,
            'filters' => array_merge($request->only(['search', 'per_page']), ['pos_id' => $posId])
        ]);
    }

    public function stokEdit(Request $request)
    {
        $posId = $request->input('pos_id');
        $posLokasi = \App\Models\PosLokasi::select('id', 'nama_pos')->where('is_aktif', true)->get();

        if (!$posId && $posLokasi->isNotEmpty()) {
            $posId = $posLokasi->first()->id;
        }

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        // Get rewards already registered in this POS (PAGINATED)
        $registeredRewards = Reward::whereHas('stokPerPos', function ($query) use ($posId) {
                $query->where('pos_id', $posId);
            })
            ->when($search, function ($query, $search) {
                $query->where('nama_reward', 'ilike', "%{$search}%");
            })
            ->with(['stokPerPos' => function ($query) use ($posId) {
                $query->where('pos_id', $posId);
            }])
            ->paginate($perPage)
            ->withQueryString();

        // Transform collection to include stok_saat_ini
        $rewardsData = collect($registeredRewards->items())->map(function ($reward) {
            $stokEntry = $reward->stokPerPos->first();
            $reward->stok_saat_ini = $stokEntry ? $stokEntry->stok : 0;
            return $reward;
        });

        return Inertia::render('Operasional/StokSembako/Manage', [
            'rewards' => [
                'data' => $rewardsData,
                'links' => $registeredRewards->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $registeredRewards->currentPage(),
                    'from' => $registeredRewards->firstItem(),
                    'last_page' => $registeredRewards->lastPage(),
                    'per_page' => $registeredRewards->perPage(),
                    'to' => $registeredRewards->lastItem(),
                    'total' => $registeredRewards->total(),
                ],
            ],
            'pos_lokasi' => $posLokasi,
            'filters' => $request->only(['pos_id', 'search', 'per_page'])
        ]);
    }

    public function stokStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pos_id' => ['required', 'exists:pos_lokasi,id'],
            'reward_id' => ['required', 'exists:reward,id'],
        ]);

        \App\Models\RewardStok::updateOrCreate(
            ['reward_id' => $validated['reward_id'], 'pos_id' => $validated['pos_id']],
            ['stok' => 0]
        );

        return back()->with('success', 'Barang berhasil ditambahkan ke unit ini');
    }

    public function stokDestroy($rewardId, $posId): RedirectResponse
    {
        \App\Models\RewardStok::where('reward_id', $rewardId)
            ->where('pos_id', $posId)
            ->delete();

        // Sync global total
        $reward = Reward::find($rewardId);
        if ($reward) {
            $reward->update(['stok' => $reward->stokPerPos()->sum('stok')]);
        }

        return back()->with('success', 'Barang berhasil dihapus dari unit ini');
    }

    public function stokUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pos_id' => ['required', 'exists:pos_lokasi,id'],
            'stok' => ['required', 'array'],
            'stok.*' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['stok'] as $rewardId => $jumlah) {
                \App\Models\RewardStok::updateOrCreate(
                    ['reward_id' => $rewardId, 'pos_id' => $validated['pos_id']],
                    ['stok' => $jumlah]
                );

                // Sync global total for each reward
                $reward = Reward::find($rewardId);
                if ($reward) {
                    $reward->update(['stok' => $reward->stokPerPos()->sum('stok')]);
                }
            }
        });

        return redirect()->route('operasional.stok-sembako', ['pos_id' => $validated['pos_id']])
            ->with('success', 'Stok sembako berhasil diperbarui');
    }
}
