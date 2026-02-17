<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $reward = Reward::when($search, function ($query, $search) {
                $query->where('nama_reward', 'like', "%{$search}%")
                      ->orWhere('kategori_reward', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

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
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Reward/CreateEdit');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_reward' => ['required', 'string', 'max:255'],
            'stok' => ['required', 'integer', 'min:0'],
            'poin_tukar' => ['required', 'numeric', 'min:0'],
            'kategori_reward' => ['required', 'string', 'max:255'],
        ]);

        Reward::create($validated);

        return redirect()->route('master.reward.index')->with('success', 'Data reward berhasil ditambahkan');
    }

    public function edit(Reward $reward)
    {
        return Inertia::render('Master/Reward/CreateEdit', [
            'reward' => $reward
        ]);
    }

    public function update(Request $request, Reward $reward): RedirectResponse
    {
        $validated = $request->validate([
            'nama_reward' => ['required', 'string', 'max:255'],
            'stok' => ['required', 'integer', 'min:0'],
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
}
