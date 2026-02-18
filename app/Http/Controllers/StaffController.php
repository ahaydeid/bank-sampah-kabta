<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use App\Models\Profil;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $staff = Pengguna::whereIn('peran', ['petugas', 'admin'])
            ->with('profil')
            ->when($search, function ($query, $search) {
                $query->whereHas('profil', function ($q) use ($search) {
                    $q->where('nama', 'ilike', "%{$search}%")
                      ->orWhere('jabatan', 'ilike', "%{$search}%");
                })->orWhere('email', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Master/Staff/Index', [
            'staff' => [
                'data' => $staff->items(),
                'links' => $staff->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $staff->currentPage(),
                    'from' => $staff->firstItem(),
                    'last_page' => $staff->lastPage(),
                    'per_page' => $staff->perPage(),
                    'to' => $staff->lastItem(),
                    'total' => $staff->total(),
                ],
            ],
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Staff/CreateEdit');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:pengguna,email'],
            'password' => ['required', 'string', 'min:8'],
            'peran' => ['required', 'in:petugas,admin'],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['nullable', 'string', 'max:20'],
        ]);

        DB::transaction(function () use ($validated) {
            $pengguna = Pengguna::create([
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'peran' => $validated['peran'],
                'is_aktif' => true,
            ]);

            $pengguna->profil()->create([
                'nama' => $validated['nama'],
                'jabatan' => $validated['jabatan'],
                'no_hp' => $validated['no_hp'],
            ]);
        });

        return redirect()->route('master.staff.index')->with('success', 'Data staff berhasil ditambahkan');
    }

    public function edit(Pengguna $staff)
    {
        if (!in_array($staff->peran, ['petugas', 'admin'])) {
            abort(404);
        }

        $staff->load('profil');
        return Inertia::render('Master/Staff/CreateEdit', [
            'staff' => $staff
        ]);
    }

    public function update(Request $request, Pengguna $staff): RedirectResponse
    {
        if (!in_array($staff->peran, ['petugas', 'admin'])) {
            abort(404);
        }

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:pengguna,email,' . $staff->id],
            'password' => ['nullable', 'string', 'min:8'],
            'peran' => ['required', 'in:petugas,admin'],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'is_aktif' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $staff) {
            $updateData = [
                'email' => $validated['email'],
                'peran' => $validated['peran'],
                'is_aktif' => $validated['is_aktif'],
            ];

            if ($validated['password']) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $staff->update($updateData);

            $staff->profil()->update([
                'nama' => $validated['nama'],
                'jabatan' => $validated['jabatan'],
                'no_hp' => $validated['no_hp'],
            ]);
        });

        return redirect()->route('master.staff.index')->with('success', 'Data staff berhasil diperbarui');
    }

    public function destroy(Pengguna $staff): RedirectResponse
    {
        if (!in_array($staff->peran, ['petugas', 'admin'])) {
            abort(404);
        }

        // Prevent self-deletion
        if (auth()->id() === $staff->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri');
        }

        $staff->delete();

        return redirect()->route('master.staff.index')->with('success', 'Data staff berhasil dihapus');
    }
}
