<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public static function get($key, $default = null)
    {
        return Setting::get($key, $default);
    }

    public static function penukaranPoinKadaluwarsaJam()
    {
        return (int) self::get('penukaran_poin_kadaluwarsa_jam', 24);
    }
}
