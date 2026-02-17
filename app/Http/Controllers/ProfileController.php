<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile (read-only).
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('profil');
        
        return Inertia::render('Profile/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Display settings page with options.
     */
    public function settings(Request $request): Response
    {
        return Inertia::render('Profile/Settings');
    }

    /**
     * Display the user's profile edit form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profil');
        
        return Inertia::render('Profile/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Display the password edit form.
     */
    public function editPassword(Request $request): Response
    {
        return Inertia::render('Profile/EditPassword');
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $user = $request->user();
        $profil = $user->profil;

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo
            if ($profil && $profil->foto_profil && Storage::disk('public')->exists($profil->foto_profil)) {
                Storage::disk('public')->delete($profil->foto_profil);
            }
            $validated['foto_profil'] = $request->file('photo')->store('profile-photos', 'public');
        }

        // Remove photo from validated array as it's handled separately (as foto_profil) or not needed in update
        unset($validated['photo']);

        if ($profil) {
            $profil->update($validated);
        } else {
            // Create profil if doesn't exist
            Profil::create([
                'pengguna_id' => $user->id,
                ...$validated,
            ]);
        }

        return redirect()->route('profile.settings')->with('success', 'Profil berhasil diperbarui');
    }

    /**
     * Upload or update profile photo.
     */
    public function updatePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], // 2MB max
        ]);

        $user = $request->user();
        $profil = $user->profil;

        if (!$profil) {
            return redirect()->route('profile.edit')->with('error', 'Profil tidak ditemukan');
        }

        // Delete old photo if exists
        if ($profil->foto_profil && Storage::disk('public')->exists($profil->foto_profil)) {
            Storage::disk('public')->delete($profil->foto_profil);
        }

        // Store new photo
        $path = $request->file('photo')->store('profile-photos', 'public');
        
        $profil->update(['foto_profil' => $path]);

        return redirect()->route('profile.edit')->with('success', 'Foto profil berhasil diperbarui');
    }

    /**
     * Delete profile photo.
     */
    public function deletePhoto(Request $request): RedirectResponse
    {
        $user = $request->user();
        $profil = $user->profil;

        if (!$profil || !$profil->foto_profil) {
            return redirect()->route('profile.edit')->with('error', 'Tidak ada foto untuk dihapus');
        }

        // Delete photo file
        if (Storage::disk('public')->exists($profil->foto_profil)) {
            Storage::disk('public')->delete($profil->foto_profil);
        }

        $profil->update(['foto_profil' => null]);

        return redirect()->route('profile.edit')->with('success', 'Foto profil berhasil dihapus');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('profile.settings')->with('success', 'Password berhasil diubah');
    }
}
