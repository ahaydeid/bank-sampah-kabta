<?php

namespace App\Http\Controllers;

use App\Models\PosLokasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class PosLokasiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $pos_lokasi = PosLokasi::withCount('rewards')
            ->when($search, function ($query, $search) {
                $search = strtolower($search);
                $query->where(DB::raw('LOWER(nama_pos)'), 'ilike', "%{$search}%")
                      ->orWhere(DB::raw('LOWER(alamat)'), 'ilike', "%{$search}%")
                      ->orWhere(DB::raw('LOWER(kode_pos)'), 'ilike', "%{$search}%");
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
        return Inertia::render('Master/PosLokasi/CreateEdit', [
            'filters' => ['catalog_search' => ''],
            'registered_rewards' => null
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pos' => ['required', 'string', 'max:255'],
            'kode_pos' => ['required', 'string', 'size:2', 'unique:pos_lokasi,kode_pos'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'jadwal_buka' => ['nullable', 'date_format:H:i'],
            'jadwal_tutup' => ['nullable', 'date_format:H:i'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_aktif' => ['boolean'],
        ], [
            'nama_pos.required' => 'Nama pos unit wajib diisi.',
            'nama_pos.max' => 'Nama pos unit maksimal 255 karakter.',
            'kode_pos.required' => 'Kode unit wajib diisi.',
            'kode_pos.size' => 'Kode unit harus terdiri dari 2 karakter.',
            'kode_pos.unique' => 'Kode unit ini sudah digunakan.',
            'jadwal_buka.date_format' => 'Format jadwal buka harus JJ:MM.',
            'jadwal_tutup.date_format' => 'Format jadwal tutup harus JJ:MM.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
        ]);

        PosLokasi::create($validated);

        return redirect()->route('master.pos-lokasi.index')->with('success', 'Data pos unit berhasil ditambahkan');
    }

    public function edit(Request $request, PosLokasi $pos_lokasi)
    {
        $search = $request->input('catalog_search');
        $perPage = $request->input('catalog_per_page', 10);

        $registeredRewards = $pos_lokasi->rewards()
            ->when($search, function ($query, $search) {
                $query->where('nama_reward', 'ilike', "%{$search}%");
            })
            ->paginate($perPage, ['*'], 'catalog_page')
            ->withQueryString();

        $availableRewards = \App\Models\Reward::whereDoesntHave('stokPerPos', function ($query) use ($pos_lokasi) {
            $query->where('pos_id', $pos_lokasi->id);
        })->select('id', 'nama_reward', 'kategori_reward')->get();

        return Inertia::render('Master/PosLokasi/CreateEdit', [
            'pos_lokasi' => $pos_lokasi,
            'registered_rewards' => [
                'data' => $registeredRewards->items(),
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
            'available_rewards' => $availableRewards,
            'filters' => $request->only(['catalog_search', 'catalog_per_page'])
        ]);
    }

    public function update(Request $request, PosLokasi $pos_lokasi): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pos' => ['required', 'string', 'max:255'],
            'kode_pos' => ['required', 'string', 'size:2', 'unique:pos_lokasi,kode_pos,' . $pos_lokasi->id],
            'alamat' => ['nullable', 'string', 'max:500'],
            'jadwal_buka' => ['nullable', 'date_format:H:i'],
            'jadwal_tutup' => ['nullable', 'date_format:H:i'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_aktif' => ['boolean'],
        ], [
            'nama_pos.required' => 'Nama pos unit wajib diisi.',
            'nama_pos.max' => 'Nama pos unit maksimal 255 karakter.',
            'kode_pos.required' => 'Kode unit wajib diisi.',
            'kode_pos.size' => 'Kode unit harus terdiri dari 2 karakter.',
            'kode_pos.unique' => 'Kode unit ini sudah digunakan.',
            'jadwal_buka.date_format' => 'Format jadwal buka harus JJ:MM.',
            'jadwal_tutup.date_format' => 'Format jadwal tutup harus JJ:MM.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
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
