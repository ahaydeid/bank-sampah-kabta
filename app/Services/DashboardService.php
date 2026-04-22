<?php

namespace App\Services;

use App\Models\Pengguna;
use App\Models\PosLokasi;
use App\Models\Sampah;
use App\Models\TransaksiSetor;
use App\Models\TransaksiTukar;
use App\Models\TransaksiTukarDetail;
use App\Models\TransaksiSetorDetail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    public function getDashboardStats($filters, ?Pengguna $viewer = null)
    {
        $timeRange = $filters['timeRange'] ?? '7hari';
        $month = $filters['month'] ?? now()->month;
        $year = $filters['year'] ?? now()->year;
        $aktivitasTime = $filters['aktivitasTime'] ?? 'Bulan Ini';

        // Summary Counts
        $totalMember = Pengguna::where('peran', 'member')->count();
        $nonMemberQuery = Pengguna::where('peran', '!=', Pengguna::MEMBER);

        if (!$viewer?->isSuperAdmin()) {
            $nonMemberQuery->where('peran', '!=', Pengguna::SUPERADMIN);
        }

        $totalPetugas = $nonMemberQuery->count();
        $totalPos = PosLokasi::count();
        $kategoriSampah = Sampah::count();

        // Poin Hari Ini
        $totalPoinHariIni = TransaksiTukar::whereDate('tanggal', today())->sum('total_poin');
        $poinTukarByCategory = TransaksiTukarDetail::whereHas('transaksiTukar', function ($query) {
            $query->whereDate('tanggal', today());
        })
            ->join('reward', 'transaksi_tukar_detail.reward_id', '=', 'reward.id')
            ->select('reward.kategori_reward', DB::raw('SUM(transaksi_tukar_detail.jumlah * reward.poin_tukar) as total'))
            ->groupBy('reward.kategori_reward')
            ->pluck('total', 'kategori_reward')
            ->toArray();

        // Setoran Stats
        $setoranStats = [
            'hari_ini' => $this->getSetoranStats(now()->startOfDay()),
            'minggu_ini' => $this->getSetoranStats(now()->startOfWeek()),
            'bulan_ini' => $this->getSetoranStats(now()->startOfMonth()),
            'tahun_ini' => $this->getSetoranStats(now()->startOfYear()),
        ];

        // Aktivitas Member
        $startDateAktivitas = match ($aktivitasTime) {
            'Minggu Ini' => now()->startOfWeek(),
            'Tahun Ini' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $aktivitasData = $this->getAktivitasMemberData($startDateAktivitas);

        // Top Members
        $topMembersData = $this->getTopMembers($startDateAktivitas);

        // Trends (Setoran & Kategori)
        $trends = $this->getTrendData($timeRange, $month, $year);

        // All Kategori
        $allKategori = Sampah::distinct()->pluck('kategori')->toArray();
        $allPosUnits = PosLokasi::pluck('nama_pos')->toArray();

        return [
            'totalMember' => $totalMember,
            'totalPetugas' => $totalPetugas,
            'totalPos' => $totalPos,
            'kategoriSampah' => $kategoriSampah,
            'setoranStats' => $setoranStats,
            'poinHariIni' => [
                'total' => $totalPoinHariIni,
                'byCategory' => $poinTukarByCategory,
            ],
            'trendSetoran' => $trends['trendSetoran'],
            'trendByKategori' => $trends['trendByKategori'],
            'allKategori' => $allKategori,
            'aktivitasMember' => $aktivitasData,
            'allPosUnits' => $allPosUnits,
            'topMembers' => $topMembersData,
        ];
    }

    private function getSetoranStats($startDate)
    {
        $stats = TransaksiSetor::where('tanggal_waktu', '>=', $startDate)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        return [
            'total' => array_sum($stats),
            'byStatus' => $stats,
        ];
    }

    private function getAktivitasMemberData($startDateAktivitas)
    {
        // Optimizing query by avoiding n+1 and minimizing data transfer
        $allMembers = Pengguna::where('peran', 'member')->with('profil.pos')->get();
        
        $activeMemberIds = TransaksiSetor::where('tanggal_waktu', '>=', $startDateAktivitas)
            ->distinct()
            ->pluck('member_id')
            ->toArray();

        $memberPosRecords = TransaksiSetor::whereNotNull('pos_id')
            ->select('member_id', 'pos_id')
            ->distinct()
            ->with('pos')
            ->get()
            ->groupBy('member_id');

        return $allMembers->map(function ($member) use ($activeMemberIds, $memberPosRecords) {
            $posNames = [];
            if ($member->profil && $member->profil->pos) {
                $posNames[] = $member->profil->pos->nama_pos;
            }

            if (isset($memberPosRecords[$member->id])) {
                foreach ($memberPosRecords[$member->id] as $record) {
                    if ($record->pos) {
                        $posNames[] = $record->pos->nama_pos;
                    }
                }
            }

            $posNames = array_unique($posNames);
            if (empty($posNames)) {
                $posNames[] = 'Belum Ditentukan';
            }

            return [
                'name' => $member->profil->nama ?? $member->username,
                'pos' => array_values($posNames),
                'active' => in_array($member->id, $activeMemberIds)
            ];
        })->toArray();
    }

    private function getTopMembers($startDateAktivitas)
    {
        return TransaksiSetor::where('tanggal_waktu', '>=', $startDateAktivitas)
            ->with('member.profil')
            ->select('member_id', DB::raw('SUM(total_berat) as total_berat'))
            ->groupBy('member_id')
            ->orderByDesc('total_berat')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->member->profil->nama ?? $item->member->username ?? 'Unknown',
                    'total_berat' => (float) $item->total_berat
                ];
            })->toArray();
    }

    private function getTrendData($timeRange, $month, $year)
    {
        $querySetoran = TransaksiSetor::join('pos_lokasi', 'transaksi_setor.pos_id', '=', 'pos_lokasi.id')
            ->select(
                'transaksi_setor.pos_id',
                'pos_lokasi.nama_pos',
                DB::raw('SUM(transaksi_setor.total_berat) as total_berat'),
                DB::raw('COUNT(*) as total_transaksi'),
                DB::raw('COUNT(DISTINCT transaksi_setor.member_id) as jumlah_member'),
                DB::raw('COUNT(DISTINCT transaksi_setor.petugas_id) as jumlah_petugas')
            );

        $queryKategori = TransaksiSetorDetail::join('transaksi_setor', 'transaksi_setor_detail.transaksi_setor_id', '=', 'transaksi_setor.id')
            ->join('sampah', 'transaksi_setor_detail.sampah_id', '=', 'sampah.id')
            ->join('pos_lokasi', 'transaksi_setor.pos_id', '=', 'pos_lokasi.id')
            ->select(
                'transaksi_setor.pos_id',
                'pos_lokasi.nama_pos',
                'sampah.kategori',
                DB::raw('SUM(transaksi_setor_detail.berat) as total_berat')
            );

        if ($timeRange === 'bulanan') {
            // Use whereBetween for faster query execution instead of whereYear/whereMonth if possible, 
            // but for simplicity and correctness with the existing logic, we keep it consistent.
            // A slight optimization: create a date range.
            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
            
            $querySetoran->whereBetween('transaksi_setor.tanggal_waktu', [$startDate, $endDate]);
            $queryKategori->whereBetween('transaksi_setor.tanggal_waktu', [$startDate, $endDate]);
        } else {
            $startDate = now()->subDays(6)->startOfDay();
            $querySetoran->where('transaksi_setor.tanggal_waktu', '>=', $startDate);
            $queryKategori->where('transaksi_setor.tanggal_waktu', '>=', $startDate);
        }

        $trendSetoran = $querySetoran->groupBy('transaksi_setor.pos_id', 'pos_lokasi.nama_pos')
            ->orderBy('total_berat', 'desc')
            ->get();

        $trendByKategori = $queryKategori->groupBy('transaksi_setor.pos_id', 'pos_lokasi.nama_pos', 'sampah.kategori')
            ->orderBy('transaksi_setor.pos_id')
            ->get()
            ->groupBy('pos_id')
            ->map(function ($items) {
                return $items->pluck('total_berat', 'kategori')->toArray();
            })
            ->toArray();

        return [
            'trendSetoran' => $trendSetoran,
            'trendByKategori' => $trendByKategori
        ];
    }
}
