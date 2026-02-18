<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sampah;
use App\Models\PosLokasi;
use App\Models\Reward;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Kategori Sampah
        $sampahData = [
            ['nama_sampah' => 'Kertas Koran', 'kategori' => 'Anorganik', 'poin_per_satuan' => 1000],
            ['nama_sampah' => 'Kardus Bekas', 'kategori' => 'Anorganik', 'poin_per_satuan' => 1500],
            ['nama_sampah' => 'Botol Plastik PET', 'kategori' => 'Anorganik', 'poin_per_satuan' => 2000],
            ['nama_sampah' => 'Gelas Plastik Bersih', 'kategori' => 'Anorganik', 'poin_per_satuan' => 1200],
            ['nama_sampah' => 'Kaleng Bekas', 'kategori' => 'Anorganik', 'poin_per_satuan' => 3000],
            ['nama_sampah' => 'Besi Tua', 'kategori' => 'Anorganik', 'poin_per_satuan' => 4500],
        ];

        foreach ($sampahData as $data) {
            Sampah::updateOrCreate(['nama_sampah' => $data['nama_sampah']], $data);
        }

        // 2. Pos Unit (Lokasi)
        $posData = [
            ['nama_pos' => 'Pos Unit Tigaraksa', 'kode_pos' => '01', 'alamat' => 'Kec. Tigaraksa, Kab. Tangerang', 'is_aktif' => true],
            ['nama_pos' => 'Pos Unit Cikupa', 'kode_pos' => '02', 'alamat' => 'Kec. Cikupa, Kab. Tangerang', 'is_aktif' => true],
            ['nama_pos' => 'Pos Unit Balaraja', 'kode_pos' => '03', 'alamat' => 'Kec. Balaraja, Kab. Tangerang', 'is_aktif' => true],
        ];

        foreach ($posData as $data) {
            PosLokasi::updateOrCreate(['kode_pos' => $data['kode_pos']], $data);
        }

        // 3. Sembako (Reward)
        $rewardData = [
            ['nama_reward' => 'Beras 5kg', 'stok' => 50, 'poin_tukar' => 50000, 'kategori_reward' => 'SEMBAKO'],
            ['nama_reward' => 'Minyak Goreng 1L', 'stok' => 100, 'poin_tukar' => 15000, 'kategori_reward' => 'SEMBAKO'],
            ['nama_reward' => 'Gula Pasir 1kg', 'stok' => 80, 'poin_tukar' => 12000, 'kategori_reward' => 'SEMBAKO'],
            ['nama_reward' => 'Mie Instan (Kardus)', 'stok' => 30, 'poin_tukar' => 75000, 'kategori_reward' => 'SEMBAKO'],
        ];

        foreach ($rewardData as $data) {
            Reward::updateOrCreate(['nama_reward' => $data['nama_reward']], $data);
        }

        // 4. Nasabah (5 Orang)
        $nasabahNames = ['Ahmad Sulaiman', 'Budi Santoso', 'Citra Lestari', 'Dewi Sartika', 'Eko Prasetyo'];
        foreach ($nasabahNames as $index => $name) {
            $nik = '320000000000000' . ($index + 1);
            $user = Pengguna::updateOrCreate(
                ['username' => 'nasabah' . ($index + 1)],
                [
                    'email' => strtolower(str_replace(' ', '.', $name)) . '@email.com',
                    'password' => Hash::make('password123'),
                    'peran' => 'member',
                    'is_aktif' => true,
                ]
            );

            $user->profil()->updateOrCreate(
                ['pengguna_id' => $user->id],
                [
                    'nama' => $name,
                    'nik' => $nik,
                    'alamat' => 'Alamat Nasabah ' . ($index + 1),
                    'no_hp' => '0812345678' . ($index + 1),
                    'saldo_poin' => 0,
                    'token_qr' => Str::random(32),
                ]
            );
        }
    }
}
