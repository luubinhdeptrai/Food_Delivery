# Unit Testing Implementation Summary

**Date:** 2026-05-30
**Scope:** `apps/api` (NestJS backend)
**Outcome:** All 33 test suites passing — 504 tests, 0 failures.

---

## 1. Objective

Establish a production-grade unit-test foundation for the highest-risk
business-critical modules in the SoLi backend. Phase 1 focused on:

- Security-critical paths (HMAC signing, RBAC)
- Money math (promotion discounts, VND rounding)
- State machines (order lifecycle transitions)
- Multi-tenant invariants (single-restaurant cart, restaurant ownership)

**Phase 2** (this session) eliminated the remaining critical gaps:

- Order placement (full checkout orchestration + 10+ dependency mocks)
- Order history (actor-based read access + ownership checks)
- Payment IPN processing (VNPay signature, amount match, idempotency)
- Payment service (VNPay URL generation, transaction lifecycle)
- Promotion service (reserve/confirm/rollback flow with counter atomicity)
- Order lifecycle events (PaymentConfirmed, PaymentFailed, OrderCancelledAfterPayment)
- Order timeout cron task
- Image service (pagination clamping)

---

## 2. Test Infrastructure

No new infrastructure was needed — the existing Jest + ts-jest setup defined
in `apps/api/package.json` already supports:

- `rootDir: src`, `testRegex: .*\.spec\.ts$`
- Path alias `@/*` → `src/*` via `moduleNameMapper`
- `setupFilesAfterEach: <rootDir>/test-setup.ts`
- ESM transform allowlist for `@thallesp/nestjs-better-auth` etc.

No additional dependencies were installed. All new tests use Jest's built-in
mocking (`jest.fn`, manual mock objects) — `jest-mock-extended` was not
required.

---

## 3. New Test Suites Added

### Phase 1

| Module                                                     | File                                                        | Tests   |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| RBAC utility                                               | `auth/role.util.spec.ts`                                    | 17      |
| Order state-machine constants                              | `order-lifecycle/constants/transitions.spec.ts`             | 21      |
| Promotion pricing engine                                   | `promotion/engine/promotion-pricing-engine.spec.ts`         | 16      |
| VNPay payment adapter (HMAC SHA512 sign/verify)            | `payment/services/vnpay.service.spec.ts`                    | 13      |
| Order lifecycle ownership service                          | `order-lifecycle/services/order-lifecycle.service.spec.ts`  | 9       |
| Order transition handler (state machine core)              | `order-lifecycle/commands/transition-order.handler.spec.ts` | 13      |
| Restaurant service (UC-27 approval, ownership, pagination) | `restaurant-catalog/restaurant/restaurant.service.spec.ts`  | 16      |
| Cart service (BR-2, snapshot validation, modifier rules)   | `ordering/cart/cart.service.spec.ts`                        | 19      |
| **Phase 1 total**                                          |                                                             | **136** |

### Phase 2

| Module                                                   | File                                                                | Tests   |
| -------------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| Order timeout cron task                                  | `ordering/order-lifecycle/tasks/order-timeout.task.spec.ts`         | 7       |
| PaymentConfirmedEventHandler (T-02 transition)           | `ordering/order-lifecycle/events/payment-confirmed.handler.spec.ts` | 6       |
| PaymentFailedEventHandler (T-03 transition)              | `ordering/order-lifecycle/events/payment-failed.handler.spec.ts`    | 6       |
| Process IPN handler (VNPay IPN orchestration)            | `payment/commands/process-ipn.handler.spec.ts`                      | 18      |
| Payment service (VNPay URL generation, tx lifecycle)     | `payment/services/payment.service.spec.ts`                          | 11      |
| OrderCancelledAfterPaymentHandler (refund orchestration) | `payment/events/order-cancelled-after-payment.handler.spec.ts`      | 11      |
| Order history service (actor-based read access)          | `ordering/order-history/services/order-history.service.spec.ts`     | 22      |
| Promotion service (reserve/confirm/rollback + quota)     | `promotion/services/promotion.service.spec.ts`                      | 26      |
| Image service (pagination clamping, create passthrough)  | `image/image.service.spec.ts`                                       | 9       |
| PlaceOrderHandler (full checkout orchestration)          | `ordering/order/commands/place-order.handler.spec.ts`               | 25      |
| **Phase 2 total**                                        |                                                                     | **141** |

