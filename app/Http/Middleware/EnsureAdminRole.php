<?php

namespace App\Http\Middleware;

use App\Models\Pengguna;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     * Hanya mengizinkan akses untuk pengguna dengan peran admin atau superadmin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user instanceof Pengguna) {
            abort(403, 'Akses ditolak. Halaman ini hanya untuk Admin atau Superadmin.');
        }

        if (!$user->isAdminLevel()) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Hanya akun admin atau superadmin yang dapat mengakses aplikasi web.',
                ]);
        }

        return $next($request);
    }
}
