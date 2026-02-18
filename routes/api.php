<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransaksiSetorController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Transaksi Setor
    Route::post('/setoran', [TransaksiSetorController::class, 'store']);
    Route::get('/setoran', [TransaksiSetorController::class, 'list']);

    // Penukaran Poin
    Route::prefix('tukar-poin')->group(function () {
        Route::post('/checkout', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'checkout']);
        Route::get('/history', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'history']);
        Route::get('/{id}/qr', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'showQr']);
        
        // Petugas
        Route::post('/scan', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'scan']);
        Route::post('/{id}/konfirmasi-ambil', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'konfirmasiAmbil']);
    });
});
