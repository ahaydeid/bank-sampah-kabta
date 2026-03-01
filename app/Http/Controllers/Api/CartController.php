<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Reward;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $posId = $request->pos_id;
        
        $cart = Cart::firstOrCreate([
            'member_id' => $user->id
        ]);

        $query = $cart->items()->with(['reward', 'pos']);

        if ($posId) {
            $query->where('pos_id', $posId);
        }

        $items = $query->orderBy('id', 'asc')->get()->map(function ($item) use ($posId) {
            $reward = $item->reward;
            // Find stock specifically for this item's Pos (which should match the filter if provided)
            $stokPos = $reward->stokPerPos->where('pos_id', $item->pos_id)->first();
            
            // Flatten reward and add stok
            $item->reward_flattened = [
                'id' => $reward->id,
                'nama_reward' => $reward->nama_reward,
                'kategori' => $reward->kategori_reward,
                'poin_tukar' => $reward->poin_tukar,
                'foto_url' => $reward->foto_url,
                'stok' => $stokPos ? $stokPos->stok : 0,
            ];
            
            return $item;
        });

        return response()->json([
            'data' => $items,
            'total_items' => $cart->items()->count(),
        ]);
    }

    /**
     * Add or Update item in cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'reward_id' => 'required|exists:reward,id',
            'pos_id' => 'required|exists:pos_lokasi,id',
            'jumlah' => 'required|integer|min:1',
        ]);

        $rewardStok = \App\Models\RewardStok::where('reward_id', $request->reward_id)
            ->where('pos_id', $request->pos_id)
            ->first();

        if (!$rewardStok || $rewardStok->stok < $request->jumlah) {
            return response()->json(['message' => 'Stok barang di lokasi ini tidak mencukupi.'], 422);
        }

        $user = $request->user();
        
        $cart = Cart::firstOrCreate([
            'member_id' => $user->id
        ]);

        // Check if item exists, update quantity
        $item = $cart->items()
            ->where('reward_id', $request->reward_id)
            ->where('pos_id', $request->pos_id)
            ->first();

        if ($item) {
            $item->jumlah += $request->jumlah;
            $item->save();
        } else {
            $item = $cart->items()->create([
                'reward_id' => $request->reward_id,
                'pos_id' => $request->pos_id,
                'jumlah' => $request->jumlah,
            ]);
        }

        return response()->json([
            'message' => 'Item berhasil disimpan.',
            'data' => $item->load('reward')
        ]);
    }

    /**
     * Update item quantity in cart
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'jumlah' => 'required|integer|min:1',
            'pos_id' => 'nullable|exists:pos_lokasi,id',
        ]);

        $user = $request->user();
        $cart = Cart::where('member_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Keranjang kosong.'], 404);
        }

        $query = $cart->items()->where('reward_id', $id);
        
        if ($request->pos_id) {
            $query->where('pos_id', $request->pos_id);
        }

        $item = $query->first();

        if (!$item) {
            return response()->json(['message' => 'Item tidak ditemukan.'], 404);
        }

        // Validate stock
        $rewardStok = \App\Models\RewardStok::where('reward_id', $item->reward_id)
            ->where('pos_id', $item->pos_id)
            ->first();

        if (!$rewardStok || $rewardStok->stok < $request->jumlah) {
            return response()->json(['message' => 'Stok barang tidak mencukupi untuk jumlah ini.'], 422);
        }

        $item->jumlah = $request->jumlah;
        $item->save();

        return response()->json([
            'message' => 'Jumlah item berhasil diperbarui.',
            'data' => $item->load('reward')
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $cart = Cart::where('member_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Keranjang kosong.'], 404);
        }

        $query = $cart->items()->where('reward_id', $id);

        if ($request->pos_id) {
            $query->where('pos_id', $request->pos_id);
        }

        $deleted = $query->delete();

        if ($deleted) {
            return response()->json(['message' => 'Item dihapus dari keranjang.']);
        }

        return response()->json(['message' => 'Item tidak ditemukan.'], 404);
    }

    /**
     * Sync full cart (replace all items)
     */
    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'present|array',
            'items.*.reward_id' => 'required|exists:reward,id',
            'items.*.pos_id' => 'required|exists:pos_lokasi,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        
        $cart = Cart::firstOrCreate([
            'member_id' => $user->id
        ]);

        // Transaction to ensure atomicity
        \DB::transaction(function () use ($cart, $request) {
            // Delete all existing items
            $cart->items()->delete();

            // Insert new items with stock validation
            foreach ($request->items as $item) {
                $rewardStok = \App\Models\RewardStok::where('reward_id', $item['reward_id'])
                    ->where('pos_id', $item['pos_id'])
                    ->first();

                if (!$rewardStok || $rewardStok->stok < $item['jumlah']) {
                    $reward = Reward::find($item['reward_id']);
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => ["Stok {$reward->nama_reward} tidak mencukupi di lokasi yang dipilih."]
                    ]);
                }

                $cart->items()->create([
                    'reward_id' => $item['reward_id'],
                    'pos_id' => $item['pos_id'],
                    'jumlah' => $item['jumlah'],
                ]);
            }
        });

        return response()->json([
            'message' => 'Keranjang berhasil disinkronisasi.',
            'data' => $cart->refresh()->items->load('reward')
        ]);
    }
}
