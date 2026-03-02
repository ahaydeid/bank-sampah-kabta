<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sampah;
use App\Models\TransaksiSetor;
use App\Models\TransaksiSetorDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class TransaksiSetorController extends Controller
{
    public function getSampahTypes()
    {
        $sampah = Sampah::all();
        return response()->json([
            'message' => 'Data sampah berhasil diambil.',
            'data' => $sampah
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:pengguna,id',
            'pos_id' => 'required|exists:pos_lokasi,id',
            'items' => 'required|array|min:1',
            'items.*.sampah_id' => 'required|exists:sampah,id',
            'items.*.berat' => 'required|numeric|min:0.01',
            'photos' => 'required|array|min:1|max:3',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:10240',
        ]);

        $petugas = $request->user();

        return DB::transaction(function () use ($request, $petugas) {
            $totalBerat = 0;
            $totalPoin = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $sampah = Sampah::findOrFail($item['sampah_id']);
                $subtotalPoin = $sampah->poin_per_satuan * $item['berat'];
                
                $totalBerat += $item['berat'];
                $totalPoin += $subtotalPoin;

                $itemsData[] = [
                    'sampah_id' => $item['sampah_id'],
                    'berat' => $item['berat'],
                    'subtotal_poin' => $subtotalPoin,
                ];
            }

            // Upload & Compress Photos
            $photoPaths = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $filename = Str::random(20) . '.jpg';
                    $folder = 'transaksi/setoran/' . date('Y/m/d');
                    $path = $folder . '/' . $filename;
                    
                    // Create directory if not exists
                    Storage::disk('public')->makeDirectory($folder);
                    
                    // Compress and Resize using Intervention Image
                    $compressedImage = Image::read($photo)
                        ->scaleDown(width: 1000) 
                        ->toJpeg(75); 
                    
                    Storage::disk('public')->put($path, $compressedImage);
                    $photoPaths[] = Storage::url($path);
                }
            }

            // Generate Sequential ID: STR-YYMMDD + Pos(2) + Seq(3) (e.g., STR-26021801001)
            $pos = \App\Models\PosLokasi::findOrFail($request->pos_id);
            $posCode = str_pad($pos->kode_pos ?? '00', 2, '0', STR_PAD_LEFT);
            $today = now()->format('ymd');
            $prefix = "STR-{$today}{$posCode}";
            
            $latest = TransaksiSetor::where('kode_transaksi', 'like', "{$prefix}%")
                ->latest('id')
                ->first();
                
            $sequence = $latest ? (int)substr($latest->kode_transaksi, -3) + 1 : 1;
            $kodeTransaksi = "{$prefix}" . str_pad($sequence, 3, '0', STR_PAD_LEFT);

            // Create Transaction
            $transaksi = TransaksiSetor::create([
                'kode_transaksi' => $kodeTransaksi,
                'member_id' => $request->member_id,
                'petugas_id' => $petugas->id,
                'pos_id' => $request->pos_id,
                'total_berat' => $totalBerat,
                'total_poin' => $totalPoin,
                'tanggal_waktu' => now(),
                'foto_bukti' => $photoPaths,
                'status' => 'berhasil', // Default status
            ]);

            // Save Details
            foreach ($itemsData as $data) {
                $transaksi->detail()->create($data);
            }

            return response()->json([
                'message' => 'Transaksi setoran berhasil disimpan',
                'transaksi' => $transaksi->load('detail.sampah', 'member.profil', 'petugas.profil', 'pos')
            ], 201);
        });
    }

    public function list(Request $request)
    {
        $user = $request->user();
        
        $transaksi = TransaksiSetor::with(['member.profil', 'pos'])
            ->where('petugas_id', $user->id) 
            ->latest('tanggal_waktu')
            ->paginate(15);

        return response()->json($transaksi);
    }

    public function historyNasabah(Request $request)
    {
        $transaksi = TransaksiSetor::with(['pos', 'detail.sampah'])
            ->where('member_id', $request->user()->id)
            ->latest('tanggal_waktu')
            ->paginate(15);

        return response()->json($transaksi);
    }

    public function show(Request $request, $id)
    {
        $transaksi = TransaksiSetor::with(['pos', 'petugas.profil', 'detail.sampah'])
            ->where('member_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $transaksi
        ]);
    }
}
