<?php

namespace App\Console\Commands;

use App\Models\TransaksiTukar;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckExpiredRedemptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-expired-redemptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredTransactions = TransaksiTukar::with(['member.profil', 'detail.reward'])
            ->where('status', 'disetujui')
            ->where('expired_at', '<', now())
            ->get();

        if ($expiredTransactions->isEmpty()) {
            $this->info('Tidak ada penukaran yang kadaluwarsa saat ini.');
            return;
        }

        foreach ($expiredTransactions as $transaksi) {
            DB::transaction(function () use ($transaksi) {
                // 1. Kembalikan Poin Nasabah
                if ($transaksi->member && $transaksi->member->profil) {
                    $transaksi->member->profil->increment('saldo_poin', $transaksi->total_poin);
                }

                // 2. Kembalikan Stok Reward Per POS
                foreach ($transaksi->detail as $detail) {
                    if ($detail->reward_id && $transaksi->pos_id) {
                        \App\Models\RewardStok::updateOrCreate(
                            ['reward_id' => $detail->reward_id, 'pos_id' => $transaksi->pos_id],
                            ['stok' => DB::raw("stok + {$detail->jumlah}")]
                        );
                    }
                }

                // 3. Update Status
                $transaksi->update(['status' => 'kadaluwarsa']);
            });

            $this->info("Transaksi {$transaksi->kode_penukaran} telah dinyatakan kadaluwarsa.");
        }

        $this->info('Proses pembersihan transaksi kadaluwarsa selesai.');
    }
}
