<?php

namespace App\Http\Controllers;

use App\Models\Sampah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class SampahController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $sampah = Sampah::when($search, function ($query, $search) {
                $query->where('nama_sampah', 'like', "%{$search}%")
                      ->orWhere('kategori', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Master/Sampah/Index', [
            'sampah' => [
                'data' => $sampah->items(),
                'links' => $sampah->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $sampah->currentPage(),
                    'from' => $sampah->firstItem(),
                    'last_page' => $sampah->lastPage(),
                    'per_page' => $sampah->perPage(),
                    'to' => $sampah->lastItem(),
                    'total' => $sampah->total(),
                ],
            ],
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Sampah/CreateEdit');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_sampah' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'in:Organik,Anorganik,Lainnya'],
            'poin_per_satuan' => ['required', 'numeric', 'min:0'],
        ]);

        Sampah::create($validated);

        return redirect()->route('master.sampah.index')->with('success', 'Data sampah berhasil ditambahkan');
    }

    public function edit(Sampah $sampah)
    {
        return Inertia::render('Master/Sampah/CreateEdit', [
            'sampah' => $sampah
        ]);
    }

    public function update(Request $request, Sampah $sampah): RedirectResponse
    {
        $validated = $request->validate([
            'nama_sampah' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'in:Organik,Anorganik,Lainnya'],
            'poin_per_satuan' => ['required', 'numeric', 'min:0'],
        ]);

        $sampah->update($validated);

        return redirect()->route('master.sampah.index')->with('success', 'Data sampah berhasil diperbarui');
    }

    public function destroy(Sampah $sampah): RedirectResponse
    {
        $sampah->delete();

        return redirect()->route('master.sampah.index')->with('success', 'Data sampah berhasil dihapus');
    }
}
