# Korak Digitals — Backend API Integration & Architecture Guide
**Target System:** Standalone / Headless Laravel 11 Backend API  
**Domain:** `korakdigital.com` | **Database:** `cliqdigitalsolutions`

---

## 1. Executive Summary & Architecture Overview

When migrating Korak Digitals to a **Laravel Backend Only** architecture, the application acts as a secure, headless API engine. It sits between two layers:

```
┌────────────────────────────────────────────────────────┐
│             Decoupled Client Applications              │
│       (Next.js / React SPA / Flutter / iOS / Android)  │
└───────────────────────────┬────────────────────────────┘
                            │  HTTPS JSON REST Requests
                            │  Authorization: Bearer <token>
                            ▼
┌────────────────────────────────────────────────────────┐
│              KORAK LARAVEL BACKEND ENGINE              │
│  - Sanctum / API Key Authentication                   │
│  - Double-Entry Wallet Ledger & Multi-Currency Engine  │
│  - Order Lifecycle & Idempotency Safeguards            │
│  - Webhook Ingestion & Signature Verification          │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐  ┌───────────────────────┐
│     Banking & VTU Provider   │  │   SMS / Third-Party   │
│     (FinityPay / CoFinance)  │  │   (HeroSMS / 5SIM)    │
└──────────────────────────────┘  └───────────────────────┘
```

1. **Downstream API (Exposed by Laravel):** Consumed by your decoupled frontend apps and external API resellers using Bearer token authentication (`routes/api.php`).
2. **Upstream Provider APIs (Plugged into Laravel):** Third-party financial and telecom providers integrated via backend service classes (`App\Services\FinityPayService`, `App\Domain\Services\Drivers\*`).

---

## 2. Master Environment Variables & API Keys Reference

All keys must be placed in your `.env` file on the backend server.

### 2.1 Core Platform & Application
| Variable | Example / Recommended Value | Description |
|---|---|---|
| `APP_NAME` | `"Korak Digitals"` | Brand display name in system emails/receipts |
| `APP_ENV` | `production` (or `local` / `staging`) | Application environment |
| `APP_KEY` | `base64:...` | Run `php artisan key:generate` to populate |
| `APP_DEBUG` | `false` | Must always be `false` in production |
| `APP_URL` | `https://api.korakdigital.com` | Root URL of your backend API service |
| `FRONTEND_URL` | `https://korakdigital.com` | Origin URL of your separate frontend client (for CORS) |

### 2.2 Database (MySQL)
> [!IMPORTANT]
> The database name must remain `cliqdigitalsolutions` per persistent project architectural invariants.

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cliqdigitalsolutions
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_db_password
```

### 2.3 Banking, Virtual Accounts & Telecom VTU (FinityPay / CoFinance)
The backend uses **FinityPay** as its unified provider for:
- Auto-provisioning dedicated virtual bank accounts (Wema, Sterling, Providus).
- Real-time customer bank transfer deposit notifications via webhooks.
- Telecom airtime top-ups and mobile data bundle vending (MTN, Airtel, Glo, 9mobile).

```ini
# Environment mode: 'production' or 'sandbox'
FINITYPAY_ENV=production

