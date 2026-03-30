<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->peran, $roles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke endpoint ini.',
            ], 403);
        }

        return $next($request);
    }
}
