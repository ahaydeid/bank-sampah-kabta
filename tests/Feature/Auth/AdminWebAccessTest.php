<?php

use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;

function makePengguna(array $overrides = []): Pengguna
{
    return Pengguna::create(array_merge([
        'username' => fake()->unique()->userName(),
        'email' => fake()->unique()->safeEmail(),
        'password' => Hash::make('password'),
        'peran' => 'member',
        'is_aktif' => true,
    ], $overrides));
}

test('admin can authenticate through the web login', function () {
    $admin = makePengguna([
        'peran' => 'admin',
    ]);

    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($admin, 'web');
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('superadmin can authenticate through the web login', function () {
    $superadmin = makePengguna([
        'peran' => 'superadmin',
    ]);

    $response = $this->post('/login', [
        'email' => $superadmin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($superadmin, 'web');
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('member can not authenticate through the web login', function () {
    $member = makePengguna([
        'peran' => 'member',
    ]);

    $response = $this->from('/login')->post('/login', [
        'email' => $member->email,
        'password' => 'password',
    ]);

    $this->assertGuest('web');
    $response->assertRedirect('/login');
    $response->assertSessionHasErrors([
        'email' => 'Hanya akun admin atau superadmin yang dapat mengakses aplikasi web.',
    ]);
});

test('petugas can not authenticate through the web login', function () {
    $petugas = makePengguna([
        'peran' => 'petugas',
    ]);

    $response = $this->from('/login')->post('/login', [
        'email' => $petugas->email,
        'password' => 'password',
    ]);

    $this->assertGuest('web');
    $response->assertRedirect('/login');
    $response->assertSessionHasErrors([
        'email' => 'Hanya akun admin atau superadmin yang dapat mengakses aplikasi web.',
    ]);
});

test('non admin users receive forbidden response on protected web pages', function () {
    $member = makePengguna([
        'peran' => 'member',
    ]);

    $response = $this->actingAs($member, 'web')->get('/dashboard');

    $response->assertForbidden();
});
