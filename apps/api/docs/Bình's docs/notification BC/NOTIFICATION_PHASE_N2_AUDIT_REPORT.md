# Notification BC — Phase N-2 Audit Report

**Phase**: N-2 — Real-time WebSocket Gateway  
**Audit date**: 2025-01  
**Auditor**: GitHub Copilot (Claude Sonnet 4.6)  
**Verdict**: ✅ PASS — 6 issues found and fixed. `tsc --noEmit` = 0 errors after all fixes.

---

## 1. Scope

This audit covers every file created or modified in Phase N-2:

| File | Change |
|---|---|
| `src/module/notification/gateway/notification.gateway.ts` | NEW — Socket.IO WebSocket gateway |
| `src/module/notification/gateway/notification-payload.dto.ts` | NEW — typed WebSocket payload |
| `src/module/notification/services/notification.service.ts` | UPDATED — added WebSocket dispatch |
| `src/module/notification/notification.module.ts` | UPDATED — registered gateway provider |
| `src/lib/redis/redis.service.ts` | UPDATED — added `incr()`, `decr()`, `expire()` |

Additionally reviewed (read-only, no changes needed):

- `notification.module.ts` — provider/import registration
- `redis.module.ts` — `REDIS_CLIENT` export boundary verified
- `notification.schema.ts` — `NotificationPayload` field alignment verified
- `notification.repository.ts` — idempotency key contract verified
- All 5 event handler files (`order-placed`, `order-status-changed`, `order-cancelled-after-payment`, `payment-confirmed`, `payment-failed`)

---

## 2. Issues Found and Fixed

### Issue #1 — CRITICAL: `import type` Breaks NestJS DI for `NotificationGateway`

**File**: `src/module/notification/services/notification.service.ts`  
**Severity**: CRITICAL — WebSocket delivery **never fires** in production  
**Root cause**:

```typescript
// BEFORE (broken):
import type { NotificationGateway } from '../gateway/notification.gateway';
```

With `emitDecoratorMetadata: true` in `tsconfig.json`, TypeScript emits `design:paramtypes` metadata for constructor parameters. However, `import type` completely erases the class reference from compiled JS output. The emitted metadata records `Object` instead of `NotificationGateway` for that constructor slot.

NestJS DI reads `Reflect.getMetadata('design:paramtypes', NotificationService)` to discover which providers to inject. Seeing `Object` as the token for slot #3, it looks for a provider registered as `Object`. None exists. Because the slot is decorated with `@Optional()`, NestJS injects `null` instead of throwing.

**Result**: `this.notificationGateway` is always `null` in production — `sendToUser()` is never called — WebSocket delivery is silently dead.

**Fix applied**:

```typescript
// AFTER (correct):
import { NotificationGateway } from '../gateway/notification.gateway';
import type { NotificationPayload } from '../gateway/notification-payload.dto';
```

`NotificationPayload` is an **interface**, not a class, so `import type` is correct there — interfaces are not DI tokens and have no runtime presence requirement.

**Verification**: `NotificationGateway` is in the same `NotificationModule`. No circular dependency exists (`notification.gateway.ts` does not import from `notification.service.ts`).

---

### Issue #2 — HIGH: Uncaught Redis Error in `handleConnection` (Presence Setup)

**File**: `src/module/notification/gateway/notification.gateway.ts`  
**Method**: `handleConnection`  
**Severity**: HIGH — Redis unavailability propagates as unhandled exception, leaving the socket in inconsistent state or causing the connection to be silently dropped  

**Before**:

```typescript
await this.redisService.setWithExpiry(`presence:${userId}`, client.id, 30);
// No try/catch — if Redis is down, this throws
```

**Problem**: Presence tracking is a non-critical, best-effort operation. If Redis is temporarily unavailable (restart, network blip), a valid, authenticated user should still be able to connect and receive notifications. The connection must not be rejected due to a Redis failure.

**Fix applied**: Wrapped in try/catch with a warn-level log. Connection proceeds without presence tracking on Redis failure:

```typescript
try {
  await this.redisService.setWithExpiry(`presence:${userId}`, client.id, 30);
} catch (redisErr) {
  this.logger.warn(
    `[Gateway] Failed to set presence for userId=${userId}: ${(redisErr as Error).message} — continuing without presence`,
  );
}
```

---

### Issue #3 — HIGH: Uncaught Redis Error in `handleDisconnect` (Presence Cleanup)

**File**: `src/module/notification/gateway/notification.gateway.ts`  
**Method**: `handleDisconnect`  
**Severity**: HIGH — Redis unavailability propagates as an unhandled rejection from Socket.IO's disconnect handler

**Before**:

```typescript
await this.redisService.del(`presence:${userId}`);
// No try/catch
```

**Problem**: If `del()` throws (Redis down), the exception propagates out of `handleDisconnect`. The subsequent log line is never reached. In some Node.js / Socket.IO versions this manifests as an unhandled promise rejection, potentially crashing the process.