**Combined total: 277 new tests across 18 new suites**

---

## 4. Business Flows Covered

### Phase 1 (unchanged — see Phase 1 section below)

### Phase 2 Additions

#### PlaceOrderHandler (checkout orchestration)

- D5-A idempotency cache hit → returns cached order without touching DB or cart
- Cart lock conflict (SET NX fails) → `ConflictException`
- Lock released in `finally` block even when inner step throws
- Empty / null cart → `BadRequestException`
- Restaurant snapshot missing → `UnprocessableEntityException`
- Restaurant not approved → `UnprocessableEntityException`
- Restaurant closed → `UnprocessableEntityException`
- Menu item snapshot missing → `UnprocessableEntityException`
- C-2 cross-restaurant contamination guard → `UnprocessableEntityException`
- Item out_of_stock / unavailable → `UnprocessableEntityException`
- Items total = 0 (zero-price item) → `UnprocessableEntityException`
- Delivery outside all zones → `UnprocessableEntityException`
- Happy path COD: persisted order returned, `OrderPlacedEvent` published, cart cleared
- Happy path VNPay: `paymentUrl` attached to order
- VNPay URL failure: order still returned (resilient; timeout task handles cleanup)
- Promotion reserved → `confirmReservations` called with the new orderId
- DB transaction fails → `rollbackReservations` called before re-throw
- No promotion → `rollbackReservations` not called on failure
- D5-B UNIQUE(cartId) violation caught and re-raised
- C-1 fix: idempotency key persisted to Redis **before** cart clear

#### Order History Service

- Customer `getCustomerOrders`: passes customerId, paginates, maps to DTO
- Customer `getCustomerOrderDetail`: ownership check, `hasReview` from DB
- Customer `getCustomerOrderDetail`: foreign customer → `NotFoundException` (disguised)
- Customer `getCustomerReorderItems`: returns items, enforces ownership
- Restaurant `getRestaurantOrders`: resolves restaurantId via owner snapshot
- Restaurant `getRestaurantOrders`: no snapshot → `ForbiddenException`
- Restaurant `getRestaurantActiveOrders`: same snapshot lookup, same guard
- Shipper `getAvailableOrders` / `getShipperActiveOrder` / `getShipperHistory`
- Admin `getAllOrders` / `getAnyOrderDetail`: no ownership restriction
- Admin `getAnyOrderDetail`: missing order → `NotFoundException`

#### Payment IPN Handler

- Missing/invalid signature → `RspCode 97` (returns `{RspCode: '97', Message: 'Fail'}`)
- Transaction not found → `RspCode 01` (IPN received before row exists)
- Terminal state idempotency → `RspCode 00` without re-publishing event
- Amount mismatch (1 VND difference) → `RspCode 04`
- Success path → `PaymentConfirmedEvent` published, status = `completed`
- Failure path → `PaymentFailedEvent` published, status = `failed`
- Optimistic lock lost (concurrent IPN) → re-raised and NOT swallowed

#### Payment Service

- `initiateVNPayPayment`: creates transaction row **before** requesting URL
- Transaction status = `pending`, `version = 0` at creation
- `updateToAwaitingIpn` called after URL generated
- Config-driven `expiresAt` (`VNPAY_PAYMENT_TIMEOUT_SECONDS`)
- Resilient to `null` optimistic-lock result (no crash)
- `getMyPayments` returns paginated transactions for the customer

#### OrderCancelledAfterPaymentHandler

- Null transaction → swallowed (no refund attempt)
- Non-positive `paidAmount` → swallowed (safety guard)
- Already-refunded state → swallowed (idempotency)
- Completed → `refund_pending` → `refunded` two-step transition with optimistic lock
- All errors swallowed (event handler must never crash the bus)

