<?php

namespace App\Observers;

use App\Models\TransaksiSetor;
use Illuminate\Support\Facades\Log;

class TransaksiSetorObserver
{
    /**
     * Handle the TransaksiSetor "created" event.
     */
    public function created(TransaksiSetor $transaksiSetor): void
    {
        if ($transaksiSetor->status === 'berhasil') {
            $this->incrementPoints($transaksiSetor);
        }
    }

    /**
     * Handle the TransaksiSetor "updated" event.
     */
    public function updated(TransaksiSetor $transaksiSetor): void
    {
        if ($transaksiSetor->isDirty('status')) {
            $oldStatus = $transaksiSetor->getOriginal('status');
            $newStatus = $transaksiSetor->status;

            if ($newStatus === 'berhasil' && $oldStatus !== 'berhasil') {
                $this->incrementPoints($transaksiSetor);
            } elseif ($newStatus !== 'berhasil' && $oldStatus === 'berhasil') {
                $this->decrementPoints($transaksiSetor);
            }
        }
    }

    /**
     * Increment member points.
     */
    private function incrementPoints(TransaksiSetor $transaksi): void
    {
        $profil = $transaksi->member->profil;
        if ($profil) {
            $profil->increment('saldo_poin', $transaksi->total_poin);
            Log::info("Points incremented for Member ID: {$transaksi->member_id}. Added: {$transaksi->total_poin}");
        }
    }

    /**
     * Decrement member points.
     */
    private function decrementPoints(TransaksiSetor $transaksi): void
    {
        $profil = $transaksi->member->profil;
        if ($profil) {
            $profil->decrement('saldo_poin', $transaksi->total_poin);
            Log::info("Points decremented for Member ID: {$transaksi->member_id}. Removed: {$transaksi->total_poin}");
        }
    }
}