# Primary FinityPay Secret Key (obtained from your FinityPay Merchant Dashboard)
FINITYPAY_SECRET_KEY=fp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret used to cryptographically verify incoming payment callbacks
FINITYPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Endpoint overrides (defaults to https://api.finitypay.com.ng/v1)
FINITYPAY_PRODUCTION_URL=https://api.finitypay.com.ng/v1
FINITYPAY_SANDBOX_URL=https://api.finitypay.com.ng/v1

# Skip webhook verification ONLY during automated offline local unit tests (never true in production)
FINITYPAY_SKIP_WEBHOOK_VERIFY=false

# Legacy / CoFinance Fallback Credentials (if using CoFinance business gateway)
COFINANCE_BUSINESS_ID=b16df361104db5a9
COFINANCE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
COFINANCE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
COFINANCE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### 2.4 SMS & Virtual Numbers (HeroSMS / 5SIM)
Used by the `SmsActivationDriver` when the numbers module is active:

```ini
SMS_ACTIVATION_BASE_URL=https://hero-sms.com/api/v1
SMS_ACTIVATION_API_KEY=hero_live_xxxxxxxxxxxxxxxxxxxxxxxx
SMS_ACTIVATION_WEBHOOK_SECRET=sec_wh_num_a87f1c29e4d048b6

# Alternative provider driver (if using 5sim)
FIVESIM_API_KEY=fivesim_token_xxxxxxxxxxxxxxxxxxxx
```

### 2.5 Transactional Email & Notifications
```ini
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@korakdigital.com
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@korakdigital.com"
MAIL_FROM_NAME="${APP_NAME}"

# Or if using Resend / Postmark:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
POSTMARK_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 3. How Upstream Provider APIs Are Plugged In

### 3.1 FinityPay / CoFinance Architecture
The integration is encapsulated inside [`app/Services/FinityPayService.php`](file:///c:/laravel-project/backend/cliqdigitalsolutions/app/Services/FinityPayService.php) and bound via Laravel dependency injection.

#### Configuration Mapping:
In `config/services.php`:
```php
'finitypay' => [
    'env' => env('FINITYPAY_ENV', 'production'),
    'secret_key' => env('FINITYPAY_SECRET_KEY') ?: env('COFINANCE_SECRET_KEY'),
    'webhook_secret' => env('FINITYPAY_WEBHOOK_SECRET') ?: env('COFINANCE_WEBHOOK_SECRET'),
    'skip_webhook_verify' => (bool) env('FINITYPAY_SKIP_WEBHOOK_VERIFY', false),
    'sandbox_url' => env('FINITYPAY_SANDBOX_URL', 'https://api.finitypay.com.ng/v1'),
    'production_url' => env('FINITYPAY_PRODUCTION_URL', 'https://api.finitypay.com.ng/v1'),
],
```

#### Core Methods & Workflows:
1. **Virtual Account Generation:**
   ```php
   // Automatically provisions bank account upon customer profile creation / funding view
   $response = $this->finityPayService->createVirtualAccount($user);
   // Returns: ['bank_name' => 'WEMA BANK', 'account_number' => '9921445678', 'account_name' => 'Korak / John Doe']
   ```
2. **Data Bundle Lookup:**
   ```php
   // Retrieves real-time data plans directly from telco gateway
   $bundles = $this->finityPayService->getDataBundles('MTN_DATA');
   ```
3. **Airtime & Data Vending:**
   ```php
   $res = $this->finityPayService->payBill([
       'service_code' => 'MTN_VTU', // or MTN_DATA, AIRTEL_DATA, GLO_DATA, 9MOBILE_DATA
       'customer_identifier' => '08031234567',
       'amount' => 1000,
       'reference' => 'KORAK-VTU-884912',
       'variation_code' => 'mtn-1gb-sme', // required for data bundles
   ]);
   ```

#### Webhook Handling:
- **Endpoint:** `POST https://api.korakdigital.com/funding/webhook/finitypay`
- **Controller Action:** `App\Http\Controllers\WalletController@finityPayWebhook`
- **Security Check:** FinityPay passes `x-finitypay-signature` in headers. The service verifies the signature using `hash_hmac('sha512', $payload, $secret)`.
- **Fulfillment:** On confirmation, `App\Services\WalletService::creditWallet()` deposits funds into the user's ledger idempotently using the unique transaction reference.

---

## 4. Enabling Laravel Headless REST API (Downstream)

To run as a pure backend API without Inertia rendering:

### 4.1 Route Registration in `bootstrap/app.php`
Ensure `routes/api.php` is registered in `bootstrap/app.php`:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enforce JSON responses for all API calls
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
```

### 4.2 Cross-Origin Resource Sharing (CORS)
When your frontend runs on a separate domain (e.g. `https://korakdigital.com` or `http://localhost:3000`), publish and configure CORS:

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'funding/webhook/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'https://korakdigital.com'),
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## 5. Downstream REST API Specification

All API endpoints accept and return `application/json`.  
Base URL: `https://api.korakdigital.com/api/v1`

### 5.1 Authentication

#### 1. Register Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "08031234567",
    "password": "SecurePassword123!",
    "password_confirmation": "SecurePassword123!"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "token": "1|raW9c8Zkxxxxxxxxxxxxxxxxxxxxxxx",
      "user": {
        "id": 42,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "08031234567"
      }
    }
  }
  ```

#### 2. Customer Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Payload:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "2|pbY4x9Lkxxxxxxxxxxxxxxxxxxxxxxx",
      "user": {
        "id": 42,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  }
  ```

---

### 5.2 Wallet & Virtual Accounts

#### 1. Get Wallet Balance & Virtual Account
- **Endpoint:** `GET /api/v1/wallet`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "available_balance": 15450.00,
      "ledger_balance": 15450.00,
      "currency": {
        "code": "NGN",
        "symbol": "₦",
        "rate": 1500.0
      },
      "virtual_account": {
        "bank_name": "WEMA BANK",
        "account_number": "9921445678",
        "account_name": "Korak / Jane Doe"
      }
    }
  }
  ```

#### 2. Switch Display / Base Currency
- **Endpoint:** `POST /api/v1/wallet/switch-currency`
- **Headers:** `Authorization: Bearer <token>`
- **Payload:**
  ```json
  {
    "currency_id": 2
  }
  ```

---

### 5.3 Telecom Airtime & Mobile Data (Active Working Services)

#### 1. List Supported Networks
- **Endpoint:** `GET /api/v1/bills/networks`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "mtn",
        "name": "MTN Nigeria",
        "airtime_service": "MTN_VTU",
        "data_service": "MTN_DATA",
        "color": "#EAB308"
      },
      {
        "id": "airtel",
        "name": "Airtel Nigeria",
        "airtime_service": "AIRTEL_VTU",
        "data_service": "AIRTEL_DATA",
        "color": "#EF4444"
      },
      {
        "id": "glo",
        "name": "Glo Nigeria",
        "airtime_service": "GLO_VTU",
        "data_service": "GLO_DATA",
        "color": "#22C55E"
      },
      {
        "id": "9mobile",
        "name": "9mobile Nigeria",
        "airtime_service": "9MOBILE_VTU",
        "data_service": "9MOBILE_DATA",
        "color": "#10B981"
      }
    ]
  }
  ```

