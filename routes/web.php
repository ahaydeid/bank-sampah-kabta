<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SampahController;
use App\Http\Controllers\PosLokasiController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\NasabahController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TransaksiSetorController;
use App\Http\Controllers\TransaksiTukarController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    $totalMember = \App\Models\Pengguna::where('peran', 'member')->count();
    $totalPetugas = \App\Models\Pengguna::where('peran', '!=', 'member')->count();
    $totalPos = \App\Models\PosLokasi::count();
    $kategoriSampah = \App\Models\Sampah::count();

    $getSetoranStats = function($startDate) {
        $stats = \App\Models\TransaksiSetor::where('tanggal_waktu', '>=', $startDate)
            ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        return [
            'total' => array_sum($stats),
            'byStatus' => $stats,
        ];
    };

    $setoranStats = [
        'hari_ini' => $getSetoranStats(now()->startOfDay()),
        'minggu_ini' => $getSetoranStats(now()->startOfWeek()),
        'bulan_ini' => $getSetoranStats(now()->startOfMonth()),
        'tahun_ini' => $getSetoranStats(now()->startOfYear()),
    ];

    $totalPoinHariIni = \App\Models\TransaksiTukar::whereDate('tanggal', today())->sum('total_poin');

    $poinTukarByCategory = \App\Models\TransaksiTukarDetail::whereHas('transaksiTukar', function($query) {
            $query->whereDate('tanggal', today());
        })
        ->join('reward', 'transaksi_tukar_detail.reward_id', '=', 'reward.id')
        ->select('reward.kategori_reward', \Illuminate\Support\Facades\DB::raw('SUM(transaksi_tukar_detail.jumlah * reward.poin_tukar) as total'))
        ->groupBy('reward.kategori_reward')
        ->pluck('total', 'kategori_reward')
        ->toArray();

    $timeRange = $request->query('timeRange', '7hari');
    $month = $request->query('month', now()->month);
    $year = $request->query('year', now()->year);

    $aktivitasTime = $request->query('aktivitasTime', 'Bulan Ini');
    $startDateAktivitas = match ($aktivitasTime) {
        'Minggu Ini' => now()->startOfWeek(),
        'Tahun Ini' => now()->startOfYear(),
        default => now()->startOfMonth(),
    };

    $allMembers = \App\Models\Pengguna::where('peran', 'member')->with('profil.pos')->get();
    $activeMemberIds = \App\Models\TransaksiSetor::where('tanggal_waktu', '>=', $startDateAktivitas)
        ->distinct()
        ->pluck('member_id')
        ->toArray();

    $memberPosRecords = \App\Models\TransaksiSetor::whereNotNull('pos_id')
        ->select('member_id', 'pos_id')
        ->distinct()
        ->with('pos')
        ->get()
        ->groupBy('member_id');

    $aktivitasData = $allMembers->map(function($member) use ($activeMemberIds, $memberPosRecords) {
        $posNames = [];
        if ($member->profil && $member->profil->pos) {
            $posNames[] = $member->profil->pos->nama_pos;
        }

        if (isset($memberPosRecords[$member->id])) {
            foreach ($memberPosRecords[$member->id] as $record) {
                if ($record->pos) {
                    $posNames[] = $record->pos->nama_pos;
                }
            }
        }

        $posNames = array_unique($posNames);
        if (empty($posNames)) {
            $posNames[] = 'Belum Ditentukan';
        }

        return [
            'name' => $member->profil->nama ?? $member->username,
            'pos' => array_values($posNames),
            'active' => in_array($member->id, $activeMemberIds)
        ];
    })->toArray();

    $allPosUnits = \App\Models\PosLokasi::pluck('nama_pos')->toArray();

    $topMembersQuery = \App\Models\TransaksiSetor::where('tanggal_waktu', '>=', $startDateAktivitas)
        ->with('member.profil')
        ->select('member_id', \Illuminate\Support\Facades\DB::raw('SUM(total_berat) as total_berat'))
        ->groupBy('member_id')
        ->orderByDesc('total_berat')
        ->limit(10)
        ->get();

    $topMembersData = $topMembersQuery->map(function ($item) {
        return [
            'name' => $item->member->profil->nama ?? $item->member->username ?? 'Unknown',
            'total_berat' => (float) $item->total_berat
        ];
    })->toArray();

    $querySetoran = \App\Models\TransaksiSetor::join('pos_lokasi', 'transaksi_setor.pos_id', '=', 'pos_lokasi.id')
        ->select(
            'transaksi_setor.pos_id',
            'pos_lokasi.nama_pos',
            \Illuminate\Support\Facades\DB::raw('SUM(transaksi_setor.total_berat) as total_berat'),
            \Illuminate\Support\Facades\DB::raw('COUNT(*) as total_transaksi'),
            \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT transaksi_setor.member_id) as jumlah_member'),
            \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT transaksi_setor.petugas_id) as jumlah_petugas')
        );

    $queryKategori = \App\Models\TransaksiSetorDetail::join('transaksi_setor', 'transaksi_setor_detail.transaksi_setor_id', '=', 'transaksi_setor.id')
        ->join('sampah', 'transaksi_setor_detail.sampah_id', '=', 'sampah.id')
        ->join('pos_lokasi', 'transaksi_setor.pos_id', '=', 'pos_lokasi.id')
        ->select(
            'transaksi_setor.pos_id',
            'pos_lokasi.nama_pos',
            'sampah.kategori',
            \Illuminate\Support\Facades\DB::raw('SUM(transaksi_setor_detail.berat) as total_berat')
        );

    if ($timeRange === 'bulanan') {
        $querySetoran->whereYear('transaksi_setor.tanggal_waktu', $year)
                     ->whereMonth('transaksi_setor.tanggal_waktu', $month);
        $queryKategori->whereYear('transaksi_setor.tanggal_waktu', $year)
                      ->whereMonth('transaksi_setor.tanggal_waktu', $month);
    } else {
        $startDate = now()->subDays(6)->startOfDay();
        $querySetoran->where('transaksi_setor.tanggal_waktu', '>=', $startDate);
        $queryKategori->where('transaksi_setor.tanggal_waktu', '>=', $startDate);
    }

    $trendSetoran = $querySetoran->groupBy('transaksi_setor.pos_id', 'pos_lokasi.nama_pos')
        ->orderBy('total_berat', 'desc')
        ->get();

    $trendByKategori = $queryKategori->groupBy('transaksi_setor.pos_id', 'pos_lokasi.nama_pos', 'sampah.kategori')
        ->orderBy('transaksi_setor.pos_id')
        ->get()
        ->groupBy('pos_id')
        ->map(function ($items) {
            return $items->pluck('total_berat', 'kategori')->toArray();
        })
        ->toArray();

    // Get all unique categories
    $allKategori = \App\Models\Sampah::distinct()->pluck('kategori')->toArray();

    return Inertia::render('Dashboard', [
        'stats' => [
            'totalMember' => $totalMember,
            'totalPetugas' => $totalPetugas,
            'totalPos' => $totalPos,
            'kategoriSampah' => $kategoriSampah,
            'setoranStats' => $setoranStats,
            'poinHariIni' => [
                'total' => $totalPoinHariIni,
                'byCategory' => $poinTukarByCategory,
            ],
            'trendSetoran' => $trendSetoran,
            'trendByKategori' => $trendByKategori,
            'allKategori' => $allKategori,
            'aktivitasMember' => $aktivitasData,
            'allPosUnits' => $allPosUnits,
            'topMembers' => $topMembersData,
        ],
        'filters' => [
            'timeRange' => $timeRange,
            'month' => (int)$month,
            'year' => (int)$year,
            'aktivitasTime' => $aktivitasTime,
        ]
    ]);
})->middleware(['auth', 'web.non_petugas', 'verified'])->name('dashboard');

