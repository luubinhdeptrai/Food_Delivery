# Notification Delivery Orchestration Fix Report

**Phase:** N-5 — Delivery Orchestration Fix  
**Date:** 2026-05-08  
**Status:** ✅ Complete — 126 unit tests passing

---

## 1. Problem Statement

### Symptom

When a customer completed a VNPay payment, they received **two simultaneous notifications**:

1. A real-time WebSocket `notification.created` event (in-app)  
2. An FCM push notification popup from the browser/device

For users actively using the app (WebSocket connected), this created a redundant, disruptive duplicate notification experience.

### Expected Behaviour

| User State | Delivery |
|---|---|
| Online (active WebSocket connection) | In-app WS only — suppress push |
| Offline (no WebSocket connection) | Push only (inbox persisted for later retrieval) |
| Multiple tabs open | ANY active WS → suppress push |

---

## 2. Root Cause Analysis

### Primary Root Cause: No Presence Check Before Push Dispatch

`ChannelDispatcherService.dispatch()` routed every notification unconditionally to its channel adapter. For a `push`-channel notification row, `PushChannelService.deliver()` was called regardless of whether the user had an active WebSocket connection.

```
OrderPlacedEvent
  → NotificationService.sendFromEvent(channels: ['in_app', 'push'])
      → persist notification row (channel='in_app') → dispatch → InAppChannelService → WS emit ✓
      → persist notification row (channel='push')   → dispatch → PushChannelService  → FCM push ✗ (should be suppressed)
```

Neither `NotificationService`, `ChannelDispatcherService`, nor `PushChannelService` consulted Redis presence state before sending push.

### Secondary Root Cause: Multi-Tab Presence Race (Redis SET/DEL Bug)

The gateway tracked presence with a single-value pattern:

```
ON CONNECT:    SET presence:{userId} {socketId} EX 30
ON DISCONNECT: DEL presence:{userId}
```

This broke for multi-tab users:

1. Tab 1 connects → `SET presence:X = sock1`  
2. Tab 2 connects → `SET presence:X = sock2` (overwrites)  
3. Tab 1 disconnects → `DEL presence:X` ← **user appears offline even though Tab 2 is connected**  
4. Any push check between step 3 and Tab 2's next heartbeat (up to 30 s) would incorrectly deliver push

The gateway comment acknowledged this: *"Proper fix: INCR/DECR reference count pattern (requires RedisService.incr()/decr() — added in Phase N-2, use in N-3+)"*

---

## 3. Changes Made

### 3.1 NEW: `UserPresenceService`

**File:** `apps/api/src/module/notification/services/user-presence.service.ts`

Replaces raw Redis SET/DEL presence tracking with atomic INCR/DECR reference counting.

#### Redis Key Design

| Aspect | Old (buggy) | New (fixed) |
|---|---|---|
| Key | `presence:{userId}` | `ws:connections:{userId}` |
| Value | socket.id string | integer connection count |
| TTL | 30 s | 90 s |
| Multi-tab | Broken (race on disconnect) | Correct (INCR/DECR) |
| On connect | `SET key sockId EX 30` | `INCR key; EXPIRE key 90` |
| On disconnect | `DEL key` | `DECR key; if count≤0: DEL key` |
| On heartbeat | `EXPIRE key 30` | `EXPIRE key 90` |

A distinct key prefix (`ws:connections:` vs `presence:`) avoids conflicts during any rolling deployment.

#### Public API

```typescript
markOnline(userId: string): Promise<void>      // INCR + EXPIRE; absorbs Redis errors
markOffline(userId: string): Promise<void>     // DECR; DEL if count≤0; absorbs errors  
refreshTtl(userId: string): Promise<void>      // EXPIRE only; called on heartbeat
isOnline(userId: string): Promise<boolean>     // GET key; returns false on error (safe default)
getConnectionCount(userId: string): Promise<number>  // GET key; clamped to ≥0
```

#### Safety Default

`isOnline()` returns `false` on Redis failure. This ensures push is delivered as a fallback rather than silently suppressed when presence state is unavailable.

---

### 3.2 MODIFIED: `NotificationGateway`

**File:** `apps/api/src/module/notification/gateway/notification.gateway.ts`

Replaced direct `RedisService` presence calls with `UserPresenceService` delegation.

| Method | Before | After |
|---|---|---|
| `handleConnection` | `redisService.setWithExpiry('presence:{id}', sockId, 30)` | `presenceService.markOnline(userId)` |
| `handleDisconnect` | `redisService.del('presence:{id}')` | `presenceService.markOffline(userId)` |
| `handlePing` | `redisService.expire('presence:{id}', 30)` | `presenceService.refreshTtl(userId)` |
| DI | `RedisService` | `UserPresenceService` |

Error handling for all three paths is now internal to `UserPresenceService` — the gateway no longer needs try/catch around presence operations.

---

### 3.3 MODIFIED: `ChannelDispatcherService`

**File:** `apps/api/src/module/notification/services/channel-dispatcher.service.ts`

Added push suppression logic before invoking the push channel adapter.

#### Decision Flow

```
dispatch(notification, context)
  if notification.channel === 'push':
    isOnline = await presenceService.isOnline(recipientId)  ← new
    if isOnline:
      → write delivery log (status=success, errorCode=PUSH_SUPPRESSED_USER_ONLINE)
      → updateStatus(notification.id, 'sent', { sentAt: now })
      → return  ← FCM never called
  → invoke adapter.deliver() as before
```

