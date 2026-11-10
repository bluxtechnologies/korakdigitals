<?php

namespace App {

    use App\Models\Setting;

    class SettingHelper
    {
        /**
         * Get setting value by key.
         */
        public static function get(string $key, mixed $default = null): mixed
        {
            return Setting::get($key, $default);
        }

        /**
         * Set a setting value.
         */
        public static function set(string $key, mixed $value, string $group = 'general', ?string $type = null): Setting
        {
            return Setting::set($key, $value, $group, $type);
        }

        /**
         * Check if a setting key exists.
         */
        public static function has(string $key): bool
        {
            return Setting::where('key', $key)->exists();
        }

        /**
         * Forget/delete a setting key.
         */
        public static function forget(string $key): bool
        {
            return Setting::forget($key);
        }

        /**
         * Get all settings as key-value pairs (optionally filtered by group).
         */
        public static function all(?string $group = null): array
        {
            return Setting::allSettings($group);
        }
    }
}

namespace {

    use App\Models\Setting;
    use App\SettingHelper;

    if (! class_exists('SettingHelper')) {
        class_alias(SettingHelper::class, 'SettingHelper');
    }

    if (! function_exists('setting')) {
        /**
         * Global helper function to get or set site settings.
         *
         * Usage:
         * - setting('site_name')                   -> returns site_name value
         * - setting('site_name', 'Default')         -> returns site_name value or 'Default'
         * - setting(['site_name' => 'Cipher'])      -> sets site_name to 'Cipher'
         * - setting()                              -> returns all settings as array
         */
        function setting(array|string|null $key = null, mixed $default = null): mixed
        {
            if (is_null($key)) {
                return SettingHelper::all();
            }

            if (is_array($key)) {
                foreach ($key as $k => $v) {
                    SettingHelper::set($k, $v);
                }
                return true;
            }

            return SettingHelper::get($key, $default);
        }
    }

    if (! function_exists('set_setting')) {
        /**
         * Global helper function to set a setting value.
         */
        function set_setting(string $key, mixed $value, string $group = 'general', ?string $type = null): Setting
        {
            return SettingHelper::set($key, $value, $group, $type);
        }
    }
}
