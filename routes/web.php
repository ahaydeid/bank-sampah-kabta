<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
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
        Route::resource('sampah', \App\Http\Controllers\SampahController::class);
        Route::resource('pos-lokasi', \App\Http\Controllers\PosLokasiController::class);
        Route::resource('reward', \App\Http\Controllers\RewardController::class);
        Route::resource('nasabah', \App\Http\Controllers\NasabahController::class);
        Route::resource('staff', \App\Http\Controllers\StaffController::class);
    });
});






require __DIR__.'/auth.php';
