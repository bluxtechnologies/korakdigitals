<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;

// Admin Authentication (Guest only)
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
});

// Admin Panel (Guarded by admin session guard)
Route::middleware('auth:admin')->prefix('admin')->name('admin.')->group(function () {

    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->name('dashboard');

    // User Directory & Nested User Portfolio Suite
    Route::get('/users', [AdminDashboardController::class, 'users'])->name('users');
    Route::post('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/wallet', [\App\Http\Controllers\Admin\AdminUserController::class, 'wallet'])->name('users.portfolio.wallet');
    Route::get('/users/{user}/orders', [\App\Http\Controllers\Admin\AdminUserController::class, 'orders'])->name('users.portfolio.orders');
    Route::get('/users/{user}/funding', [\App\Http\Controllers\Admin\AdminUserController::class, 'funding'])->name('users.portfolio.funding');
    Route::get('/users/{user}/temp-emails', [\App\Http\Controllers\Admin\AdminUserController::class, 'tempEmails'])->name('users.portfolio.temp-emails');
    Route::get('/users/{user}/api-keys', [\App\Http\Controllers\Admin\AdminUserController::class, 'apiKeys'])->name('users.portfolio.api-keys');
    Route::post('/users/{user}/api-keys/{api_key}/revoke', [\App\Http\Controllers\Admin\AdminUserController::class, 'revokeApiKey'])->name('users.portfolio.api-keys.revoke');
    Route::get('/users/{user}/audit-logs', [\App\Http\Controllers\Admin\AdminUserController::class, 'auditLogs'])->name('users.portfolio.audit-logs');
    Route::get('/users/{user}/support', [\App\Http\Controllers\Admin\AdminUserController::class, 'support'])->name('users.portfolio.support');
    Route::get('/users/{user}/edit', [\App\Http\Controllers\Admin\AdminUserController::class, 'edit'])->name('users.portfolio.edit');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/wallet-adjust', [AdminDashboardController::class, 'adjustWallet'])->name('users.wallet-adjust');

    // Orders Management
    Route::get('/orders', [AdminDashboardController::class, 'orders'])->name('orders');
    Route::post('/orders/{order}/refund', [AdminDashboardController::class, 'refundOrder'])->name('orders.refund');

    // Funding Requests
    Route::get('/funding-requests', [AdminDashboardController::class, 'fundingRequests'])->name('funding-requests');
    Route::post('/funding-requests/{funding_request}/approve', [\App\Http\Controllers\FundingRequestController::class, 'approve'])->name('funding-requests.approve');
    Route::post('/funding-requests/{funding_request}/reject', [\App\Http\Controllers\FundingRequestController::class, 'reject'])->name('funding-requests.reject');

    // Support Inbox (Standalone triage queue per brief exception)
    Route::get('/support', [\App\Http\Controllers\Admin\AdminSupportController::class, 'index'])->name('support');
    Route::get('/support/{ticket}', [\App\Http\Controllers\Admin\AdminSupportController::class, 'show'])->name('support.show');
    Route::post('/support/{ticket}/reply', [\App\Http\Controllers\Admin\AdminSupportController::class, 'reply'])->name('support.reply');
    Route::post('/support/{ticket}/status', [\App\Http\Controllers\Admin\AdminSupportController::class, 'updateStatus'])->name('support.status');
    Route::get('/support/{ticket}/attachment', [\App\Http\Controllers\Admin\AdminSupportController::class, 'attachment'])->name('support.attachment');

    // Notifications & Broadcast Campaigns
    Route::get('/notifications', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'index'])->name('notifications.index');
    Route::post('/notifications', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'store'])->name('notifications.store');
    Route::get('/notifications/{notification}', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'show'])->name('notifications.show');
    Route::patch('/notifications/{notification}', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'update'])->name('notifications.update');
    Route::post('/notifications/{notification}/activate', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'activate'])->name('notifications.activate');
    Route::post('/notifications/{notification}/pause', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'pause'])->name('notifications.pause');
    Route::delete('/notifications/{notification}', [\App\Http\Controllers\Admin\AdminNotificationCampaignController::class, 'destroy'])->name('notifications.destroy');

    // Service Catalogue Management
    Route::get('/services', [\App\Http\Controllers\Admin\AdminServiceController::class, 'index'])->name('services');
    Route::post('/services', [\App\Http\Controllers\Admin\AdminServiceController::class, 'store'])->name('services.store');
    Route::get('/services/{service}', [\App\Http\Controllers\Admin\AdminServiceController::class, 'show'])->name('services.show');
    Route::put('/services/{service}', [\App\Http\Controllers\Admin\AdminServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [\App\Http\Controllers\Admin\AdminServiceController::class, 'destroy'])->name('services.destroy');
    Route::post('/services/{service}/toggle-status', [\App\Http\Controllers\Admin\AdminServiceController::class, 'toggleStatus'])->name('services.toggle-status');

    // Administrators Management (Security & Staff RBAC)
    Route::get('/administrators', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'index'])->name('administrators');
    Route::post('/administrators', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'store'])->name('administrators.store');
    Route::get('/administrators/{adminUser}', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'show'])->name('administrators.show');
    Route::put('/administrators/{adminUser}', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'update'])->name('administrators.update');
    Route::delete('/administrators/{adminUser}', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'destroy'])->name('administrators.destroy');
    Route::post('/administrators/{adminUser}/toggle-status', [\App\Http\Controllers\Admin\AdminOperatorController::class, 'toggleStatus'])->name('administrators.toggle-status');

    // Audit Logs
    Route::get('/audit-logs', [AdminDashboardController::class, 'auditLogs'])->name('audit-logs');

    // System Settings & Upstream Configurations
    Route::get('/settings/general', [\App\Http\Controllers\Admin\AdminSettingController::class, 'index'])->name('settings.general');
    Route::put('/settings/general', [\App\Http\Controllers\Admin\AdminSettingController::class, 'update'])->name('settings.general.update');
    Route::get('/settings/pricing', [\App\Http\Controllers\Admin\AdminPricingController::class, 'index'])->name('settings.pricing');
    Route::post('/settings/currencies', [\App\Http\Controllers\Admin\AdminPricingController::class, 'storeCurrency'])->name('settings.currencies.store');
    Route::put('/settings/currencies/{currency}', [\App\Http\Controllers\Admin\AdminPricingController::class, 'updateCurrency'])->name('settings.currencies.update');
    Route::post('/settings/pricing-rules', [\App\Http\Controllers\Admin\AdminPricingController::class, 'storePricingRule'])->name('settings.pricing-rules.store');
    Route::put('/settings/pricing-rules/{pricingRule}', [\App\Http\Controllers\Admin\AdminPricingController::class, 'updatePricingRule'])->name('settings.pricing-rules.update');
    Route::delete('/settings/pricing-rules/{pricingRule}', [\App\Http\Controllers\Admin\AdminPricingController::class, 'destroyPricingRule'])->name('settings.pricing-rules.destroy');
    // Upstream Suppliers & Integrations
    Route::get('/settings/suppliers', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'index'])->name('settings.suppliers');
    Route::post('/settings/suppliers', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'store'])->name('settings.suppliers.store');
    Route::get('/settings/suppliers/{supplier}', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'show'])->name('settings.suppliers.show');
    Route::put('/settings/suppliers/{supplier}', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'update'])->name('settings.suppliers.update');
    Route::delete('/settings/suppliers/{supplier}', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'destroy'])->name('settings.suppliers.destroy');
    Route::post('/settings/suppliers/{supplier}/toggle-status', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'toggleStatus'])->name('settings.suppliers.toggle-status');
    Route::post('/settings/suppliers/{supplier}/services', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'storeService'])->name('settings.suppliers.services.store');
    Route::put('/settings/suppliers/{supplier}/services/{supplierService}', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'updateService'])->name('settings.suppliers.services.update');
    Route::delete('/settings/suppliers/{supplier}/services/{supplierService}', [\App\Http\Controllers\Admin\AdminSupplierController::class, 'destroyService'])->name('settings.suppliers.services.destroy');
});