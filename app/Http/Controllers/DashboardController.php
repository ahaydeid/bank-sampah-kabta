<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $filters = [
            'timeRange' => $request->query('timeRange', '7hari'),
            'month' => (int) $request->query('month', now()->month),
            'year' => (int) $request->query('year', now()->year),
            'aktivitasTime' => $request->query('aktivitasTime', 'Bulan Ini'),
        ];

        $stats = $this->dashboardService->getDashboardStats($filters);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'filters' => $filters,
        ]);
    }
}
