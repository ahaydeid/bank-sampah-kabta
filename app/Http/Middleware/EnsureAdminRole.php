<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     * Hanya mengizinkan akses untuk pengguna dengan peran admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->peran !== 'admin') {
            abort(403, 'Akses ditolak. Halaman ini hanya untuk Admin.');
        }

        return $next($request);
    }
}