#### Delivery Log for Suppressed Push

Suppressed push deliveries are recorded with:

```json
{
  "status": "success",
  "errorCode": "PUSH_SUPPRESSED_USER_ONLINE",
  "errorMessage": "Push suppressed — recipient has active WebSocket connection; delivered via in_app channel."
}
```

This makes suppression decisions observable via the `notification_delivery_logs` table without requiring a schema change.

#### Channels Unaffected

- `in_app` — no presence check (WS delivery always proceeds)
- `email` — no presence check (email is not a real-time channel)

#### Resilience

- If `presenceService.isOnline()` throws (should not happen — it absorbs errors), the `catch` block defaults `isOnline = false` and push delivers normally.
- Suppression log write failure and status update failure are both non-fatal (logged as warnings, execution returns cleanly).

---

### 3.4 MODIFIED: `NotificationModule`

**File:** `apps/api/src/module/notification/notification.module.ts`

Added `UserPresenceService` to the providers array (before `ChannelDispatcherService` to make the dependency ordering clear).

---

## 4. Files Changed

| File | Change Type | Summary |
|---|---|---|
| `src/module/notification/services/user-presence.service.ts` | ✅ Created | INCR/DECR presence service |
| `src/module/notification/gateway/notification.gateway.ts` | ✅ Modified | Use UserPresenceService |
| `src/module/notification/services/channel-dispatcher.service.ts` | ✅ Modified | Push suppression + UserPresenceService injection |
| `src/module/notification/notification.module.ts` | ✅ Modified | Register UserPresenceService |
| `src/module/notification/services/user-presence.service.spec.ts` | ✅ Created | 22 unit tests |
| `src/module/notification/services/channel-dispatcher.service.spec.ts` | ✅ Modified | 10 suppression tests added |

---

## 5. Test Coverage

### Test Results

```
Test Suites: 6 passed (+ 1 pre-existing ESM failure in app.controller.spec.ts — unrelated)
Tests:       126 passed, 0 failed
```

### New Tests Added

**`user-presence.service.spec.ts`** — 22 tests:

- `markOnline`: INCR called; `expire` called after INCR; absorbs Redis errors
- `markOffline`: DECR called; DEL when count ≤ 0; no DEL when count > 0; absorbs errors
- `refreshTtl`: `expire` called with correct TTL; absorbs errors
- `isOnline`: null → false; `'0'` → false; `'1'` → true; `'3'` → true (multi-tab); Redis error → false
- `getConnectionCount`: null → 0; `'-1'` → 0 (clamped); `'0'` → 0; `'2'` → 2; Redis error → 0

**`channel-dispatcher.service.spec.ts`** — 10 new tests in `describe('push suppression')`:

- Presence check called before push deliver
- No push when online
- Status marked 'sent' when suppressed
- Delivery log written with `PUSH_SUPPRESSED_USER_ONLINE` when suppressed
- Push delivered normally when offline (default)
- No presence check for `in_app` channel
- No presence check for `email` channel
- Push delivered as fallback when `isOnline()` throws unexpectedly
- No throw when suppression log write fails
- No throw when suppression status update fails

---

## 6. Delivery Rules Implemented

| Rule | Behaviour | Implementation |
|---|---|---|
| R1: Online → WS only | Push suppressed when `ws:connections:{userId}` > 0 | `ChannelDispatcherService` checks `isOnline()` before FCM |
| R2: Offline → push | Push delivered normally when key missing or count = 0 | Default path unchanged |
| R3: Any WS → suppress | Single integer count covers all tabs/devices | INCR tracks all connections; DECR removes only when last closes |
| R4: Persistence always first | DB rows created before any channel dispatch | `NotificationService.sendFromEvent()` persist loop unchanged |

---

## 7. Architecture Notes

### Why Suppression in `ChannelDispatcherService` (not `PushChannelService`)

The dispatcher is the correct layer for routing decisions:
- It already owns the "which channel gets invoked" responsibility
- Keeps `PushChannelService` as a pure transport adapter (single responsibility)
- Centralises all delivery orchestration in one place for future rules (e.g. time-of-day push throttling)

### Why `UserPresenceService` (not inline `RedisService` calls)

- Encapsulates key format (`ws:connections:{userId}`) in one place
- Testable in isolation: both gateway and dispatcher unit tests mock `UserPresenceService` at the service boundary
- TTL constant (`TTL_SECONDS = 90`) is co-located with the logic that sets it

### TTL Choice: 90 s

- Heartbeat interval: ~25 s  
- Previous TTL: 30 s (barely adequate for single-device)  
- New TTL: 90 s = 3× heartbeat interval  
- Rationale: survives a missed heartbeat + network hiccup without falsely expiring presence, while still self-cleaning within 90 s of a server crash or network partition

---

## 8. Pre-Existing Unrelated Failure

`src/app.controller.spec.ts` fails with:
```
SyntaxError: Cannot use import statement outside a module
```

This is caused by `better-auth` (ESM-only package) being imported transitively. It is present in the test suite before this PR and is excluded from all notification module specs via `jest.mock('../gateway/notification.gateway')`. Not introduced by this fix.
