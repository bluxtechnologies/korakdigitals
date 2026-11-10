<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'finitypay' => [
        'env' => env('FINITYPAY_ENV', 'production'), // 'sandbox' | 'production'
        'secret_key' => env('FINITYPAY_SECRET_KEY') ?: env('COFINANCE_SECRET_KEY'),
        'webhook_secret' => env('FINITYPAY_WEBHOOK_SECRET') ?: env('COFINANCE_WEBHOOK_SECRET'),
        'skip_webhook_verify' => (bool) env('FINITYPAY_SKIP_WEBHOOK_VERIFY', false),
        'sandbox_url' => env('FINITYPAY_SANDBOX_URL', 'https://api.finitypay.com.ng/v1'),
        'production_url' => env('FINITYPAY_PRODUCTION_URL', 'https://api.finitypay.com.ng/v1'),
    ],

    'cofinance' => [
        'base_url' => env('COFINANCE_BASE_URL', 'https://api.finitypay.com.ng/v1'),
        'business_id' => env('COFINANCE_BUSINESS_ID', 'b16df361104db5a9'),
        'public_key' => env('COFINANCE_PUBLIC_KEY'),
        'secret_key' => env('COFINANCE_SECRET_KEY') ?: env('FINITYPAY_SECRET_KEY'),
        'webhook_secret' => env('COFINANCE_WEBHOOK_SECRET') ?: env('FINITYPAY_WEBHOOK_SECRET'),
    ],

    'sms_activation' => [
        'base_url' => env('SMS_ACTIVATION_BASE_URL', 'https://hero-sms.com/api/v1'),
        'api_key' => env('SMS_ACTIVATION_API_KEY'),
        'webhook_secret' => env('SMS_ACTIVATION_WEBHOOK_SECRET', 'sec_wh_num_a87f1c29e4d048b6'),
    ],

];
