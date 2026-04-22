<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KuisQuestion;
use App\Models\KuisScore;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KuisController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Cek batas percobaan
        $maxAttempts = Setting::get('kuis_max_percobaan', 1);
        if ($maxAttempts > 0) {
            $todayAttempts = KuisScore::where('pengguna_id', $user->id)
                ->whereDate('created_at', Carbon::today())
                ->count();
                
            if ($todayAttempts >= $maxAttempts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah mencapai batas maksimal pengerjaan kuis hari ini. Silakan kembali besok!',
                    'data' => null
                ], 403);
            }
        }

        $questions = KuisQuestion::where('is_active', true)->inRandomOrder()->get();
        $timer = Setting::get('kuis_waktu_total', 60);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data kuis',
            'data' => [
                'questions' => $questions,
                'settings' => [
                    'waktu_total_detik' => $timer,
                    'poin_per_soal' => Setting::get('kuis_poin_per_soal', 10),
                ]
            ]
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'benar' => 'required|integer',
            'salah' => 'required|integer',
        ]);

        $user = $request->user();
        
        // Validasi max percoban lagi untuk keamanan
        $maxAttempts = Setting::get('kuis_max_percobaan', 1);
        if ($maxAttempts > 0) {
            $todayAttempts = KuisScore::where('pengguna_id', $user->id)
                ->whereDate('created_at', Carbon::today())
                ->count();
                
            if ($todayAttempts >= $maxAttempts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah mencapai batas pengerjaan kuis hari ini.'
                ], 403);
            }
        }

        $poinPerSoal = Setting::get('kuis_poin_per_soal', 10);
        $totalPoin = $request->benar * $poinPerSoal;
        
        $totalSoal = $request->benar + $request->salah;
        $skor = $totalSoal > 0 ? ($request->benar / $totalSoal) * 100 : 0;

        DB::beginTransaction();
        try {
            // Catat Riwayat
            KuisScore::create([
                'pengguna_id' => $user->id,
                'skor' => round($skor),
                'benar' => $request->benar,
                'salah' => $request->salah,
                'poin_didapat' => $totalPoin,
            ]);

            // Tambah Poin
            if ($user->profil) {
                $user->profil->saldo_poin += $totalPoin;
                $user->profil->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Skor berhasil disimpan dan poin ditambahkan',
                'data' => [
                    'poin_didapat' => $totalPoin,
                    'total_poin_sekarang' => $user->profil ? $user->profil->saldo_poin : 0
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan skor kuis: ' . $e->getMessage()
            ], 500);
        }
    }
}
