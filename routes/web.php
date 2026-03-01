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

Route::get('/dashboard', function () {
    $totalMember = \App\Models\Pengguna::where('peran', 'member')->count();
    $totalPetugas = \App\Models\Pengguna::where('peran', '!=', 'member')->count();
    $totalPos = \App\Models\PosLokasi::count();
    $kategoriSampah = \App\Models\Sampah::count();

    $setoranByStatus = \App\Models\TransaksiSetor::whereDate('tanggal_waktu', today())
        ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();
    $totalSetoranHariIni = array_sum($setoranByStatus);

    $totalPoinHariIni = \App\Models\TransaksiTukar::whereDate('tanggal', today())->sum('total_poin');

    $poinTukarByCategory = \App\Models\TransaksiTukarDetail::whereHas('transaksiTukar', function($query) {
            $query->whereDate('tanggal', today());
        })
        ->join('reward', 'transaksi_tukar_detail.reward_id', '=', 'reward.id')
        ->select('reward.kategori_reward', \Illuminate\Support\Facades\DB::raw('SUM(transaksi_tukar_detail.jumlah * reward.poin_tukar) as total'))
        ->groupBy('reward.kategori_reward')
        ->pluck('total', 'kategori_reward')
        ->toArray();

    $trendSetoran = \App\Models\TransaksiSetor::select(
            \Illuminate\Support\Facades\DB::raw('DATE(tanggal_waktu) as date'),
            \Illuminate\Support\Facades\DB::raw('SUM(total_berat) as total')
        )
        ->where('tanggal_waktu', '>=', now()->subDays(6)->startOfDay())
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    return Inertia::render('Dashboard', [
        'stats' => [
            'totalMember' => $totalMember,
            'totalPetugas' => $totalPetugas,
            'totalPos' => $totalPos,
            'kategoriSampah' => $kategoriSampah,
            'setoranHariIni' => [
                'total' => $totalSetoranHariIni,
                'byStatus' => $setoranByStatus,
            ],
            'poinHariIni' => [
                'total' => $totalPoinHariIni,
                'byCategory' => $poinTukarByCategory,
            ],
            'trendSetoran' => $trendSetoran,
        ]
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
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

    // Sistem
    Route::prefix('sistem')->name('sistem.')->group(function () {
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/penukaran-poin', [App\Http\Controllers\Sistem\SettingController::class, 'penukaranPoin'])->name('penukaran-poin');
            Route::post('/update', [App\Http\Controllers\Sistem\SettingController::class, 'update'])->name('update');
        });
    });
});






require __DIR__.'/auth.php';