#### Promotion Service

- `previewDiscount` auto-apply: empty list → not applicable; eligible → discount returned
- `previewDiscount` auto-apply: per-user quota exhausted → not applicable
- `previewDiscount` coupon: not found → reason in response; promotion absent → not applicable
- `previewDiscount` coupon: eligible → `applicable=true`, `couponCodeId` set
- Coupon code normalized to uppercase before lookup
- `computeAndReserveDiscount`: no promotion → `reserved=false`
- `computeAndReserveDiscount`: eligible auto-apply → `reserved=true`, `usageId` returned
- Quota exhausted (`atomicIncrementUses` → false) → `reserved=false` with reason
- Per-user quota exceeded → `reserved=false`
- Increment happens before usage row insertion (ordering enforced)
- Coupon increment fails → promotion increment rolled back (`decrementUses` called)
- Unexpected DB error → graceful `reserved=false` (no throw)
- `confirmReservations`: calls repo, swallows errors
- `rollbackReservations`: decrements both promotion and coupon counters; no-op on empty; swallows errors
- `listPublicActive`: passes `restaurantId` + current date, returns promotions, empty ok

#### Order Lifecycle Events & Timeout

- `PaymentConfirmedEventHandler`: T-02 dispatched for valid VNPay order; null order / COD / amount-mismatch discarded; epsilon comparison; command bus error swallowed
- `PaymentFailedEventHandler`: T-03 dispatched; reason forwarded as note; errors swallowed
- `OrderTimeoutTask`: dispatches `TransitionOrderCommand` to `cancelled` for each expired order; per-order failures do not abort batch; DB query failure handled gracefully

#### Image Service

- `findAll`: default limit=20, max=100, min=1, offset clamped ≥ 0
- `create`: passes dto fields to repo, propagates errors

---

## 5. Phase 1 Business Flows (retained)

### Security

- VNPay HMAC SHA512 round-trip (sign → verify)
- IPN rejection on missing or mismatched `vnp_SecureHash`
- `vnp_SecureHashType` correctly stripped before re-signing
- Localhost IP sanitization (`127.0.0.1`, `::1`, `::ffff:` mapped IPv6)
- Constant-time hash comparison (case-insensitive)
- RBAC `hasRole()` — case-insensitive, array, comma-separated, whitespace handling

### Order State Machine (D6-A)

- Structural integrity of `TRANSITIONS` map (all 12 entries T-01..T-12)
- Admin presence on all manual transitions; `pending→paid` system-only
- Note requirement on all cancel/refund transitions (T-03/T-05/T-07/T-12)
- `triggersRefundIfVnpay` on T-05 and T-07
- `triggersReadyForPickup` on T-08 only
- `delivered→refunded` is admin-only (T-12)
- `ALLOWED_TRANSITIONS` and `TRANSITIONS` kept in perfect sync

### Order Transition Handler

- Idempotent same-status returns order without DB writes
- Invalid transition → `UnprocessableEntityException`
- Role not in `allowedRoles` → `ForbiddenException`
- T-01 with VNPay + restaurant role rejected
- Note-required transition without note → `BadRequestException`
- Shipper T-10/T-11 enforces `shipperId` match
- Optimistic-lock failure → `ConflictException`
- Happy path persists status + writes audit log + publishes `OrderStatusChangedEvent`
- T-08 publishes `OrderReadyForPickupEvent`
- T-05 VNPay publishes `OrderCancelledAfterPaymentEvent`
- T-09 self-assign writes `shipperId` into update payload

### Cart (Ordering BC)

- BR-2 single-restaurant cart enforced (`ConflictException`)
- Quantity cap at 99 (`BadRequestException`)
- Snapshot missing + modifiers sent → `BadRequestException` (Case 2 fix)
- Snapshot restaurant mismatch → `ConflictException`
- Snapshot status `out_of_stock` → `ConflictException`
- Auto-default modifier injection BEFORE minSelections check (Case 8 fix)
- `minSelections` violation with no default → `BadRequestException`
- Unavailable explicit option → `BadRequestException` (Case 11 fix)
- `updateItemQuantity(0)` removes item; cart empty → Redis key deleted, returns `null`
- `removeItem` / `updateItemQuantity` / `updateItemModifiers` NotFound paths

