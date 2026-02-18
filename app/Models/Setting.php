<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'label',
    ];

    /**
     * Get setting value by key.
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Cast value based on type.
     */
    protected static function castValue($value, $type)
    {
        switch ($type) {
            case 'integer':
            case 'int':
                return (int) $value;
            case 'boolean':
            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'json':
            case 'array':
                return json_decode($value, true);
            default:
                return $value;
        }
    }
}
