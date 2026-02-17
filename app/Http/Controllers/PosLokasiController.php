<?php

namespace App\Http\Controllers;

use App\Models\PosLokasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class PosLokasiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $pos_lokasi = PosLokasi::when($search, function ($query, $search) {
                $query->where('nama_pos', 'like', "%{$search}%")
                      ->orWhere('alamat', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Master/PosLokasi/Index', [
            'pos_lokasi' => [
                'data' => $pos_lokasi->items(),
                'links' => $pos_lokasi->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $pos_lokasi->currentPage(),
                    'from' => $pos_lokasi->firstItem(),
                    'last_page' => $pos_lokasi->lastPage(),
                    'per_page' => $pos_lokasi->perPage(),
                    'to' => $pos_lokasi->lastItem(),
                    'total' => $pos_lokasi->total(),
                ],
            ],
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/PosLokasi/CreateEdit');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pos' => ['required', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_aktif' => ['boolean'],
        ]);

        PosLokasi::create($validated);

        return redirect()->route('master.pos-lokasi.index')->with('success', 'Data pos unit berhasil ditambahkan');
    }

    public function edit(PosLokasi $pos_lokasi)
    {
        return Inertia::render('Master/PosLokasi/CreateEdit', [
            'pos_lokasi' => $pos_lokasi
        ]);
    }

    public function update(Request $request, PosLokasi $pos_lokasi): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pos' => ['required', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_aktif' => ['boolean'],
        ]);

        $pos_lokasi->update($validated);

        return redirect()->route('master.pos-lokasi.index')->with('success', 'Data pos unit berhasil diperbarui');
    }

    public function destroy(PosLokasi $pos_lokasi): RedirectResponse
    {
        $pos_lokasi->delete();

        return redirect()->route('master.pos-lokasi.index')->with('success', 'Data pos unit berhasil dihapus');
    }
}
