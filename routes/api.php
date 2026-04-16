<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransaksiSetorController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('throttle:3,1');
    Route::get('/tukar-poin/{id}', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'show'])
        ->whereNumber('id')
        ->middleware('api.role:member,petugas');
    Route::get('/sampah', [TransaksiSetorController::class, 'getSampahTypes'])
        ->middleware('api.role:member,petugas');
    Route::get('/rewards', [\App\Http\Controllers\Api\RewardController::class, 'index'])
        ->middleware('api.role:member,petugas');

    Route::middleware('api.role:member')->group(function () {
        Route::get('/setoran/history', [TransaksiSetorController::class, 'historyNasabah']);
        Route::get('/setoran/{id}', [TransaksiSetorController::class, 'show']);

        Route::prefix('tukar-poin')->group(function () {
            Route::post('/checkout', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'checkout']);
            Route::get('/history', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'history']);
            Route::get('/{id}/qr', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'showQr'])
                ->whereNumber('id');
        });

        Route::get('/units', [\App\Http\Controllers\Api\RewardController::class, 'units']);
        Route::prefix('cart')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\CartController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\CartController::class, 'store']);
            Route::patch('/{id}', [\App\Http\Controllers\Api\CartController::class, 'update']);
            Route::post('/sync', [\App\Http\Controllers\Api\CartController::class, 'sync']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\CartController::class, 'destroy']);
        });
    });

    Route::middleware('api.role:petugas')->group(function () {
        Route::get('/users/find/{identifier}', [AuthController::class, 'findUser']);
        Route::post('/setoran', [TransaksiSetorController::class, 'store']);
        Route::get('/setoran', [TransaksiSetorController::class, 'list']);

        Route::prefix('tukar-poin')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'listPetugas']);
            Route::post('/scan', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'scan']);
            Route::post('/{id}/konfirmasi-ambil', [\App\Http\Controllers\Api\TransaksiTukarController::class, 'konfirmasiAmbil'])
                ->whereNumber('id');
        });

        Route::prefix('petugas')->group(function () {
            Route::get('/stats', [\App\Http\Controllers\Api\PetugasController::class, 'stats']);
            Route::get('/antrian', [\App\Http\Controllers\Api\PetugasController::class, 'queue']);
        });
    });
});