**Fix applied**: Wrapped in try/catch:

```typescript
try {
  await this.redisService.del(`presence:${userId}`);
} catch (redisErr) {
  this.logger.warn(
    `[Gateway] Failed to delete presence for userId=${userId}: ${(redisErr as Error).message}`,
  );
}
this.logger.log(`[Gateway] Socket disconnected: userId=${userId} socketId=${client.id}`);
```

---

### Issue #4 — MEDIUM: `setTimeout` Overflow for Long-Lived Sessions

**File**: `src/module/notification/gateway/notification.gateway.ts`  
**Method**: `handleConnection`  
**Severity**: MEDIUM — sessions with TTL > ~24.8 days cause the timer to fire **immediately** on connect, disconnecting the user at once

**Root cause**: Node.js internally stores `setTimeout` delay as a 32-bit signed integer. Any value above `2^31 - 1 = 2,147,483,647` ms (~24.8 days) overflows and the timer fires at the next event loop tick (immediate disconnect with `auth:expired`).

Better Auth's default session duration is 7 days (~604 million ms, safely under the limit). However, configured "remember me" sessions, admin accounts, or service tokens could exceed 24.8 days.

**Before**:

```typescript
const timer = setTimeout(() => { ... }, ttlMs);
```

**Fix applied**: Clamp to Node.js maximum:

```typescript
// Cap at Node.js setTimeout limit (~24.8 days). Values above 2^31-1 ms
// overflow to a 32-bit signed integer internally and fire immediately,
// causing instant disconnect for users with long-lived sessions.
const safeTtlMs = Math.min(ttlMs, 2_147_483_647);
const timer = setTimeout(() => { ... }, safeTtlMs);
```

---

### Issue #5 — MEDIUM: Stale Phase Comments in `NotificationService`

**File**: `src/module/notification/services/notification.service.ts`  
**Severity**: MEDIUM (documentation correctness)

Two stale comment blocks reflected Phase N-1-only status when Phase N-2 is implemented:

1. Class JSDoc footer said `// Phase: N-1 — Foundation`
2. Phase N-2+ comment said "this service will be extended to dispatch... in-app (WebSocket) delivery after persistence" — but it IS now extended

**Fix applied**: Updated the class-level block comment to document the Phase N-2 behaviour (WebSocket fire-and-forget dispatch is live) and note Phase N-4+ as the next delivery phase (push/email). Footer updated to `// Phase: N-2 — Real-time WebSocket Gateway`.

---

### Issue #6 — MINOR: `JSON.stringify` Wraps Structured Log Object

**File**: `src/module/notification/gateway/notification.gateway.ts`  
**Method**: `logConnectionMetrics`  
**Severity**: MINOR — log aggregators receive a raw JSON string instead of a structured object field; inconsistent with `NOTIFICATION_CONTEXT_PROPOSAL.md` §13 logging convention

**Before**:

```typescript
this.logger.log(
  JSON.stringify({ event: 'websocket.connections', namespace: '/notifications', count }),
);
```

**Fix applied**: Pass the object directly:

```typescript
this.logger.log({ event: 'websocket.connections', namespace: '/notifications', count });
```

NestJS Logger accepts plain objects. Log aggregators (e.g., Loki, Datadog) that receive the NestJS JSON formatter output will correctly parse the nested object, enabling proper field-based queries.

---

## 3. Items Verified Correct (No Changes)

The following were inspected and found production-ready:

### 3.1 `notification-payload.dto.ts`
- `NotificationPayload` interface fields exactly match the `notifications` table schema
- `createdAt` and `readAt` typed as `string` (ISO 8601) — correct for WebSocket serialization (no `Date` marshalling issues)
- `data` typed as `Record<string, string> | undefined` — consistent with `jsonb` column and template data contract

### 3.2 `notification.module.ts`
- `NotificationGateway` correctly listed in `providers` array (not `exports` — gateway is internal to the BC)
- `CqrsModule` import required for event handlers ✓
- `DatabaseModule` import required for repositories ✓
- No circular module dependency ✓

### 3.3 `notification.gateway.ts` — Auth flow
- Token extraction from `handshake.auth.token` (mobile SDK) with fallback to `Authorization` header (web SDK) ✓
- `auth.api.getSession()` wrapped in try/catch — auth service failure rejects connection with `warn` log ✓
- `userId` derived exclusively from the server-validated session — clients cannot forge their own userId ✓
- `client.data.userId` stored server-side for use in `handleDisconnect` ✓

### 3.4 `notification.gateway.ts` — Room isolation
- `server.to('user:{userId}').emit()` — room-scoped, user-isolated ✓
- `broadcastToAll` uses `server.emit()` (namespace-level) not `server.to('/notifications').emit()` (which would treat the namespace path as a room name) ✓
- `sendToUser` / `broadcastToAll` guard `if (!this.server)` prevents null-pointer before NestJS gateway init ✓

