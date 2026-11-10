# CLIQ Numbers Integration — Build Brief

Standalone brief, same tier as the other `docs/` briefs. Read
`docs/design-system-enforcement.md` before touching any styling, and
`docs/finitypay-integration-brief.md` for the webhook-security pattern this
should broadly mirror.

## 0. What this replaces

Two separate fakes need fixing:

1. **Frontend** — `numbers.tsx` imports hardcoded `COUNTRIES` /
   `VERIFICATION_SERVICES` arrays from `@/mock/data` and an `ActiveNumber`
   type + fake countdown/SMS simulation from `@/mock/store`. None of it is
   real.
2. **Backend** — `SupplierService::generateFulfillmentPayload()`'s `'numbers'`
   branch fakes a phone number and SMS code with `rand()`:
   ```php
   'numbers' => [
       'phone_number' => '+1 (555) ' . rand(1000000, 9999999),
       'sms_code' => (string) rand(100000, 999999),
       ...
   ],
   ```
   This is the only branch to touch. **Do not touch the growth / accounts /
   vpn / esim branches in this same method** — those stay fake for now, per
   explicit scope decision; a separate brief will cover them later.

There's also existing, well-written, **but completely unused** code:
`App\Domain\Services\Contracts\SupplierDriverInterface`, `FiveSimDriver`,
`SmmPanelDriver`, and their DTOs. Nothing in the codebase actually calls them
— `SupplierService::placeOrder()` never touches this interface at all. This
brief is the first real wiring of that interface to anything.

## 0.1 Product taxonomy — read before touching the frontend

"Virtual Number" is the umbrella category term, not a third product. Within
it, HeroSMS's `POST /activations` endpoint serves two genuinely different
products depending on whether `duration` is passed:

- **Quick Activation** (subtype 1, no `duration`) — one OTP, then done. This
  is what this entire brief covers.
- **Rent Number** (subtype 2, `duration` in hours) — extended access,
  multiple OTPs over time, with its own `reactivate`/`prolong` lifecycle.
  **Explicitly out of scope for this brief** — covered separately in
  `docs/numbers-rent-integration-brief.md`.

These should be two separate tabs on the Numbers page, not one merged flow —
they have different purchase parameters and different lifecycle actions
(Rent needs a "Renew"/"Prolong" action that Quick Activation never does).
Build the Quick Activation tab now; leave a Rent Number tab as an obvious
future slot in the page structure (e.g. a tab bar with one tab wired and a
second either hidden or marked "coming soon") rather than architecting the
page as if only one mode will ever exist — that avoids a page-structure
rewrite when the Rent brief gets picked up later.



**Do not name the new driver after the provider** (e.g. no `HeroSmsDriver`).
CLIQ may switch SMS-activation providers later, and a provider-named class
forces a rename (and probably a re-think of anyone referencing it) every time
that happens. Name it for what it *does*, not who currently provides it —
e.g. `SmsActivationDriver` or similar. This is a deliberate exception to how
`FiveSimDriver` was named; don't rename that one, just don't repeat the
pattern going forward.

## 2. Real API reference (from the actual HeroSMS OpenAPI spec provided)

**Two server surfaces exist — use the native one, not the legacy one:**
- `https://hero-sms.com/api/v1` — the real, modern REST API. **Use this.**
- `https://hero-sms.com/stubs/handler_api.php?action=...` — a legacy
  SMS-Activate-compatible shim, for tools that only know the old
  SMS-Activate API. Do not build against this; it exists for third-party
  compatibility only.

**Auth**: `Authorization: ApiKey {your_token}` header — **not** `Bearer`.
An earlier informal doc sample said `Bearer`; the actual OpenAPI spec (source
of truth) says `ApiKey`. Trust the spec.

**Key endpoints (native v1):**
- `POST /activations` — purchase. Body: `service` (2-4 letter code, e.g.
  `tg`), `country` (integer ID), `amount` (how many, 1-10), optional
  `operator`, `maxPrice`, `fixedPrice`, `duration` (rental hours, enum:
  24/72/168/336/720/1440/2160/4320 — only relevant for rentals, not plain
  activations), `verificationType` (`sms` or `call`), and **`resellerUserId`**
  — pass CLIQ's internal user ID here for reconciliation on HeroSMS's side.
  Response: array of activation objects (`id`, `status`, `phone`, `service`,
  `country`, `price`, `otpList`, `createdAt`, `expiredAt`, `verificationType`).
- `GET /activations` — list active activations (paginated, filterable).
- `GET /activations/{id}/otp/last` / `GET /activations/{id}/otp` — poll for
  the received code.
- `DELETE /activations/{id}` — cancel + refund. **Only valid if no OTP has
  been received yet**, or (for 24h+ rentals) within the first 20 minutes.
  After that window, use `finish` instead — no refund.
- `POST /activations/{id}/finish` — mark complete, **no refund**. Call this
  only after the customer has confirmed the code worked — don't call it
  automatically just because an OTP arrived, in case it was wrong/unusable.
- `GET /activations/offers/{verificationType}` — **the real catalog**, see §3.

