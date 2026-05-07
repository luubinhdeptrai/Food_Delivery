# Notification Phase N-3 Implementation Report

> **Phase:** N-3 — Notification Persistence + In-App Inbox REST API
> **Status:** ✅ Complete
> **TypeScript compile check:** 0 errors (`npx tsc --noEmit`)
> **Depends on:** Phase N-1 (schemas, repositories), Phase N-2 (WebSocket gateway, real-time delivery)

---

## 1. Overview

Phase N-3 exposes the notification inbox as a production-grade REST API. Users can now:

- Fetch a paginated, filterable in-app notification inbox
- Read a cached unread badge count
- Mark individual notifications as read (ownership-validated, idempotent)
- Bulk mark all unread notifications as read

All write operations keep the Redis unread count cache consistent and emit `notification.read` WebSocket events so all open browser/app tabs update their unread indicators immediately.

---

## 2. Files Created

### `src/module/notification/dto/notification.dto.ts` (new)

| DTO | Purpose |
|---|---|
| `NotificationInboxQueryDto` | Query params for `GET /notifications/my`: `unreadOnly`, `type`, `limit`, `offset` |
| `NotificationItemDto` | Single notification item in the inbox response |
| `NotificationInboxResponseDto` | Paginated inbox: `items`, `total`, `unreadCount`, `offset`, `limit`, `hasMore` |
| `UnreadCountResponseDto` | `{ count: number }` for the unread badge endpoint |
| `MarkReadResponseDto` | `{ success: boolean }` |
| `MarkAllReadResponseDto` | `{ count: number }` — number of rows actually updated |

### `src/module/notification/controllers/notification.controller.ts` (new)

Full Swagger-documented controller with 4 endpoints (see §4).

---

## 3. Files Modified

### `src/module/notification/repositories/notification.repository.ts`

| Change | Detail |
|---|---|
| Added `InboxFilters` interface | `{ unreadOnly?: boolean; type?: NotificationType }` — exported for service reuse |
| Updated `findInboxByUserId` | Added optional `filters?: InboxFilters` 4th parameter; dynamic `WHERE` clause via Drizzle `and()` with conditional `undefined` conditions |
| Added `countInbox` | New method — same filter logic as `findInboxByUserId`; used for `total` field in paginated response |
| Changed `markAllRead` return type | `Promise<void>` → `Promise<number>` — returns `.returning({ id })` length so the REST response includes the affected count |

### `src/module/notification/services/notification.service.ts`

| Change | Detail |
|---|---|
| Added `RedisService` import + injection | Injected as a normal constructor param (no `@Optional()` needed — `RedisModule` is `@Global()`) |
| Added `UNREAD_CACHE_TTL_SECONDS = 300` | Private static constant (5-minute TTL for the unread count cache) |
| Added `unreadCacheKey(userId)` | Private helper → returns `unread:{userId}` |
| Added `invalidateUnreadCache(userId)` | Private helper → `RedisService.del(cacheKey)`, errors logged-and-swallowed |
| Updated `sendFromEvent` | When an `in_app` channel row is newly persisted, calls `invalidateUnreadCache(recipientId)` (fire-and-forget via `void`) before the WS emit |
| Added `toItemDto(row)` | Private mapper `Notification` → `NotificationItemDto` |
| Added `getInbox(userId, query)` | Runs 3 parallel queries (`findInboxByUserId`, `countInbox`, `getUnreadCount`) via `Promise.all` — returns `NotificationInboxResponseDto` |
| Added `getUnreadCount(userId)` | Redis cache read → DB fallback → cache write; errors logged-and-swallowed |
| Added `markRead(userId, id)` | DB ownership-validated mark-read → cache invalidation → WS `notification.read` emit |
| Added `markAllRead(userId)` | Bulk DB update → (if rows changed) cache invalidation → WS `notification.read { all: true }` emit |

### `src/module/notification/notification.module.ts`

| Change | Detail |
|---|---|
| Added `NotificationController` import | From `./controllers/notification.controller` |
| Added `controllers: [NotificationController]` | Registers the controller with the NestJS router |
| Updated module JSDoc comment | Documents Phase N-3 additions |

---

## 4. REST API Surface

