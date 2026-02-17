<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle Hybrid Login for PWA (Member: NIK, Petugas: Email)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // Detect if email or username (NIK)
        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = Pengguna::where($loginField, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Kredensial yang Anda berikan salah.'
            ], 401);
        }

        if (!$user->is_aktif) {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan.'
            ], 403);
        }

        $token = $user->createToken('pwa-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('profil'),
            'token' => $token,
            'role' => $user->getRoleNames()->first(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout.'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('profil'),
            'role' => $request->user()->getRoleNames()->first(),
        ]);
    }
}
