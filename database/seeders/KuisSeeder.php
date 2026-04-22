<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KuisQuestion;
use App\Models\Setting;

class KuisSeeder extends Seeder
{
    public function run(): void
    {
        // Default Settings
        Setting::updateOrCreate(
            ['key' => 'kuis_waktu_total'],
            ['value' => '60', 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Waktu Total Kuis (Detik)']
        );
        Setting::updateOrCreate(
            ['key' => 'kuis_poin_per_soal'],
            ['value' => '10', 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Poin Per Jawaban Benar']
        );
        Setting::updateOrCreate(
            ['key' => 'kuis_max_percobaan'],
            ['value' => '0', 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Batas Percobaan Per Hari (0 = Bebas)']
        );

        // Default Questions
        if (KuisQuestion::count() === 0) {
            $questions = [
                [
                    'pertanyaan' => 'Apa yang dimaksud dengan sampah organik?',
                    'opsi_a' => 'Sampah yang tahan lama dan sulit terurai',
                    'opsi_b' => 'Sampah yang berasal dari bahan berbahaya dan beracun',
                    'opsi_c' => 'Sampah yang mudah membusuk seperti sisa makanan',
                    'opsi_d' => 'Sampah yang bisa didaur ulang menjadi plastik baru',
                    'jawaban_benar' => 'C',
                    'penjelasan' => 'Sampah organik adalah sisa bahan alami yang mudah membusuk dan terurai oleh alam.',
                ],
                [
                    'pertanyaan' => 'Di bawah ini yang termasuk contoh sampah anorganik adalah...',
                    'opsi_a' => 'Kulit pisang dan sisa sayuran',
                    'opsi_b' => 'Botol plastik dan kaleng minuman',
                    'opsi_c' => 'Baterai bekas dan lampu neon',
                    'opsi_d' => 'Kotoran hewan dan dedaunan',
                    'jawaban_benar' => 'B',
                    'penjelasan' => 'Botol plastik dan kaleng adalah benda buatan yang sulit terurai (anorganik).',
                ],
                [
                    'pertanyaan' => 'Apa manfaat utama dari mengolah sampah organik menjadi kompos?',
                    'opsi_a' => 'Menyuburkan tanah untuk tanaman',
                    'opsi_b' => 'Mendapatkan bahan baku plastik',
                    'opsi_c' => 'Mengurangi polusi udara',
                    'opsi_d' => 'Mencegah kerusakan ozon',
                    'jawaban_benar' => 'A',
                    'penjelasan' => 'Kompos dari sampah organik sangat kaya nutrisi untuk menyuburkan tanah.',
                ],
                [
                    'pertanyaan' => 'Limbah medis seperti jarum suntik bekas termasuk ke dalam kategori sampah apa?',
                    'opsi_a' => 'Organik',
                    'opsi_b' => 'Anorganik',
                    'opsi_c' => 'B3 & Residu',
                    'opsi_d' => 'Bebas',
                    'jawaban_benar' => 'C',
                    'penjelasan' => 'Jarum suntik bekas adalah limbah medis yang berbahaya (Kategori B3).',
                ],
                [
                    'pertanyaan' => 'Ke mana sebaiknya kita menyalurkan sampah anorganik yang sudah dipilah?',
                    'opsi_a' => 'Dibuang ke sungai',
                    'opsi_b' => 'Dibakar di halaman',
                    'opsi_c' => 'Dikubur di dalam tanah',
                    'opsi_d' => 'Disetorkan ke Bank Sampah',
                    'jawaban_benar' => 'D',
                    'penjelasan' => 'Bank Sampah akan mengelola sampah anorganik untuk disalurkan ke pabrik daur ulang.',
                ]
            ];

            foreach ($questions as $q) {
                KuisQuestion::create($q);
            }
        }
    }
}