### Promotion Pricing

- Date-range eligibility (not started / expired)
- `minOrderAmount` gate (rejects below, allows equal)
- Quota exhaustion check
- Percentage: floor-to-1000 rounding, `maxDiscountAmount` cap, capped at subtotal
- Fixed amount: capped at subtotal, floored to 1000
- Free delivery: full shipping zero-out; rejected when shipping already 0
- Reduced delivery: capped at shipping fee
- `buy_x_get_y` / `free_item` → not eligible (Phase PR-4 placeholder)
- Breakdown shape verified on both eligible and ineligible paths

### Restaurant (UC-27 Admin Approval)

- `findAll` forces `approvedOnly: true` and clamps limit to `MAX_PAGE_SIZE` (100)
- `findAllAdmin` uses `approvedOnly: false`
- `findOne` throws `NotFoundException` when missing
- `update` ownership: non-admin non-owner → `ForbiddenException`; admin can update any
- `update` race condition (`repo.update` → undefined) → `NotFoundException`
- `remove` publishes `RestaurantUpdatedEvent` with `isOpen=false, isApproved=false`
- `setApproved(true)` promotes owner role `user` → `restaurant` via raw DB update
- `setApproved(false)` does NOT touch the owner's role
- `assertOpenAndApproved` throws `ConflictException` for either flag

---

## 6. Defects Found During Phase 2

### Bug discovered in tests: `makeMenuItemSnapshot` used wrong field name

**Description:** The initial `place-order.handler.spec.ts` helper used `basePrice` as the
snapshot field name, but the handler reads `snapshot.price`. With `basePrice: 0` in the
mock the handler computed `NaN` instead of `0`, causing the total-guard check to silently
pass (NaN comparisons are always false).

**Fix applied:** Changed mock helper to use `price` (matching the actual
`ordering_menu_item_snapshots` schema column). The zero-price guard test now correctly
triggers `UnprocessableEntityException`.

**Source impact:** None — production code was correct; only the test helper had the wrong field name.

---

## 7. Test Run Results

| Metric      | Phase 1 baseline | Phase 2 result | Delta |
| ----------- | ---------------- | -------------- | ----- |
| Test suites | 23               | 33             | +10   |
| Tests       | 361              | 504            | +143  |
| Runtime     | ~19 s            | ~25 s          | n/a   |
| Failures    | 0                | 0              | 0     |

```
Test Suites: 33 passed, 33 total
Tests:       504 passed, 504 total
Snapshots:   0 total
Ran all test suites.
```

---

## 8. What Was NOT Tested (Honest Gap Report)

The following modules remain without dedicated unit tests:

- `promotion/repositories/*` — raw SQL queries (integration-test territory)
- `promotion/controllers/*` — HTTP layer (E2E recommended)
- `restaurant-catalog/menu/*`, `modifiers/*`, `zones/*`, `search/*` — service + repo layers
- `notification/repositories/*`, `notification/gateway/*`
- Most controllers (HTTP layer — integration/E2E tests recommended over unit)
- `ordering/cart/cart.redis-repository.ts` — Redis-level operations

These are intentionally deferred. Controllers and repositories are best exercised
via integration or E2E tests with real infrastructure, not unit mocks.

---

## 9. Final Outcome

All highest-risk business-critical modules now have a comprehensive unit-test
safety net covering the full ordering lifecycle: cart → checkout → payment →
lifecycle events → history queries. Regressions in any of these will surface
immediately in CI.

**Status: Phase 2 complete — 504 tests, 33 suites, 0 failures.**

---

## 1. Objective

Establish a production-grade unit-test foundation for the highest-risk
business-critical modules in the SoLi backend. Focus was placed on:

- Security-critical paths (HMAC signing, RBAC)
- Money math (promotion discounts, VND rounding)
- State machines (order lifecycle transitions)
- Multi-tenant invariants (single-restaurant cart, restaurant ownership)

Full backend coverage of every untested module (~60 files) is a multi-day
initiative and is **explicitly out of scope** for this session. The work
delivered here concentrates on the modules where a regression would cause the
most operational damage.

---

## 2. Test Infrastructure

No new infrastructure was needed — the existing Jest + ts-jest setup defined
in `apps/api/package.json` already supports:

- `rootDir: src`, `testRegex: .*\.spec\.ts$`
- Path alias `@/*` → `src/*` via `moduleNameMapper`
- `setupFilesAfterEach: <rootDir>/test-setup.ts`
- ESM transform allowlist for `@thallesp/nestjs-better-auth` etc.

No additional dependencies were installed. All new tests use Jest's built-in
mocking (`jest.fn`, manual mock objects) — `jest-mock-extended` was not
required.

---

## 3. New Test Suites Added

| Module                                                     | File                                                        | Tests   |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| RBAC utility                                               | `auth/role.util.spec.ts`                                    | 17      |
| Order state-machine constants                              | `order-lifecycle/constants/transitions.spec.ts`             | 21      |
| Promotion pricing engine                                   | `promotion/engine/promotion-pricing-engine.spec.ts`         | 16      |
| VNPay payment adapter (HMAC SHA512 sign/verify)            | `payment/services/vnpay.service.spec.ts`                    | 13      |
| Order lifecycle ownership service                          | `order-lifecycle/services/order-lifecycle.service.spec.ts`  | 9       |
| Order transition handler (state machine core)              | `order-lifecycle/commands/transition-order.handler.spec.ts` | 13      |
| Restaurant service (UC-27 approval, ownership, pagination) | `restaurant-catalog/restaurant/restaurant.service.spec.ts`  | 16      |
| Cart service (BR-2, snapshot validation, modifier rules)   | `ordering/cart/cart.service.spec.ts`                        | 19      |
| **Total new tests**                                        |                                                             | **136** |

---

## 4. Business Flows Covered

### Security

- VNPay HMAC SHA512 round-trip (sign → verify)
- IPN rejection on missing or mismatched `vnp_SecureHash`
- `vnp_SecureHashType` correctly stripped before re-signing
- Localhost IP sanitization (`127.0.0.1`, `::1`, `::ffff:` mapped IPv6)
- Constant-time hash comparison (case-insensitive)
- RBAC `hasRole()` — case-insensitive, array, comma-separated, whitespace handling

### Order State Machine (D6-A)

- Structural integrity of `TRANSITIONS` map (all 12 entries T-01..T-12)
- Admin presence on all manual transitions; `pending→paid` system-only
- Note requirement on all cancel/refund transitions (T-03/T-05/T-07/T-12)
- `triggersRefundIfVnpay` on T-05 and T-07
- `triggersReadyForPickup` on T-08 only
- `delivered→refunded` is admin-only (T-12)
- `ALLOWED_TRANSITIONS` and `TRANSITIONS` kept in perfect sync

### Order Transition Handler

- Idempotent same-status returns order without DB writes
- Invalid transition → `UnprocessableEntityException`
- Role not in `allowedRoles` → `ForbiddenException`
- T-01 with VNPay + restaurant role rejected
- Note-required transition without note → `BadRequestException`
- Shipper T-10/T-11 enforces `shipperId` match
- Optimistic-lock failure → `ConflictException`
- Happy path persists status + writes audit log + publishes `OrderStatusChangedEvent`
- T-08 publishes `OrderReadyForPickupEvent` (skips gracefully when snapshot missing)
- T-05 VNPay publishes `OrderCancelledAfterPaymentEvent`
- T-09 self-assign writes `shipperId` into update payload

### Cart (Ordering BC)

