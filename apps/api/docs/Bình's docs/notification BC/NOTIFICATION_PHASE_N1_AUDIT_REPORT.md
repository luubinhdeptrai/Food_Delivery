# Notification BC — Phase N-1 Audit Report

**Date:** 2025-07  
**Scope:** All 25 Phase N-1 implementation files  
**Auditor:** GitHub Copilot (deep production-grade audit)  
**Final tsc exit code:** 0 ✅

---

## Audit Summary

A full production-grade audit was performed across all Phase N-1 Notification BC files along the following dimensions:

| Dimension | Result |
|---|---|
| DDD & Boundary Correctness | ✅ Pass (after fixes) |
| Event-Driven Correctness (idempotency, duplicates, replay safety) | ✅ Pass (after fixes) |
| Notification Persistence (schemas, indexes, constraints) | ✅ Pass (after fixes) |
| ACL Projection Correctness | ✅ Pass |
| Code Quality (naming, readability) | ✅ Pass (after fixes) |
| Error Handling & Reliability (never-rethrow rule) | ✅ Pass |
| Scalability & Future Readiness | ✅ Pass |
| Performance (N+1, missing indexes) | ✅ Pass (after fixes) |
| TypeScript / Tooling | ✅ Pass (0 errors, after fixes) |

**Total issues found:** 7  
**Total issues fixed:** 7 (all applied directly — no TODOs left)

---

## Issues Found & Fixes Applied

### Issue #1 — CRITICAL: Wrong transition key `preparing→picked_up` (missing `ready_for_pickup` step)

**File:** `src/module/notification/events/order-status-changed.handler.ts`  
**Severity:** Critical — functionally incorrect  
**Root cause:** `STATUS_TRANSITION_NOTIFICATION` mapped `preparing→picked_up` directly, skipping the `ready_for_pickup` state that exists in the canonical `TRANSITIONS` map in `ordering/order-lifecycle/constants/transitions.ts`. The order lifecycle transitions are `preparing → ready_for_pickup → picked_up` (T-08 and T-09). A notification for the wrong key would never fire because the `OrderStatusChangedEvent` always emits the actual status pair.

**Fix applied:**
- Removed `'preparing→picked_up'` entry.
- Added `'preparing→ready_for_pickup'` → `order_ready_for_pickup` (customer, `in_app` + `push`).
- Added `'ready_for_pickup→picked_up'` → `order_picked_up` (customer, `in_app` + `push`).

---

### Issue #2 — HIGH: Missing `paid→confirmed` and `paid→cancelled` transitions

**File:** `src/module/notification/events/order-status-changed.handler.ts`  
**Severity:** High — VNPay orders silently receive no notification for restaurant confirmation  
**Root cause:** The initial map only handled the COD path (`pending→confirmed`). For VNPay orders the state machine flows `pending→paid→confirmed`. Without a `paid→confirmed` entry the customer never receives an "order confirmed" notification for any VNPay order. Likewise `paid→cancelled` (T-05) was absent.

**Fix applied:**
- Added `'paid→confirmed'` → `order_confirmed` (customer, `in_app` + `push`).
- Added `'paid→cancelled'` → `order_cancelled` (customer, `in_app` + `push`) with comment explaining idempotency overlap with `OrderCancelledAfterPaymentEvent`.

---

### Issue #3 — HIGH: `OrderCancelledAfterPaymentHandler` used `cancel:{orderId}` sourceId causing duplicate `order_cancelled` notifications

**File:** `src/module/notification/events/order-cancelled-after-payment.handler.ts`  
**Severity:** High — customers received two `order_cancelled` notifications for T-05 and T-07  
**Root cause:** The handler used `sourceId: \`cancel:${event.orderId}\`` to "avoid collision", but this actually created a *different* idempotency key from the one `OrderStatusChangedNotificationHandler` produced (which uses `sourceId: orderId`). For transitions T-05 (`paid→cancelled`) and T-07 (`confirmed→cancelled` via VNPay), both handlers fired and both persisted separate `order_cancelled` rows — the customer got two notifications.

**Fix applied:**
- Changed `sourceId` from `` `cancel:${event.orderId}` `` back to `event.orderId` — the SAME key used by `OrderStatusChangedNotificationHandler`.
- The DB `UNIQUE` constraint on `idempotency_key` (format `notif:order_cancelled:{orderId}:{customerId}:{channel}`) guarantees exactly one row via `ON CONFLICT DO NOTHING`.
- Updated inline comments to document the shared-key idempotency strategy.

---

### Issue #4 — HIGH: `countUnread` loaded all rows into memory (full table scan equivalent)

**File:** `src/module/notification/repositories/notification.repository.ts`  
**Severity:** High — O(N) memory allocation on every badge count query; catastrophic at scale  
**Root cause:** `countUnread` selected `{ count: notifications.id }` and returned `result.length`. This loads every unread `in_app` notification row for a user into Node.js heap to count them. For a power user with 10,000 unread notifications, this allocates 10,000 objects per request.

**Fix applied:**
```ts
// Before
const result = await this.db
  .select({ count: notifications.id })
  ...
return result.length;

// After
const result = await this.db
  .select({ count: sql<number>`cast(count(*) as int)` })
  ...
return result[0]?.count ?? 0;
```
Added `sql` to the import list.

---

### Issue #5 — MEDIUM: `order_cancelled` template produced double punctuation when `reason` was present

**File:** `src/module/notification/services/notification-template.service.ts`  
**Severity:** Medium — visible user-facing bug  
**Root cause:** The template body was:
```ts
`...đã bị huỷ${d.reason ? `: ${d.reason}` : '.'}.`
```
When `reason` was provided the output ended with `: <reason>.` — correct. When absent the output was `...đã bị huỷ..` — double period.

