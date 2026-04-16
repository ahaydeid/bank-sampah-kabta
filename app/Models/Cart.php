<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = ['member_id'];

    public function member()
    {
        return $this->belongsTo(Pengguna::class, 'member_id');
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}