### 3.5 `notification.gateway.ts` — Timer lifecycle
- `sessionTimers` keyed by `socket.id` — no userId collisions across sessions ✓
- Timer cancelled in `handleDisconnect` before socket resources are freed ✓
- Timer callback clears its own entry from `sessionTimers` BEFORE calling `client.disconnect()` — prevents double-clear race ✓
- `handlePing` guard `if (!userId) return` ✓

### 3.6 `notification.service.ts` — WebSocket dispatch
- WebSocket dispatch only occurs when `row != null` — idempotent events that hit `ON CONFLICT DO NOTHING` do NOT emit duplicate WebSocket events ✓
- WebSocket dispatch wrapped in its own inner try/catch — failure never aborts DB persistence or the outer handler loop ✓
- `@Optional()` on `notificationGateway` parameter is correct for unit testing isolation; in production the gateway is always present in the module ✓

### 3.7 `redis.service.ts`
- `incr()`, `decr()`, `expire()` methods added correctly — they correctly delegate to the `REDIS_CLIENT` ioredis instance ✓
- `expire()` uses ioredis `expire(key, seconds)` — correct TTL unit ✓

### 3.8 Cross-BC event handler chain
Traced the full delivery pipeline for `order_confirmed` (the most common notification type):

1. `PlaceOrderHandler` → publishes `OrderPlacedEvent`  
2. `OrderPlacedNotificationHandler.handle()` → `NotificationService.sendFromEvent({ channels: ['in_app', 'push'] })`  
3. `sendFromEvent` → loads prefs → renders template → `insertIfNotExists()`  
4. Row inserted (`status: 'pending'`) → `row != null`  
5. `channel === 'in_app'` → builds `NotificationPayload` → `notificationGateway.sendToUser(recipientId, 'notification:new', payload)` (after Fix #1, this now resolves)  
6. `server.to('user:{customerId}').emit('notification:new', payload)` → delivered to all connected tabs

Duplicate event scenario (idempotent):
- Second handler call with same `sourceId` → `ON CONFLICT DO NOTHING` → `row = null` → WebSocket emit skipped → no duplicate delivery ✓

---

## 4. Scenario Simulations

### Scenario A: User opens app with valid session (happy path)
1. Client connects: `io('/notifications', { auth: { token: 'Bearer ...' } })`
2. `handleConnection` → validates session → gets `userId` → `client.join('user:{userId}')` → `setWithExpiry` → timer set
3. Client is now in room `user:{userId}` with presence in Redis
4. New order event fires → `sendFromEvent` → `sendToUser(userId, 'notification:new', payload)`
5. `server.to('user:{userId}').emit(...)` → client receives notification in real-time  
✅ Works correctly after Fix #1

### Scenario B: Redis is down during connection
1. `handleConnection` → session validated → `client.join(room)` succeeds
2. `setWithExpiry(...)` throws (Redis unavailable)
3. **Before Fix #2**: Exception propagates from `handleConnection`, socket in inconsistent state
4. **After Fix #2**: Exception caught → warn logged → connection proceeds → user receives real-time notifications  
✅ Fixed

### Scenario C: Redis down during disconnect
1. Client disconnects → `handleDisconnect` → `clearTimeout` succeeds
2. `del('presence:{userId}')` throws (Redis unavailable)
3. **Before Fix #3**: Unhandled rejection from disconnect handler
4. **After Fix #3**: Exception caught → warn logged → disconnect completes cleanly  
✅ Fixed

### Scenario D: Long-lived admin session (> 24.8 days)
1. Admin user with 30-day session TTL connects
2. `ttlMs = 30 * 24 * 3600 * 1000 = 2,592,000,000` ms > `2,147,483,647`
3. **Before Fix #4**: `setTimeout(..., 2592000000)` overflows → fires immediately → `auth:expired` emitted → admin disconnected instantly
4. **After Fix #4**: `safeTtlMs = min(2592000000, 2147483647)` → timer set for ~24.8 days  
✅ Fixed

### Scenario E: Two tabs open, tab 1 disconnects
1. Both tabs connected, both in room `user:{userId}`
2. Tab 1 disconnects → `handleDisconnect` → deletes `presence:{userId}` (known limitation)
3. Tab 2 still connected → next `notification:ping` (~25 s) → `expire('presence:{userId}', 30)` refreshes key
4. Presence gap ≤ 30 s. Tab 2 continues receiving notifications unaffected  
✅ Works correctly (documented known limitation, `incr()/decr()` fix in N-3+)

---

## 5. Final State

| | Before audit | After audit |
|---|---|---|
| Critical bugs | 1 | 0 |
| High bugs | 2 | 0 |
| Medium bugs | 2 | 0 |
| Minor issues | 1 | 0 |
| `tsc --noEmit` | 0 errors | 0 errors |
| WebSocket delivery | ❌ Always null (broken) | ✅ Live and correct |

Phase N-2 is production-ready. Proceed to Phase N-3 (Inbox REST API).