#### 2. Get Live Data Bundles for Network
- **Endpoint:** `GET /api/v1/bills/data-bundles?service_code=MTN_DATA`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "service_code": "MTN_DATA",
    "bundles": [
      {
        "variation_code": "mtn-1gb-sme",
        "name": "MTN 1.0 GB SME (30 Days)",
        "price": 290.00,
        "validity": "30 Days"
      },
      {
        "variation_code": "mtn-2gb-sme",
        "name": "MTN 2.0 GB SME (30 Days)",
        "price": 580.00,
        "validity": "30 Days"
      },
      {
        "variation_code": "mtn-5gb-sme",
        "name": "MTN 5.0 GB SME (30 Days)",
        "price": 1450.00,
        "validity": "30 Days"
      }
    ]
  }
  ```

#### 3. Purchase Airtime or Data Bundle
- **Endpoint:** `POST /api/v1/bills/purchase`
- **Headers:** `Authorization: Bearer <token>`
- **Payload (Airtime Top-up):**
  ```json
  {
    "service_type": "airtime",
    "service_code": "MTN_VTU",
    "phone": "08031234567",
    "amount": 1000
  }
  ```
- **Payload (Data Bundle):**
  ```json
  {
    "service_type": "data",
    "service_code": "MTN_DATA",
    "variation_code": "mtn-2gb-sme",
    "phone": "08031234567",
    "amount": 580
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "message": "Bill purchase processed successfully",
    "order": {
      "id": 1084,
      "public_reference": "KORAK-VTU-482910",
      "service_category": "data",
      "total_amount": 580.00,
      "status": "completed",
      "created_at": "2026-11-14T19:30:00Z"
    }
  }
  ```

---

### 5.4 Transactions & Order History

#### 1. Fetch Ledger Transactions
- **Endpoint:** `GET /api/v1/transactions`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&type=all|credit|debit&search=keyword`
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 512,
        "reference": "ORD-DR-AB910291",
        "type": "debit",
        "category": "service_purchase",
        "amount": 580.00,
        "currency_code": "NGN",
        "description": "Order for MTN 2.0 GB SME Data to 08031234567",
        "balance_after": 14870.00,
        "created_at": "2026-11-14T19:30:00Z"
      }
    ]
  }
  ```

---

## 6. Provider Webhook Integration & Testing

### 6.1 Configuring Provider Webhook URLs
Register the following webhook URLs inside your respective provider dashboards:

| Provider | Webhook Event | Destination URL | Method |
|---|---|---|---|
| **FinityPay** | Bank Transfer Deposit / Collection | `https://api.korakdigital.com/funding/webhook/finitypay` | `POST` |
| **CoFinance** | Virtual Account Credit Notification | `https://api.korakdigital.com/webhooks/cofinance` | `POST` |
| **HeroSMS** | SMS OTP Reception | `https://api.korakdigital.com/webhooks/numbers/{token}` | `POST` |

### 6.2 FinityPay Sample Webhook Ingestion Payload
When a customer transfers money to their dedicated virtual account, FinityPay dispatches:

```json
{
  "event": "charge.success",
  "data": {
    "reference": "FP_DEP_9918237198",
    "amount": 10000.00,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "jane@example.com",
      "phone": "08031234567"
    },
    "payment_method": "bank_transfer",
    "account_number": "9921445678",
    "bank_name": "WEMA BANK",
    "created_at": "2026-11-14T19:25:00Z"
  }
}
```

The Laravel handler matches the account number or email, performs idempotent crediting on the `accounts` table, logs a `credit` entry in `ledger_entries`, and triggers a real-time notification to the customer.

---

## 7. Migration Checklist to Pure Laravel Backend

1. **Verify Environment Variables:** Confirm `.env` has all `FINITYPAY_*` and `DB_*` variables populated.
2. **Execute Schema Migrations:** Run `php artisan migrate --force` to ensure all tables exist (`users`, `accounts`, `ledger_entries`, `orders`, `order_items`, `services`, `currencies`).
3. **Seed Baseline Data:** Ensure standard currencies (NGN & USD) and service active flags are seeded:
   ```bash
   php artisan db:seed --class=DatabaseSeeder --force
   ```
4. **Register API Routes:** Ensure `routes/api.php` handles incoming JSON API traffic cleanly.
5. **Configure Reverse Proxy / SSL:** Point `api.korakdigital.com` (or your chosen API domain) to Laravel's `/public` folder with HTTPS enabled.
6. **Set Webhooks in Provider Portal:** Paste the webhook URLs into FinityPay and ensure the Webhook Secret in `.env` matches the merchant console.