- BR-2 single-restaurant cart enforced (`ConflictException`)
- Quantity cap at 99 (`BadRequestException`)
- Snapshot missing + modifiers sent → `BadRequestException` (Case 2 fix)
- Snapshot restaurant mismatch → `ConflictException`
- Snapshot status `out_of_stock` → `ConflictException`
- Auto-default modifier injection BEFORE minSelections check (Case 8 fix)
- `minSelections` violation with no default → `BadRequestException`
- Unavailable explicit option → `BadRequestException` (Case 11 fix)
- `updateItemQuantity(0)` removes item; cart empty → Redis key deleted, returns `null`
- `removeItem` / `updateItemQuantity` / `updateItemModifiers` NotFound paths

### Promotion Pricing

- Date-range eligibility (not started / expired)
- `minOrderAmount` gate (rejects below, allows equal)
- Quota exhaustion check
- Percentage: floor-to-1000 rounding, `maxDiscountAmount` cap, capped at subtotal
- Fixed amount: capped at subtotal, floored to 1000
- Free delivery: full shipping zero-out; rejected when shipping already 0
- Reduced delivery: capped at shipping fee
- `buy_x_get_y` / `free_item` → not eligible (Phase PR-4 placeholder)
- Breakdown shape verified on both eligible and ineligible paths

### Restaurant (UC-27 Admin Approval)

- `findAll` forces `approvedOnly: true` and clamps limit to `MAX_PAGE_SIZE` (100)
- `findAllAdmin` uses `approvedOnly: false`
- `findOne` throws `NotFoundException` when missing
- `update` ownership: non-admin non-owner → `ForbiddenException`; admin can update any
- `update` race condition (`repo.update` → undefined) → `NotFoundException`
- `remove` publishes `RestaurantUpdatedEvent` with `isOpen=false, isApproved=false`
- `setApproved(true)` promotes owner role `user` → `restaurant` via raw DB update
- `setApproved(false)` does NOT touch the owner's role
- `assertOpenAndApproved` throws `ConflictException` for either flag

---

## 5. Defects Found & Fixed

None. All new tests pass against the current implementation. The existing
production code correctly enforces all invariants validated above. The new
tests are pure additions — no source files were modified.

---

## 6. Test Run Results

| Metric      | Before | After    | Delta |
| ----------- | ------ | -------- | ----- |
| Test suites | 15     | 23       | +8    |
| Tests       | 225    | 361      | +136  |
| Runtime     | ~19 s  | ~9.6 s\* | n/a   |
| Failures    | 0      | 0        | 0     |

\* The post-change run benefited from a warm Jest cache; cold runs land in the
same ~19 s range as the baseline.

```
Test Suites: 23 passed, 23 total
Tests:       361 passed, 361 total
Snapshots:   0 total
Ran all test suites.
```

---

## 7. What Was NOT Tested (Honest Gap Report)

The following modules remain without dedicated unit tests and should be tackled
in follow-up sessions:

- `ordering/order/*` — PlaceOrderHandler, order eligibility, order history
- `ordering/order-lifecycle/tasks/*` — timeout cron
- `payment/commands/process-ipn.handler.ts` — IPN business orchestration
- `payment/events/*` — PaymentConfirmedEventHandler, PaymentFailedEventHandler
- `payment/services/payment.service.ts`
- `promotion/services/*`, `promotion/repositories/*`, `promotion/controllers/*`
- `restaurant-catalog/menu/*`, `modifiers/*`, `zones/*`, `search/*`
- `image/*`, `notification/repositories/*`, `notification/gateway/*`
- Most controllers (HTTP layer integration tests recommended over unit)

These are intentionally deferred — adding tests for them correctly requires
the same depth of analysis applied to the modules in this batch (event shape
review, repository surface, mock construction). Rushing this without that
care produces brittle tests that fail on benign refactors.

---

## 8. Final Outcome

Production-critical RBAC, money math, payment HMAC, order state machine,
single-restaurant cart, and restaurant approval flows now have a unit-test
safety net. Regressions in any of these will surface immediately in CI.

**Status: stable, validated, ready for next iteration.**
