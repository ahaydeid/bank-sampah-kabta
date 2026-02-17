<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles idempotently
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'petugas', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);

        // Create default Admin User
        $admin = \App\Models\Pengguna::firstOrCreate(
            ['email' => 'admin@kabta.id'],
            [
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'peran' => 'admin',
                'is_aktif' => true,
            ]
        );

        // Ensure roles are assigned to the correct guard
        $admin->assignRole($adminRole);

        // Create profile for admin
        \App\Models\Profil::firstOrCreate(
            ['pengguna_id' => $admin->id],
            [
                'nama' => 'Admin Utama Kabta',
                'jabatan' => 'Kepala Pengelola',
                'saldo_poin' => 0,
            ]
        );
    }
}
