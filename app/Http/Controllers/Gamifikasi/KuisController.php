<?php

namespace App\Http\Controllers\Gamifikasi;

use App\Http\Controllers\Controller;
use App\Models\KuisQuestion;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KuisController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status');
        $jawaban = $request->input('jawaban');

        $query = KuisQuestion::query();

        if ($search) {
            $query->where('pertanyaan', 'like', "%{$search}%");
        }

        if ($status !== null && $status !== '') {
            $query->where('is_active', $status === 'aktif' ? 1 : 0);
        }

        if ($jawaban) {
            $query->where('jawaban_benar', $jawaban);
        }

        $questions = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        $settings = [
            'waktu_total' => Setting::get('kuis_waktu_total', 60),
            'poin_per_soal' => Setting::get('kuis_poin_per_soal', 10),
            'max_percobaan' => Setting::get('kuis_max_percobaan', 0),
        ];

        return Inertia::render('Gamifikasi/Kuis/Index', [
            'questions' => [
                'data' => $questions->items(),
                'links' => $questions->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $questions->currentPage(),
                    'from' => $questions->firstItem(),
                    'last_page' => $questions->lastPage(),
                    'per_page' => $questions->perPage(),
                    'to' => $questions->lastItem(),
                    'total' => $questions->total(),
                ],
            ],
            'settings' => $settings,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
                'jawaban' => $jawaban,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Gamifikasi/Kuis/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pertanyaan' => 'required|string',
            'opsi_a' => 'required|string',
            'opsi_b' => 'required|string',
            'opsi_c' => 'required|string',
            'opsi_d' => 'required|string',
            'jawaban_benar' => 'required|in:A,B,C,D',
            'penjelasan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        KuisQuestion::create($validated);

        return redirect()->route('gamifikasi.kuis.index')->with('success', 'Soal kuis berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $question = KuisQuestion::findOrFail($id);
        
        return Inertia::render('Gamifikasi/Kuis/Edit', [
            'question' => $question
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'pertanyaan' => 'required|string',
            'opsi_a' => 'required|string',
            'opsi_b' => 'required|string',
            'opsi_c' => 'required|string',
            'opsi_d' => 'required|string',
            'jawaban_benar' => 'required|in:A,B,C,D',
            'penjelasan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $question = KuisQuestion::findOrFail($id);
        $question->update($validated);

        return redirect()->route('gamifikasi.kuis.index')->with('success', 'Soal kuis berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $question = KuisQuestion::findOrFail($id);
        $question->delete();

        return redirect()->route('gamifikasi.kuis.index')->with('success', 'Soal kuis berhasil dihapus.');
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'waktu_total' => 'required|integer|min:10',
            'poin_per_soal' => 'required|integer|min:1',
            'max_percobaan' => 'required|integer|min:0',
        ]);

        Setting::updateOrCreate(
            ['key' => 'kuis_waktu_total'],
            ['value' => $request->waktu_total, 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Waktu Total Kuis (Detik)']
        );
        Setting::updateOrCreate(
            ['key' => 'kuis_poin_per_soal'],
            ['value' => $request->poin_per_soal, 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Poin Per Soal Kuis']
        );
        Setting::updateOrCreate(
            ['key' => 'kuis_max_percobaan'],
            ['value' => $request->max_percobaan, 'group' => 'Kuis', 'type' => 'integer', 'label' => 'Batas Percobaan Per Hari (0 = Bebas)']
        );

        return back()->with('success', 'Pengaturan kuis berhasil diperbarui.');
    }
}
