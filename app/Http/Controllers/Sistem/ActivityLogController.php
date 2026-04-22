<?php

namespace App\Http\Controllers\Sistem;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\LoginLog;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Menampilkan halaman Log Aktivitas dengan dua dataset paginated + filter.
     */
    public function index(Request $request)
    {
        $perPageLogin = $request->input('per_page_login', 10);
        $perPageActivity = $request->input('per_page_activity', 10);
        $loginLogsQuery = $this->visibleLoginLogsQuery();
        $activityLogsQuery = $this->visibleActivityLogsQuery();

        // Shared date range filter
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Tab 1: Riwayat Login — dengan filter event & status
        $loginLogs = $loginLogsQuery
            ->when($request->input('search_login'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_user', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->when($request->input('filter_event'), function ($query, $event) {
                $query->where('event', $event);
            })
            ->when($request->input('filter_status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($dateFrom, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($dateTo, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderByDesc('created_at')
            ->paginate($perPageLogin, ['*'], 'page_login')
            ->withQueryString();

        // Tab 2: Riwayat Perubahan Data — dengan filter modul & aksi
        $activityLogs = $activityLogsQuery
            ->when($request->input('search_activity'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_user', 'like', "%{$search}%")
                      ->orWhere('modul', 'like', "%{$search}%")
                      ->orWhere('deskripsi', 'like', "%{$search}%");
                });
            })
            ->when($request->input('filter_modul'), function ($query, $modul) {
                $query->where('modul', $modul);
            })
            ->when($request->input('filter_aksi'), function ($query, $aksi) {
                $query->where('aksi', $aksi);
            })
            ->when($dateFrom, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($dateTo, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderByDesc('created_at')
            ->paginate($perPageActivity, ['*'], 'page_activity')
            ->withQueryString();

        // Ambil opsi filter dari data yang sudah ada (ringan, pakai distinct)
        $filterOptions = [
            'events'   => (clone $loginLogsQuery)->select('event')->distinct()->orderBy('event')->pluck('event')->toArray(),
            'statuses' => (clone $loginLogsQuery)->select('status')->distinct()->orderBy('status')->pluck('status')->toArray(),
            'moduls'   => (clone $activityLogsQuery)->select('modul')->distinct()->orderBy('modul')->pluck('modul')->toArray(),
            'aksis'    => (clone $activityLogsQuery)->select('aksi')->distinct()->orderBy('aksi')->pluck('aksi')->toArray(),
        ];

        return Inertia::render('Sistem/LogAktivitas/Index', [
            'loginLogs'     => $loginLogs,
            'activityLogs'  => $activityLogs,
            'filterOptions' => $filterOptions,
            'filters'       => [
                'search_login'      => $request->input('search_login', ''),
                'search_activity'   => $request->input('search_activity', ''),
                'per_page_login'    => (int) $perPageLogin,
                'per_page_activity' => (int) $perPageActivity,
                'filter_event'      => $request->input('filter_event', ''),
                'filter_status'     => $request->input('filter_status', ''),
                'filter_modul'      => $request->input('filter_modul', ''),
                'filter_aksi'       => $request->input('filter_aksi', ''),
                'date_from'         => $request->input('date_from', ''),
                'date_to'           => $request->input('date_to', ''),
            ],
        ]);
    }

    /**
     * Hapus satu login log.
     */
    public function destroyLoginLog(LoginLog $loginLog)
    {
        $this->ensureLoginLogVisible($loginLog);

        DB::transaction(function () use ($loginLog) {
            $loginLog->delete();
        });

        return back()->with('success', 'Log login berhasil dihapus.');
    }

    /**
     * Hapus banyak login log sekaligus (bulk).
     */
    public function massDestroyLoginLog(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:login_logs,id',
        ]);

        $visibleCount = (clone $this->visibleLoginLogsQuery())
            ->whereIn('id', $request->ids)
            ->count();

        if ($visibleCount !== count($request->ids)) {
            abort(404);
        }

        DB::transaction(function () use ($request) {
            LoginLog::whereIn('id', $request->ids)->delete();
        });

        return back()->with('success', count($request->ids) . ' log login berhasil dihapus.');
    }

    /**
     * Hapus satu activity log.
     */
    public function destroyActivityLog(ActivityLog $activityLog)
    {
        $this->ensureActivityLogVisible($activityLog);

        DB::transaction(function () use ($activityLog) {
            $activityLog->delete();
        });

        return back()->with('success', 'Log aktivitas berhasil dihapus.');
    }

    /**
     * Hapus banyak activity log sekaligus (bulk).
     */
    public function massDestroyActivityLog(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:activity_logs,id',
        ]);

        $visibleCount = (clone $this->visibleActivityLogsQuery())
            ->whereIn('id', $request->ids)
            ->count();

        if ($visibleCount !== count($request->ids)) {
            abort(404);
        }

        DB::transaction(function () use ($request) {
            ActivityLog::whereIn('id', $request->ids)->delete();
        });

        return back()->with('success', count($request->ids) . ' log aktivitas berhasil dihapus.');
    }

    private function visibleLoginLogsQuery(): Builder
    {
        return $this->applySuperadminVisibility(LoginLog::query());
    }

    private function visibleActivityLogsQuery(): Builder
    {
        return $this->applySuperadminVisibility(ActivityLog::query());
    }

    private function applySuperadminVisibility(Builder $query): Builder
    {
        if ($this->currentUser()->isSuperAdmin()) {
            return $query;
        }

        $superadminIds = Pengguna::query()
            ->where('peran', Pengguna::SUPERADMIN)
            ->pluck('id');

        $identifiers = Pengguna::query()
            ->where('peran', Pengguna::SUPERADMIN)
            ->with('profil:id,pengguna_id,nama')
            ->get()
            ->flatMap(fn (Pengguna $user) => [
                $user->email,
                $user->username,
                $user->profil?->nama,
            ])
            ->filter()
            ->unique()
            ->values()
            ->all();

        return $query->where(function (Builder $visibleQuery) use ($superadminIds, $identifiers) {
            $visibleQuery->whereNotIn('pengguna_id', $superadminIds);

            if ($identifiers !== []) {
                $visibleQuery->whereNotIn('nama_user', $identifiers);
            }
        });
    }

    private function ensureLoginLogVisible(LoginLog $loginLog): void
    {
        $exists = (clone $this->visibleLoginLogsQuery())
            ->whereKey($loginLog->getKey())
            ->exists();

        if (!$exists) {
            abort(404);
        }
    }

    private function ensureActivityLogVisible(ActivityLog $activityLog): void
    {
        $exists = (clone $this->visibleActivityLogsQuery())
            ->whereKey($activityLog->getKey())
            ->exists();

        if (!$exists) {
            abort(404);
        }
    }

    private function currentUser(): Pengguna
    {
        /** @var Pengguna|null $user */
        $user = auth()->user();

        if (!$user) {
            abort(403);
        }

        return $user;
    }
}
