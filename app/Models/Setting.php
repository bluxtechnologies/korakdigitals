<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
    ];

    /**
     * Cache key prefix for site settings.
     */
    public const CACHE_PREFIX = 'site_setting_';

    /**
     * Get a setting by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever(self::CACHE_PREFIX . $key, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return static::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting key and value.
     */
    public static function set(string $key, mixed $value, string $group = 'general', ?string $type = null): static
    {
        $type = $type ?? static::detectType($value);
        $rawValue = static::serializeValue($value, $type);

        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $rawValue,
                'group' => $group,
                'type' => $type,
            ]
        );

        Cache::forever(self::CACHE_PREFIX . $key, static::castValue($rawValue, $type));

        return $setting;
    }

    /**
     * Remove a setting by key.
     */
    public static function forget(string $key): bool
    {
        Cache::forget(self::CACHE_PREFIX . $key);
        return (bool) static::where('key', $key)->delete();
    }

    /**
     * Get all settings as key => value array, optionally filtered by group.
     */
    public static function allSettings(?string $group = null): array
    {
        $query = static::query();
        if ($group) {
            $query->where('group', $group);
        }

        return $query->get()->mapWithKeys(function ($setting) {
            return [$setting->key => static::castValue($setting->value, $setting->type)];
        })->toArray();
    }

    /**
     * Detect data type from value.
     */
    protected static function detectType(mixed $value): string
    {
        return match (gettype($value)) {
            'boolean' => 'boolean',
            'integer' => 'integer',
            'double' => 'float',
            'array', 'object' => 'json',
            default => 'string',
        };
    }

    /**
     * Serialize value based on type for database storage.
     */
    protected static function serializeValue(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Cast string value from database to target PHP type.
     */
    protected static function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
