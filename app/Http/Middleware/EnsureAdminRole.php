<?php

namespace App\Http\Middleware;

use App\Models\Pengguna;
use Closure;
use Illuminate\Http\Request;
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

        if (!$user instanceof Pengguna || !$user->isAdminLevel()) {
            abort(403, 'Akses ditolak. Halaman ini hanya untuk Admin atau Superadmin.');
        }

        return $next($request);
    }
}
