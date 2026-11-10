# CLIQ Rent Number Integration — Build Brief

Standalone follow-up to `docs/numbers-integration-brief.md` — read that brief
first (naming convention, driver pattern, auth format, catalog architecture,
and status-code caveats all apply here unchanged). This brief covers only
what's different for the **Rent Number** product mode.

## 0. What Rent Number actually is

Same `POST /activations` endpoint as Quick Activation, but with a `duration`
parameter (hours: 24/72/168/336/720/1440/2160/4320 = 1/3/7/14/30/60/90/180
days). The customer gets **extended access to the number, receiving
multiple OTPs over that period** — not a one-shot code. It has its own
lifecycle actions that Quick Activation never uses:

- **Reactivate** — resume the number after it already completed
  successfully. Optional `duration` — omitting it likely uses a default;
  confirm against real responses rather than assuming.
- **Prolong** — extend an active rental before it expires. `duration` is
  **required** here (unlike reactivate).
- Both have a matching `/options` endpoint (`GET
  .../reactivate/options`, `GET .../prolong/options`) that returns the
  real available choices **and their real prices** for that specific
  activation, shaped like:
  ```json
  { "options": [
      { "duration": { "value": 2, "unit": "hour" }, "price": 0.2145 },
      { "duration": { "value": 24, "unit": "hour" }, "price": 1.4324 }
  ]}
  ```
  Always call the relevant `/options` endpoint and show the customer real
  priced choices before calling `reactivate` or `prolong` — never assume a
  price or hardcode the duration list from this brief's example above (it's
  illustrative, not the real catalog).

## 1. `prolong` has a timing constraint the frontend must respect

`POST .../prolong` can return `425 Too Early` — meaning there's a window
before expiry during which prolonging isn't yet allowed (likely to prevent
extending a rental the instant it's purchased). Surface this as a real,
specific message if it happens ("You can extend this number starting from
[time]"), not a generic error — check the actual response body for any
timing detail HeroSMS provides before writing a generic fallback message.

## 2. "My Rented Numbers" needs different UI than Quick Activation's list

Quick Activation's active-number view is just a countdown + code display,
done. Rent Number's equivalent view needs:
- Real expiry date/time (not a short countdown — durations run up to 180
  days).
- A "Prolong" action, showing real priced options from `/prolong/options`
  before confirming.
- A way to view all OTPs received during the rental period, not just one
  (this is a genuinely multi-message inbox per number, not a single code).
- After a rental completes (customer is done with it, or it naturally lapses
  without renewal), a "Reactivate" action becomes available, again backed by
  real priced options from `/reactivate/options`.

## 3. Data model note

If `numbers-integration-brief.md`'s `Order`/`OrderItem` design didn't already
account for a number having many OTPs over time (Quick Activation only ever
has one), this brief needs that relationship to support multiple OTP records
per order — check what was actually built for Quick Activation before
assuming the schema already supports this; don't duplicate a table if the
existing one just needs a one-to-many relationship added.

## 4. Frontend — the second tab

This is the "Rent Number" tab left as a placeholder slot in
`numbers-integration-brief.md`'s page structure (§0.1 there). Build it out
for real now: duration selection sourced from real options (not the generic
enum list — the **actual purchasable durations for the selected
service+country** come from the offers/catalog endpoint, same source as
Quick Activation's catalog, just filtered to rent-eligible combinations),
real purchase flow, and the "My Rented Numbers" view from §2.

## 5. Definition of done

1. Reactivate and Prolong both fetch real `/options` before committing —
   no hardcoded duration/price assumptions.
2. `425 Too Early` on prolong is surfaced with a real, specific message.
3. Rented numbers support multiple OTPs per rental in the data model and UI,
   not just one.
4. "My Rented Numbers" clearly distinguishes active / completed /
   reactivatable states.
5. Rent Number tab fully replaces its placeholder slot from the Quick
   Activation brief — no more "coming soon" once this ships.
6. No raw Tailwind palette classes — only tokens from `app.css`.
