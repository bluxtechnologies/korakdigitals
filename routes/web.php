<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ServiceDeskController;
use App\Http\Controllers\TempEmailController;
use App\Http\Controllers\DeveloperController;

// ─────────────────────────────────────────────────────
// Public Routes (No Authentication Required)
// ─────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');

// Authentication Routes (Guest only — redirect if already logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

// Email verification (link-based, optional)
Route::middleware('auth')->group(function () {
    Route::get('/verify-email', [AuthController::class, 'showVerifyEmail'])->name('verification.notice');
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmailLink'])
        ->middleware(['signed'])
        ->name('verification.verify');
    Route::post('/verify-email/resend', [AuthController::class, 'resendVerificationLink'])->name('verification.resend');
});

// Payment Gateway Webhooks (No auth — external callback from payment gateway)
Route::post('/funding/webhook/finitypay', [WalletController::class, 'finityPayWebhook'])
    ->name('funding.webhook.finitypay')
    ->withoutMiddleware(['web']);

Route::post('/webhooks/cofinance', [WalletController::class, 'cofinanceWebhook'])
    ->name('funding.webhook.cofinance')
    ->withoutMiddleware(['web']);

Route::post('/funding/webhook/cofinance', [WalletController::class, 'cofinanceWebhook'])
    ->name('funding.webhook.cofinance.alias')
    ->withoutMiddleware(['web']);

Route::post('/webhooks/numbers/{token}', [\App\Http\Controllers\NumbersController::class, 'webhook'])
    ->name('webhooks.numbers')
    ->withoutMiddleware(['web']);

// ─────────────────────────────────────────────────────
// Authenticated Customer Routes (prefix: /user)
// ─────────────────────────────────────────────────────
Route::middleware('auth')->prefix('user')->name('user.')->group(function () {

    // Logout (inside auth guard)
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Numbers Desk
    Route::get('/numbers', [\App\Http\Controllers\NumbersController::class, 'index'])->name('numbers');
    Route::get('/numbers/rent', [\App\Http\Controllers\NumbersController::class, 'rentIndex'])->name('numbers.rent');
    Route::get('/numbers/offers', [\App\Http\Controllers\NumbersController::class, 'offers'])->name('numbers.offers');
    Route::post('/numbers/purchase', [\App\Http\Controllers\NumbersController::class, 'purchase'])->name('numbers.purchase');
    Route::get('/numbers/status/{orderItemId}', [\App\Http\Controllers\NumbersController::class, 'status'])->name('numbers.status');
    Route::post('/numbers/cancel/{orderItemId}', [\App\Http\Controllers\NumbersController::class, 'cancel'])->name('numbers.cancel');
    Route::post('/numbers/finish/{orderItemId}', [\App\Http\Controllers\NumbersController::class, 'finish'])->name('numbers.finish');

    // Wallet & Funding
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
    Route::get('/wallet/fund', [WalletController::class, 'showFund'])->name('wallet.fund');
    Route::post('/wallet/fund/initiate', [WalletController::class, 'initiatePayment'])->name('wallet.fund.initiate');
    Route::get('/wallet/fund/verify/{reference}', [WalletController::class, 'verifyPayment'])->name('wallet.fund.verify');
    Route::post('/wallet/fund/manual', [\App\Http\Controllers\FundingRequestController::class, 'store'])->name('wallet.fund.manual');
    Route::get('/wallet/history', [WalletController::class, 'showHistory'])->name('wallet.history');
    Route::post('/wallet/switch-currency', [WalletController::class, 'switchCurrency'])->name('wallet.switch-currency');

    // Orders & Credentials Export
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::get('/orders/export/csv', [OrderController::class, 'exportCsv'])->name('orders.export.csv');
    Route::get('/orders/export/txt', [OrderController::class, 'exportTxt'])->name('orders.export.txt');

    // Service Desk Pages
    Route::get('/services', [ServiceDeskController::class, 'index'])->name('services.index');
    Route::inertia('/services/growth', 'services/growth')->name('services.growth');
    Route::inertia('/services/accounts', 'services/accounts')->name('services.accounts');
    Route::inertia('/services/vpn', 'services/vpn')->name('services.vpn');
    Route::inertia('/services/esim', 'services/esim')->name('services.esim');
    // Bills & VTU (Airtime & Mobile Data)
    Route::get('/services/airtime', [\App\Http\Controllers\BillsController::class, 'airtimeIndex'])->name('services.airtime');
    Route::get('/services/data', [\App\Http\Controllers\BillsController::class, 'dataIndex'])->name('services.data');
    Route::get('/services/data/bundles/{serviceCode}', [\App\Http\Controllers\BillsController::class, 'getBundles'])->name('services.data.bundles');
    Route::post('/services/bills/purchase', [\App\Http\Controllers\BillsController::class, 'purchase'])->name('services.bills.purchase');
    Route::inertia('/services/finance', 'services/coming-soon', ['serviceId' => 'finance'])->name('services.finance');

    // Temp Email Desk
    Route::get('/services/temp-email', [TempEmailController::class, 'index'])->name('services.temp-email');
    Route::post('/temp-email/generate', [TempEmailController::class, 'generate'])->name('temp-email.generate');
    Route::get('/temp-email/{tempEmail}/messages', [TempEmailController::class, 'checkMessages'])->name('temp-email.messages');

    // Developer Hub
    Route::get('/developer', [DeveloperController::class, 'index'])->name('developer');
    Route::post('/developer/keys', [DeveloperController::class, 'generateKey'])->name('developer.keys.store');
    Route::post('/developer/keys/{apiKey}/revoke', [DeveloperController::class, 'revokeKey'])->name('developer.keys.revoke');

    // Generic Service Order Placement
    Route::post('/services/order', [ServiceDeskController::class, 'placeOrder'])->name('services.order');

    // Account & Utility Pages
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
            Route::redirect('/settings', '/user/settings/profile')->name('settings');
        Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\SettingsController::class, 'profile'])->name('profile');
        Route::put('/profile', [\App\Http\Controllers\SettingsController::class, 'updateProfile'])->name('profile.update');
        Route::get('/security', [\App\Http\Controllers\SettingsController::class, 'security'])->name('security');
        Route::put('/security/password', [\App\Http\Controllers\SettingsController::class, 'updatePassword'])->name('security.password');
        Route::get('/activity', [\App\Http\Controllers\SettingsController::class, 'activity'])->name('activity');
        Route::get('/appearance', [\App\Http\Controllers\SettingsController::class, 'appearance'])->name('appearance');
    });
    // Support Ticket System
    Route::get('/support', [\App\Http\Controllers\SupportTicketController::class, 'index'])->name('support');
    Route::post('/support', [\App\Http\Controllers\SupportTicketController::class, 'store'])->name('support.store');
    Route::get('/support/{ticket}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->name('support.show');
    Route::post('/support/{ticket}/reply', [\App\Http\Controllers\SupportTicketController::class, 'reply'])->name('support.reply');
    Route::get('/support/{ticket}/attachment', [\App\Http\Controllers\SupportTicketController::class, 'attachment'])->name('support.attachment');
});