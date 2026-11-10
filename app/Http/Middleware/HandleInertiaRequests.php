<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\Admin;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user() ?? $request->user('admin');
        $account = null;
        $currency = null;
        $unreadNotificationsCount = 0;

        if ($user instanceof User) {
            $user->loadMissing(['account', 'currency']);
            $account = $user->account;
            $currency = $user->currency ?: ($user->user_currency_id ? Currency::find($user->user_currency_id) : null) ?: Currency::where('is_default', true)->first() ?: Currency::first();
            $unreadNotificationsCount = $user->unreadNotifications()->count();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'account' => $account,
                'currency' => $currency,
                'unread_notifications_count' => $unreadNotificationsCount,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}