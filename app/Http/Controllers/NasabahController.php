<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use App\Models\Profil;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NasabahController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $nasabah = Pengguna::where('peran', 'member')
            ->with('profil')
            ->when($search, function ($query, $search) {
                $search = strtolower($search);
                $query->whereHas('profil', function ($q) use ($search) {
                    $q->where(DB::raw('LOWER(nama)'), 'ilike', "%{$search}%")
                      ->orWhere(DB::raw('LOWER(nik)'), 'ilike', "%{$search}%");
                })->orWhere(DB::raw('LOWER(email)'), 'ilike', "%{$search}%")
                  ->orWhere(DB::raw('LOWER(username)'), 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Master/Nasabah/Index', [
            'nasabah' => [
                'data' => $nasabah->items(),
                'links' => $nasabah->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $nasabah->currentPage(),
                    'from' => $nasabah->firstItem(),
                    'last_page' => $nasabah->lastPage(),
                    'per_page' => $nasabah->perPage(),
                    'to' => $nasabah->lastItem(),
                    'total' => $nasabah->total(),
                ],
            ],
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Nasabah/CreateEdit');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'string', 'max:20', 'unique:profil,nik'],
            'email' => ['required', 'email', 'unique:pengguna,email'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'foto_profil' => ['nullable', 'image', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $pengguna = Pengguna::create([
                'username' => $validated['nik'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['nik']),
                'peran' => 'member',
                'is_aktif' => true,
            ]);

            $fotoPath = null;
            if ($request->hasFile('foto_profil')) {
                $fotoPath = $request->file('foto_profil')->store('profil', 'public');
            }

            $pengguna->profil()->create([
                'nama' => $validated['nama'],
                'nik' => $validated['nik'],
                'no_hp' => $validated['no_hp'],
                'alamat' => $validated['alamat'],
                'saldo_poin' => 0,
                'token_qr' => bin2hex(random_bytes(16)), // Generate a simple token for QR
                'foto_profil' => $fotoPath,
            ]);
        });

        return redirect()->route('master.nasabah.index')->with('success', 'Data nasabah berhasil ditambahkan');
    }

    public function edit(Pengguna $nasabah)
    {
        if ($nasabah->peran !== 'member') {
            abort(404);
        }

        $nasabah->load('profil');
        return Inertia::render('Master/Nasabah/CreateEdit', [
            'nasabah' => $nasabah
        ]);
    }

    public function update(Request $request, Pengguna $nasabah): RedirectResponse
    {
        if ($nasabah->peran !== 'member') {
            abort(404);
        }

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:pengguna,email,' . $nasabah->id],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'is_aktif' => ['required', 'boolean'],
            'foto_profil' => ['nullable', 'image', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $nasabah, $request) {
            $nasabah->update([
                'email' => $validated['email'],
                'is_aktif' => $validated['is_aktif'],
            ]);

            $profilData = [
                'nama' => $validated['nama'],
                'no_hp' => $validated['no_hp'],
                'alamat' => $validated['alamat'],
            ];

            if ($request->hasFile('foto_profil')) {
                if ($nasabah->profil && $nasabah->profil->foto_profil) {
                    Storage::disk('public')->delete($nasabah->profil->foto_profil);
                }
                $profilData['foto_profil'] = $request->file('foto_profil')->store('profil', 'public');
            }

            $nasabah->profil()->update($profilData);
        });

        return redirect()->route('master.nasabah.index')->with('success', 'Data nasabah berhasil diperbarui');
    }

    public function destroy(Pengguna $nasabah): RedirectResponse
    {
        if ($nasabah->peran !== 'member') {
            abort(404);
        }

        $nasabah->delete();

        return redirect()->route('master.nasabah.index')->with('success', 'Data nasabah berhasil dihapus');
    }
}
