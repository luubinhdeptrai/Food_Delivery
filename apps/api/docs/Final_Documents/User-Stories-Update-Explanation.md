# User Stories Update Explanation

This document explains every change made to `User-Stories-and-Acceptance-Criteria.md` during the synchronisation pass against the actual codebase state. Only **User Story** text and **Acceptance Criteria** columns were modified; all other columns (Quality Attributes, Justification, SP, Priority, Key Dependencies/Notes, story IDs, table structure) are untouched.

---

## US-3 — Item Search / Keyword Search

### What was outdated
The original AC assumed that a delivery location **must** be provided before searching, and that results were filtered against restaurant delivery zones. It also implied distance was always shown.

### Evidence from codebase
- `apps/api/src/module/restaurant-catalog/search/search.service.ts` — `lat`, `lon`, and `radiusKm` parameters are all **optional**; when absent the query runs without geo filtering.
- `apps/api/src/module/restaurant-catalog/search/search.repository.ts` — Haversine distance is calculated only when coordinates are present; results include a `distance` field only if geo was supplied.
- Delivery-zone validation (BR-3) is enforced in `place-order.handler.ts`, **not** in the search layer.

### What changed
- Removed the requirement for a delivery location before searching.
- Added explicit "given no geo" branch that returns results without proximity filtering.
- Clarified that results from search include relevance score and accent-insensitive keyword matching.
- Added a note that BR-3 delivery-zone validation happens at checkout, not at search time.

---

## US-7 — VNPay Payment Flow

### What was outdated
The original AC said the order is "only created/routed after receiving a successful payment confirmation from VNPay." In reality, the order is created **immediately** with `pending` status.

### Evidence from codebase
- `apps/api/src/module/ordering/order/commands/place-order.handler.ts` — `PlaceOrderHandler` persists the order with status `pending` and returns a `paymentUrl` in the same response.
- `apps/api/src/module/payment/vnpay/` — IPN callback handler transitions the order to `paid` when VNPay confirms payment.

### What changed
- AC now states: order is created immediately with `pending` + `paymentUrl`; it advances to `paid` only after a valid VNPay IPN callback.
- Failure path: if no valid IPN arrives, the order is auto-cancelled (not "not routed").

---

## US-8 — Order Status Lifecycle (Platform/Internal)

### What was outdated
The original AC used incorrect/simplified status names (`Pending`, `Accepted`, `Preparing`, `Ready for Pickup/Picked Up`, `Delivered`) and omitted the `paid`, `delivering`, `refunded` statuses plus the auto-cancel timeout.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — Full state machine: T-01 through T-12.
- `apps/api/src/module/ordering/order/order.schema.ts` — Enum values: `pending`, `paid`, `confirmed`, `preparing`, `ready_for_pickup`, `picked_up`, `delivering`, `delivered`, `refunded`, `cancelled`.
- `apps/api/src/module/ordering/order-lifecycle/tasks/order-timeout.task.ts` — Auto-cancels `pending`/`paid` orders when `RESTAURANT_ACCEPT_TIMEOUT_SECONDS` elapses.

### What changed
- Replaced 5 simplified bullets with 10 precise ones covering every status transition (T-01 through T-12) including: VNPay IPN path (T-02, T-04), shipper self-assign (T-09), en-route step (T-10), delivery confirmation (T-11), admin refund (T-12), and system auto-cancel timeout.

---

## US-9 — Push Notification Delivery

### What was outdated
AC stated push notifications are delivered via "APNs/FCM". The backend only uses Firebase Cloud Messaging.

### Evidence from codebase
- `apps/api/src/module/notification/domain/notification.schema.ts` — channels: `in_app`, `push`, `email`, `sms`. No APNs-specific code anywhere in the notification module.
- `apps/api/src/module/notification/push/push.service.ts` (or equivalent) — uses Firebase Admin SDK / FCM exclusively.

### What changed
- Replaced "APNs/FCM" with "FCM (Firebase Cloud Messaging)" to reflect the actual provider.

---

## US-10 — Restaurant Partner Registration / Approval

### What was outdated
The original AC used status strings `Pending Approval` and `Active`, implying a status-enum model. The implementation uses a boolean field.

### Evidence from codebase
- `apps/api/src/module/restaurant-catalog/restaurant/restaurant.schema.ts` — `isApproved: boolean` field (default `false`), no `status` enum on the restaurant record.
- Admin approval handler sets `isApproved: true`; no `Active` string exists.

### What changed
- Replaced `Pending Approval` with `isApproved: false` (pending approval).
- Replaced `Active` with `` `isApproved` set to `true` ``.
- Rejection keeps `isApproved: false` (unchanged functionally, wording updated).

---

## US-13 — Restaurant Accepts / Rejects Order

### What was outdated
AC said accepted orders become `Accepted` status and timed-out orders become `Unaccepted/Expired`. Neither status exists in the codebase; and the decline path was missing.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — T-01: `pending → confirmed`; T-04: `paid → confirmed`.
- `apps/api/src/module/ordering/order-lifecycle/tasks/order-timeout.task.ts` — Timed-out orders transition to `cancelled` with a system-generated reason note, not to `Unaccepted/Expired`.
- T-03 (pending→cancelled), T-05 (paid→cancelled), T-07 (confirmed→cancelled) — all require a `reason` field from the restaurant.