All routes share the global prefix `/api` set in `main.ts`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications/my` | Bearer | Paginated in-app inbox |
| `GET` | `/api/notifications/my/unread-count` | Bearer | Redis-cached unread badge count |
| `PATCH` | `/api/notifications/my/read-all` | Bearer | Bulk mark all unread as read |
| `PATCH` | `/api/notifications/:id/read` | Bearer | Mark single notification as read |

### `GET /api/notifications/my`

**Query params:**

| Param | Type | Default | Validation |
|---|---|---|---|
| `unreadOnly` | boolean | `false` | `@Transform` (handles string `"true"`) |
| `type` | NotificationType | — | `@IsEnum(notificationTypeEnum.enumValues)` |
| `limit` | integer | `20` | `@Min(1) @Max(100)` |
| `offset` | integer | `0` | `@Min(0)` |

**Response `NotificationInboxResponseDto`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "payment_confirmed",
      "title": "Thanh toán thành công",
      "body": "Đơn hàng #1234 đã được thanh toán.",
      "data": { "orderId": "uuid", "screen": "OrderDetail" },
      "orderId": "uuid",
      "isRead": false,
      "readAt": null,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "unreadCount": 7,
  "offset": 0,
  "limit": 20,
  "hasMore": true
}
```

### `GET /api/notifications/my/unread-count`

```json
{ "count": 7 }
```

### `PATCH /api/notifications/my/read-all`

```json
{ "count": 7 }
```

### `PATCH /api/notifications/:id/read`

```json
{ "success": true }
```
Returns `{ success: false }` when the notification ID does not exist for the current user (no 404 — avoids existence leakage per OWASP recommendations).

---

## 5. Architecture Decisions

### A. Redis Unread Count Cache

**Key:** `unread:{userId}` (e.g. `unread:a3f2b1c0-...`)
**TTL:** 300 seconds (5 minutes)
**Invalidation strategy:** DEL (not EXPIRE) triggered by:
1. `sendFromEvent` — new in_app notification persisted
2. `markRead` — single notification marked read
3. `markAllRead` — bulk mark-read

Cache failures are logged as warnings but never propagate — a Redis outage degrades to DB-only reads, never crashes the inbox.

### B. Unread Count in Inbox Response

`NotificationInboxResponseDto.unreadCount` reflects the _global_ unread count, not the count for the current page. This lets the frontend update its badge from a single inbox fetch without making a separate `/unread-count` call.

### C. Ownership Enforcement at DB Level

`markRead` passes both `id` and `recipientId` in the SQL `WHERE` clause (enforced in `NotificationRepository.markRead`). If the notification belongs to another user, 0 rows are updated → service returns `false` → controller returns `{ success: false }`. This is intentional: returning 404 would confirm the notification ID exists.

### D. Route Ordering (`PATCH /my/read-all` vs `PATCH /:id/read`)

The `@Patch('my/read-all')` method is declared **before** `@Patch(':id/read')` in the controller class. NestJS registers routes in declaration order, and Express prioritises static segments over dynamic ones, so `PATCH /notifications/my/read-all` never accidentally resolves to the `:id` handler.

### E. `@Session()` decorator (not `@UseGuards(AuthGuard)`)

Existing controllers in the ordering module use `@Session() session: UserSession` from `@thallesp/nestjs-better-auth` instead of an explicit `@UseGuards()`. This decorator applies the session guard internally and populates `session.user.id`. The notification controller follows the same pattern.

### F. WS `notification.read` event on mark-read

When a notification is marked as read via REST, a `notification.read` WebSocket event is emitted to `room:user:{userId}`. This means:
- Tab A marks a notification as read via REST → Tab B's listener gets `notification.read { id }` → Tab B updates its badge count without polling.

---

## 6. Cache Consistency

| Event | Redis Effect |
|---|---|
| New notification arrives (sendFromEvent) | `DEL unread:{userId}` |
| User marks one notification read | `DEL unread:{userId}` |
| User marks all as read | `DEL unread:{userId}` |
| User fetches unread count (cache miss) | `SET unread:{userId} <count> EX 300` |
| User fetches unread count (cache hit) | No DB query — return cached integer |

**Worst case staleness:** 5 minutes when Redis DEL fails silently (logged as warning). In normal operation, the cache is always invalidated on write.

---

## 7. Phase Completion Summary

| Phase | Status |
|---|---|
| N-1: Foundation (schemas, repositories, event handlers, templates) | ✅ Complete |
| N-2: WebSocket Gateway (auth, rooms, presence, heartbeat, realtime delivery) | ✅ Complete |
| **N-3: Inbox REST API (pagination, filters, unread cache, mark-read, WS sync)** | ✅ **Complete** |
| N-4: Push (FCM) + Email (SMTP) delivery | 🔲 Not started |
| N-5: Cleanup cron (expire old read notifications) | 🔲 Not started |
| N-6: Retry worker, dead-letter queue | 🔲 Not started |
| N-7: Socket.IO Redis adapter (multi-instance horizontal scaling) | 🔲 Not started |