Route::middleware(['auth', 'web.non_petugas'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/settings', [ProfileController::class, 'settings'])->name('profile.settings');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/password', [ProfileController::class, 'editPassword'])->name('profile.password.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto'])->name('profile.photo.delete');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');

    // Master Data
    Route::prefix('master')->name('master.')->group(function () {
        Route::resource('sampah', SampahController::class);
        Route::resource('pos-lokasi', PosLokasiController::class);
        Route::resource('reward', RewardController::class);
        Route::resource('nasabah', NasabahController::class);
        Route::resource('staff', StaffController::class);
    });

    // Operasional
    Route::prefix('operasional')->name('operasional.')->group(function () {
        Route::get('/setoran', [TransaksiSetorController::class, 'index'])->name('setoran.index');
        Route::get('/setoran/{setoran}', [TransaksiSetorController::class, 'show'])->name('setoran.show');
        Route::patch('/setoran/{setoran}/status', [TransaksiSetorController::class, 'updateStatus'])->name('setoran.update-status');
        
        Route::get('/tukar-poin', [TransaksiTukarController::class, 'index'])->name('tukar-poin');
        Route::get('/tukar-poin/{id}', [TransaksiTukarController::class, 'show'])->name('tukar-poin.show');
        Route::patch('/tukar-poin/{id}/approve', [TransaksiTukarController::class, 'approve'])->name('tukar-poin.approve');
        Route::patch('/tukar-poin/{id}/reject', [TransaksiTukarController::class, 'reject'])->name('tukar-poin.reject');
        Route::patch('/tukar-poin/{id}/undo-approve', [TransaksiTukarController::class, 'undoApprove'])->name('tukar-poin.undo-approve');
    Route::patch('/tukar-poin/{id}/undo-reject', [TransaksiTukarController::class, 'undoReject'])->name('tukar-poin.undo-reject');
    Route::patch('/tukar-poin/{id}/finalize', [TransaksiTukarController::class, 'finalize'])->name('tukar-poin.finalize');
        Route::get('/stok-sembako', [RewardController::class, 'stok'])->name('stok-sembako');
        Route::get('/stok-sembako/kelola', [RewardController::class, 'stokEdit'])->name('stok-sembako.edit');
        Route::post('/stok-sembako/kelola', [RewardController::class, 'stokUpdate'])->name('stok-sembako.update');
        Route::post('/stok-sembako/register', [RewardController::class, 'stokStore'])->name('stok-sembako.register');
        Route::delete('/stok-sembako/unregister/{rewardId}/{posId}', [RewardController::class, 'stokDestroy'])->name('stok-sembako.destroy');
    });

    // Analitik
    Route::prefix('analitik')->name('analitik.')->group(function () {
        Route::get('/laporan', fn() => Inertia::render('UnderDevelopment'))->name('laporan');
    });

    // Notifikasi (JSON API)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
        Route::post('/dismiss', [App\Http\Controllers\NotificationController::class, 'dismiss'])->name('dismiss');
        Route::post('/dismiss-all', [App\Http\Controllers\NotificationController::class, 'dismissAll'])->name('dismiss-all');
        Route::post('/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('mark-all-read');
    });

    // Sistem
    Route::prefix('sistem')->name('sistem.')->group(function () {
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/penukaran-poin', [App\Http\Controllers\Sistem\SettingController::class, 'penukaranPoin'])->name('penukaran-poin');
            Route::post('/update', [App\Http\Controllers\Sistem\SettingController::class, 'update'])->name('update');
        });

        // Log Aktivitas — Admin only
        Route::middleware('web.admin')->group(function () {
            Route::get('/log-aktivitas', [App\Http\Controllers\Sistem\ActivityLogController::class, 'index'])->name('log-aktivitas');
            Route::delete('/log-aktivitas/login/{loginLog}', [App\Http\Controllers\Sistem\ActivityLogController::class, 'destroyLoginLog'])->name('log-aktivitas.login.destroy');
            Route::post('/log-aktivitas/login/mass-destroy', [App\Http\Controllers\Sistem\ActivityLogController::class, 'massDestroyLoginLog'])->name('log-aktivitas.login.mass-destroy');
            Route::delete('/log-aktivitas/activity/{activityLog}', [App\Http\Controllers\Sistem\ActivityLogController::class, 'destroyActivityLog'])->name('log-aktivitas.activity.destroy');
            Route::post('/log-aktivitas/activity/mass-destroy', [App\Http\Controllers\Sistem\ActivityLogController::class, 'massDestroyActivityLog'])->name('log-aktivitas.activity.mass-destroy');
        });
    });
});






require __DIR__.'/auth.php';
