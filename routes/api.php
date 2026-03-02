<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransaksiSetorController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('throttle:3,1');
    Route::get('/users/find/{identifier}', [AuthController::class, 'findUser']);

    // Transaksi Setor
    Route::get('/sampah', [TransaksiSetorController::class, 'getSampahTypes']);
    Route::post('/setoran', [TransaksiSetorController::class, 'store']);
    Route::get('/setoran', [TransaksiSetorController::class, 'list']);
    Route::get('/setoran/history', [TransaksiSetorController::class, 'historyNasabah']);
    Route::get('/setoran/{id}', [TransaksiSetorController::class, 'show']);

    // Penukaran Poin
    Route::prefix('tukar-poin')->group(function () {
        Route::post('/checkout', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'checkout']);
        Route::get('/history', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'history']);
        Route::get('/{id}', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'show']);
        Route::get('/{id}/qr', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'showQr']);
        
        // Petugas
        Route::get('/', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'listPetugas']);
        Route::post('/scan', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'scan']);
        Route::post('/{id}/konfirmasi-ambil', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'konfirmasiAmbil']);
    });

    // Reward Catalog
    Route::get('/units', [\App\Http\Controllers\Api\RewardController::class, 'units']);
    Route::get('/rewards', [\App\Http\Controllers\Api\RewardController::class, 'index']);

    // Shopping Cart
    Route::prefix('cart')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\CartController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\CartController::class, 'store']); // Add/Update single
        Route::patch('/{id}', [\App\Http\Controllers\Api\CartController::class, 'update']); // Update quantity
        Route::post('/sync', [\App\Http\Controllers\Api\CartController::class, 'sync']); // Full Sync
        Route::delete('/{id}', [\App\Http\Controllers\Api\CartController::class, 'destroy']); // Remove item
    });

    // Petugas Dashboard & Queue
    Route::prefix('petugas')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\PetugasController::class, 'stats']);
        Route::get('/antrian', [\App\Http\Controllers\Api\PetugasController::class, 'queue']);
    });
});