**Fix applied:**
```ts
`...đã bị huỷ${d.reason ? `: ${d.reason}.` : '.'}`
```
Same fix applied to `payment_failed` template which had the same pattern.

---

### Issue #6 — MEDIUM: Debug `logger.debug` log masquerading as a phase TODO

**File:** `src/module/notification/services/notification.service.ts`  
**Severity:** Medium — production log noise; log indicates unfinished feature on every notification  
**Root cause:** After persisting each notification the code emitted:
```ts
this.logger.debug(`[Notification] Phase N-2+ TODO: dispatch ${channel} delivery for notification ${row.id}`);
```
This fires on every successful `sendFromEvent` call in production. Debug logs at this level are enabled in non-prod environments and would clutter log streams. The content (a TODO reminder) is developer-only information and belongs in a code comment, not a runtime log statement.

**Fix applied:** Removed the `logger.debug` call and replaced with a plain code comment `// Phase N-2+: dispatch push / WebSocket / email delivery here.`

---

### Issue #7 — MEDIUM: `notif_recipient_unread_idx` did not include the `channel` column

**Files:** `src/module/notification/domain/notification.schema.ts`, `src/drizzle/out/0012_notification_bc.sql`  
**Severity:** Medium — partial index not used for the most common query pattern  
**Root cause:** The partial index was defined on `(recipient_id) WHERE is_read = false`. The `countUnread` and `findInboxByUserId` queries both filter `AND channel = 'in_app'`. PostgreSQL could use the partial index to filter by `recipient_id` then rescan for the `channel = 'in_app'` predicate, but it could not perform an index-only scan. For a user who receives many push/email notifications (channels other than `in_app`) the index would still return irrelevant rows before the channel filter.

**Fix applied:** Changed index to `(recipient_id, channel) WHERE is_read = false` — allows an index-only scan for the exact query `WHERE recipient_id = $1 AND channel = 'in_app' AND is_read = false`. Updated both the Drizzle schema definition and the migration SQL.

---

## Refactoring Improvements (No Correctness Impact)

### R-1: T-number comments aligned with `transitions.ts`

The `STATUS_TRANSITION_NOTIFICATION` entries had incorrect T-number comment labels that did not match the canonical `TRANSITIONS` map in `ordering/order-lifecycle/constants/transitions.ts`. All T-number labels were corrected:

| Transition | Was | Correct |
|---|---|---|
| `confirmed→preparing` | T-02 | T-06 |
| `preparing→ready_for_pickup` | T-03 | T-08 |
| `ready_for_pickup→picked_up` | T-04 | T-09 |
| `picked_up→delivering` | T-05 | T-10 |
| `delivering→delivered` | T-06 | T-11 |
| `pending→cancelled` | T-08 | T-03 |
| `confirmed→cancelled` | T-09 | T-07 |
| `delivered→refunded` | T-10 | T-12 |

### R-2: `order_ready_for_pickup` removed `[RESERVED]` marker

The notification type comment `// [RESERVED] Delivery BC (ShipperAssignedEvent) — not yet triggered` was inaccurate after Issue #1 was fixed — `preparing→ready_for_pickup` is now actively handled. Updated to accurately describe the trigger: `// Customer: food ready — shipper is coming (preparing → ready_for_pickup)`.

### R-3: Template service JSDoc comment corrected

The design comment stated "Variable interpolation uses a simple {{ key }} syntax" which was factually wrong — the service uses JavaScript template literals, not a `{{ }}` syntax. Corrected to accurately describe the actual implementation.

---

## Architecture Notes (No Issues — Confirmed Correct)

### Idempotency key design
Format `notif:{type}:{sourceId}:{recipientId}:{channel}` enforced at DB level via `UNIQUE` constraint + `ON CONFLICT DO NOTHING`. All event handlers pass `sourceId = orderId` consistently. After Issue #3 fix, the `OrderCancelledAfterPaymentEvent` handler and `OrderStatusChangedEvent` handler share identical idempotency keys for `order_cancelled` — only one row is ever persisted regardless of event ordering or replay.

### Never-rethrow rule
All 5 event handlers wrap `processNotification`/`processNotifications` in `try/catch`. Exceptions are logged at `ERROR` level and swallowed. `NotificationService.sendFromEvent` itself also catches all errors. No exceptions can propagate to the NestJS CQRS `EventBus` or disrupt the upstream transaction.

### ACL snapshot design
`NotificationRestaurantSnapshotProjector` handles `RestaurantUpdatedEvent`. No FK constraints. Missing snapshots are logged at `WARN` and skipped — the handler does not throw. This matches the downstream-observer principle used across all other ACL projectors in this codebase.

### Module registration
`NotificationModule` imports `CqrsModule` and `DatabaseModule`. All `@EventsHandler` classes are listed in `providers`. NestJS CQRS registers handlers with the `EventBus` only when the module imports `CqrsModule` — confirmed correct.

### Migration
`0012_notification_bc.sql` is a hand-written migration following the established pattern (migrations 0006–0011 are also hand-written; the drizzle-kit `_journal.json` only tracks entries through index 5). No journal update is required.

### Redis
`NotificationModule` does NOT import `RedisModule` or inject `REDIS_CLIENT`. This is correct — the `REDIS_CLIENT` token is not exported from `RedisModule` (only `RedisService` is exported). Phase N-2 WebSocket and Phase N-4 push delivery will add `RedisModule` to imports when needed.

---

## Final Validation

```
tsc --noEmit exit code: 0
```

All 7 issues fixed. No outstanding TODOs. Production-ready for Phase N-1 deployment.