**Response envelope**: `{ data: [...] }` on success. Errors:
`401` unauthorized, `404` not found, `422` validation
(`{ title, details, errors: { field: [messages] } }`), `500` server error,
`429` too many requests (specifically on the offers endpoint — respect this,
don't hammer it).

## 3. The catalog is live and huge — do not pre-seed it like other categories

`GET /activations/offers/{verificationType}` returns pricing/availability for
every service × country combination HeroSMS currently supports — this is
thousands of live, constantly-shifting rows (`counts.total` in the tens of
thousands per service alone), shaped like:
```
data[service_code][country_id] = {
  prices: { default, retail, min },
  counts: { total, physical, defaultPrice },
  map: { "price": count, ... }
}
```
**Do not try to mirror this whole catalog into local `services` /
`supplier_services` rows** the way growth/vpn/esim/accounts categories work
— it's impractical at this scale and would be stale the moment it's cached.
Instead: fetch this endpoint live (optionally with a short cache, e.g. a few
minutes, to avoid hammering it — respect the `429` response), and only
create real local `Order`/`OrderItem` rows **after** an actual purchase
happens. The country/service *display names* (human-readable, not the 2-4
letter codes) come from HeroSMS's classifier endpoints — check the
`Classifiers` tag in the spec for the exact shape before building the
frontend picker, don't guess at a name-mapping table.

## 4. Status handling — verify before finalizing, don't guess

The native API's `ActivationStatusTypes` is a bare integer enum
(`1,2,3,4,6,7,8,10`) with **no descriptions in the spec** for what each number
means. The legacy-compatible endpoints document the equivalent text states
clearly, though:
- `STATUS_WAIT_CODE` — waiting for SMS
- `STATUS_WAIT_RETRY:{code}` — waiting on code confirmation/clarification
- `STATUS_WAIT_RESEND` — waiting for a resend
- `STATUS_OK:{code}` — code received
- `STATUS_CANCEL` — cancelled

Use these as the interpretive guide, but **verify the actual numeric values
against real live responses** (you have real credentials — call `POST
/activations` for real and observe what status comes back at each stage)
before hardcoding a number→meaning map. Don't assume the obvious ordering.

## 5. Webhook — real-time OTP delivery, with a caveat

Webhook `sms-incoming` fires when an SMS arrives on an active activation.
Payload: `activationId`, `id`, `phoneFrom`, `service`, `text`, `code`,
`country`, `receivedAt`. Respond `200` to acknowledge — HeroSMS retries up to
7 times if you don't.

**Caveat, unlike the FinityPay integration**: this spec defines **no
signature/HMAC verification scheme at all** for this webhook. Before
building, either (a) ask HeroSMS directly whether one exists but wasn't
captured in this spec export, or (b) if genuinely none exists, mitigate by
using a long, random, unguessable webhook URL path (not just
`/webhooks/numbers`) as the de facto secret, and still validate that the
`activationId` in the payload corresponds to a real, currently-active,
CLIQ-owned activation before processing anything — never trust the payload's
claims about cost or status blindly.

**Also implement polling as a fallback** (`GET /activations/{id}/otp/last`) —
don't make the customer-facing countdown UI depend on the webhook alone,
since its delivery reliability isn't something this spec fully guarantees.

## 6. Real purchase flow (replaces the `rand()` fake)

```
Customer selects country + service (from live-fetched offers, §3)
        ↓
Check CLIQ wallet balance covers the real price from the offer
        ↓
Call POST /activations (real)
        ↓
Real phone number + real activation id + real price returned
        ↓
Create real Order + OrderItem with this real data (not rand())
        ↓
Debit wallet the real price (already-real WalletService, no change needed)
        ↓
Wait for OTP: webhook (primary) + polling fallback (§5)
        ↓
Customer confirms code worked → POST .../finish
        ↓
   OR customer got no code in time → DELETE (cancel + refund, if still eligible)
```

## 7. Wire into the existing (currently orphaned) driver pattern

Implement the new driver against `SupplierDriverInterface` (already defined,
just unused). Update `SupplierService::placeOrder()` to actually call it for
the `'numbers'` category specifically, instead of falling through to
`generateFulfillmentPayload()` for that one category. Leave
`generateFulfillmentPayload()` in place for every other category — this is a
surgical, category-scoped fix, not a rewrite of the whole method.

## 8. Frontend — `numbers.tsx`

- Structure the page around a tab bar: **Quick Activation** (build this one
  now, fully wired) and **Rent Number** (leave as a visible-but-disabled or
  hidden tab slot — see §0.1 — do not build its functionality here).
- Drop `@/mock/data` and `@/mock/store` entirely for the Quick Activation tab.
- Country/service picker sources from the real live-fetched offers (§3).
- Purchase hits the real backend flow (§6); show the real returned phone
  number, not a fabricated one.
- Countdown timer uses the real `expiredAt` from the activation response.
- OTP display updates from real backend state (webhook-driven page state
  refresh, or polling) — not a fake simulated arrival.

## 9. Definition of done

1. New driver named for its function, not "HeroSMS" (§1).
2. Real `ApiKey` auth header used, not `Bearer`.
3. Catalog fetched live with sensible caching, not pre-seeded as static rows.
4. Status number→meaning mapping verified against real API responses, not
   assumed from documentation text alone.
5. Webhook handling includes the URL-as-secret mitigation (or a confirmed
   real signature scheme if HeroSMS provides one on request) and validates
   the activation actually belongs to CLIQ before acting on it.
6. Polling fallback exists alongside the webhook.
7. Only the `'numbers'` branch of `generateFulfillmentPayload()` is replaced
   — growth/accounts/vpn/esim untouched.
8. `numbers.tsx` has zero remaining references to `@/mock/data` or
   `@/mock/store`.
9. No raw Tailwind palette classes — only tokens from `app.css`.