### What changed
- Accept path: `confirmed` (not `Accepted`); VNPay-paid orders use T-04.
- Timeout path: order becomes `cancelled` (auto, system-generated reason), not `Unaccepted/Expired`.
- Added decline/cancel path: T-03/T-05/T-07 with required reason.

---

## US-16 — Shipper Accepts Delivery / Confirms Pickup

### What was outdated
The original described a **dispatch-request model** ("I receive a dispatch request, when I accept…"). The implementation uses a **self-assign model**: shippers claim orders that are in `ready_for_pickup` state. The en-route step (`picked_up → delivering`) was also missing.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — T-09: `ready_for_pickup → picked_up` (shipper self-assign, records `shipperId`); T-10: `picked_up → delivering`.
- No dispatch-request queue or assignment table exists; order goes into a pool when `ready_for_pickup`.

### What changed
- User story text updated from "accept a delivery job and confirm pickup" to "claim an available order for pickup and mark it en route".
- AC updated: removed "receive a dispatch request" bullet; added T-09 self-assign with atomic conflict handling; added T-10 en-route transition.

---

## US-17 — Shipper Confirms Delivery

### What was outdated
AC said delivery can be confirmed when in `Picked Up` status. The actual transition (T-11) requires `delivering` status (not `picked_up`).

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — T-11: `delivering → delivered`. There is no direct `picked_up → delivered` transition.

### What changed
- Pre-condition changed from "Picked Up" to `delivering`.
- Guard condition changed from "not in `Picked Up`" to "not in `delivering` state".

---

## US-23 — Restaurant Updates Order Status During Preparation

### What was outdated
AC used incorrect status names (`Preparing`, `Ready for Pickup`) with uppercase and spaces, and didn't mention the transition IDs or the shipper pool effect.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/controllers/order-lifecycle.controller.ts` — `PATCH /orders/:id/start-preparing` → T-06 (`confirmed → preparing`); `PATCH /orders/:id/ready` → T-08 (`preparing → ready_for_pickup`).
- When an order reaches `ready_for_pickup`, it becomes visible in the shipper-facing available-orders pool.

### What changed
- Status names corrected to lowercase snake_case: `preparing`, `ready_for_pickup`.
- Pre-condition updated from "accepted" to "confirmed" (correct trigger state).
- Added T-06/T-08 transition references.
- Added note that `ready_for_pickup` makes the order visible to shippers.

---

## US-24 — Restaurant Cancels Order

### What was outdated
AC said a restaurant can cancel "as long as the order is not yet `Picked Up`", implying cancellation is possible all the way through `confirmed → preparing → ready_for_pickup`. The implementation blocks cancellation from `preparing` onward for the restaurant role.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — Restaurant-initiated cancel transitions exist only as: T-03 (`pending → cancelled`), T-05 (`paid → cancelled`), T-07 (`confirmed → cancelled`). There are no `preparing → cancelled` or later transitions for the restaurant role.

### What changed
- Cancellation window narrowed to explicitly: `pending`, `paid`, or `confirmed` states only.
- Added note that cancellation from `preparing` or later is **blocked** for restaurants.

---

## US-29 — Admin Cancels Order

### What was outdated
AC said the system blocks cancellation only when the order is "already `Delivered`". The implementation also blocks cancellation for `preparing`, `ready_for_pickup`, `picked_up`, and `delivering` states. Additionally, `delivered` orders can be subject to a **refund** action (T-12), not just blocked.

### Evidence from codebase
- `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts` — Admin cancel transitions stop at `confirmed` state. No transitions from `preparing`, `ready_for_pickup`, `picked_up`, or `delivering` to `cancelled` (for any role, including admin).
- T-12: `delivered → refunded` (admin only, requires reason) — `POST /orders/:id/refund`.

### What changed
- Blocking states expanded from `delivered` to the full set: `preparing`, `ready_for_pickup`, `picked_up`, `delivering` (all blocked for cancellation).
- Added that `delivered` orders cannot be cancelled but admins can initiate a **refund** via T-12 (`POST /orders/:id/refund`).

---

## Summary Table

| Story | Changed Fields | Root Cause |
|-------|---------------|------------|
| US-3  | AC | Location optional; geo filtering only when coordinates supplied; search-time ≠ checkout-time delivery check |
| US-7  | AC | Order created immediately with `pending`; VNPay IPN moves to `paid` |
| US-8  | AC | Full state machine (T-01→T-12) not reflected; missing `paid`, `delivering`, `refunded`, timeout |
| US-9  | AC | Only FCM used; no APNs integration |
| US-10 | AC | Boolean `isApproved` field, not status enum `Pending Approval` / `Active` |
| US-13 | AC | Status is `confirmed` not `Accepted`; timeout → `cancelled` not `Unaccepted/Expired`; added decline path |
| US-16 | User Story + AC | Self-assign model (T-09/T-10) not dispatch-request model; en-route step missing |
| US-17 | AC | T-11 requires `delivering` state, not `picked_up` |
| US-23 | AC | Status names wrong (`Preparing` → `preparing`, `Ready for Pickup` → `ready_for_pickup`); shipper pool effect |
| US-24 | AC | Cancellation window narrower: only `pending`/`paid`/`confirmed`; blocked from `preparing` onward |
| US-29 | AC | Admin also blocked in `preparing`/`ready_for_pickup`/`picked_up`/`delivering`; refund path via T-12 |
