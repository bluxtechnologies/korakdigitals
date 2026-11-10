<?php

use App\Models\Setting;
use App\SettingHelper;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('setting model can set and get values with type casting', function () {
    Setting::set('site_title', 'My Awesome Site');
    expect(Setting::get('site_title'))->toBe('My Awesome Site');

    Setting::set('maintenance_mode', true);
    expect(Setting::get('maintenance_mode'))->toBeTrue();

    Setting::set('items_per_page', 25);
    expect(Setting::get('items_per_page'))->toBe(25);

    Setting::set('social_links', ['twitter' => '@myhandle', 'github' => 'myrepo']);
    expect(Setting::get('social_links'))->toBe(['twitter' => '@myhandle', 'github' => 'myrepo']);
});

test('setting helper class works as expected', function () {
    SettingHelper::set('contact_email', 'admin@example.com', 'contact');
    expect(SettingHelper::get('contact_email'))->toBe('admin@example.com');
    expect(SettingHelper::has('contact_email'))->toBeTrue();

    expect(SettingHelper::all('contact'))->toHaveKey('contact_email', 'admin@example.com');

    SettingHelper::forget('contact_email');
    expect(SettingHelper::has('contact_email'))->toBeFalse();
});

test('global setting helper function works globally', function () {
    setting(['site_name' => 'Cipher Digitals', 'support_phone' => '123456789']);

    expect(setting('site_name'))->toBe('Cipher Digitals');
    expect(setting('support_phone'))->toBe('123456789');
    expect(setting('non_existent', 'default_value'))->toBe('default_value');

    set_setting('app_currency', 'USD');
    expect(setting('app_currency'))->toBe('USD');
});

test('setting seeder populates default site information settings', function () {
    $this->seed(SettingSeeder::class);

    expect(setting('site_name'))->toBe('Cipher Digitals');
    expect(setting('site_email'))->toBe('support@cipherdigitals.com');
    expect(setting('maintenance_mode'))->toBeFalse();
    expect(setting('social_links'))->toBeArray()->toHaveKey('twitter');
});
