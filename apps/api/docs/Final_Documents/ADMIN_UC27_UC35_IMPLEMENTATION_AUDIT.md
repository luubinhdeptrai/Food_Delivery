# Administration & Governance — Implementation Audit

**Use Cases Covered:** UC-27 through UC-35  
**Audit Date:** 2026-05  
**Auditor:** GitHub Copilot (automated, based on codebase evidence)  
**Scope:** Backend (`apps/api`), Admin frontend (`apps/admin`), Database schema

---

## 1. Executive Summary

The SoLi Food platform includes nine Administration & Governance use cases (UC-27–UC-35). This audit cross-references the SRS specification for each use case against the current codebase to determine what is implemented, what is partially implemented, and what is entirely missing.

**Key findings:**

| #     | Use Case                                   | Status                       | Estimated Completion |
| ----- | ------------------------------------------ | ---------------------------- | -------------------- |
| UC-27 | Approve / Reject Restaurant Applications   | ⚠️ Partial                   | ~55%                 |
| UC-28 | Approve / Reject Shipper Applications      | ❌ Not Implemented           | 0%                   |
| UC-29 | Suspend / Reactivate Partner Accounts      | ⚠️ Partial                   | ~50%                 |
| UC-30 | Monitor Orders & Platform Health           | ⚠️ Partial                   | ~65%                 |
| UC-31 | Search & Manage User Accounts              | ⚠️ Partial                   | ~50%                 |
| UC-32 | Administrative Order Cancellation & Refund | ⚠️ Partial                   | ~45%                 |
| UC-33 | View & Export Operational Reports          | ❌ Not Implemented           | 0%                   |
| UC-34 | View Dashboard & Platform Overview         | ❌ Not Implemented           | 0%                   |
| UC-35 | Manage Admin Roles & Permissions           | ⚠️ Partial                   | ~35%                 |

Three use cases (UC-28, UC-33, UC-34) have zero implementation. The remaining six are partially implemented, blocked mainly by: missing audit-trail infrastructure, absent schema columns (`bannedAt`, `bannedBy`, `soliRoles`, `version`), an absent `shipper_applications` bounded context, missing actor-name resolution in order responses, no reporting/aggregation service, and frontend action gaps (UC-32).

---

## 2. Architecture Overview

### Backend

- **Framework:** NestJS modular monolith with CQRS (`@nestjs/cqrs`). Commands and events are dispatched via `CommandBus` / `EventBus`.
- **Auth:** [Better Auth](https://better-auth.com) with the `admin` plugin. The admin plugin is registered in `apps/api/src/lib/auth.ts` and provides managed endpoints under `/api/auth/admin/*` for user operations (list, ban, unban, set-role, remove-user).
- **RBAC:** Single primary `role` column on the `user` table. `APP_ROLES = ['admin', 'restaurant', 'shipper', 'user']`. Role checks use `@Roles(['admin'])` decorator or inline `hasRole(session.user.role, 'admin')`.
- **Database:** Drizzle ORM + PostgreSQL, schema-first. No audit tables exist anywhere in the schema barrel (`apps/api/src/drizzle/schema.ts`).
- **Admin module:** There is **no dedicated `apps/api/src/module/admin/` directory**. Admin functionality is distributed across existing bounded contexts (restaurant-catalog, ordering, auth plugin).

### Admin Frontend (`apps/admin`)

- Vite + React + React Query + Axios.
- Routes: `/login`, `/restaurants`, `/orders`, `/promotions`, `/promotions/new`, `/promotions/:id/edit`, `/users`, `/settings`.
- **No `/dashboard` route. No `/reports` route. No `/shippers` route.**
- The root `/` redirects immediately to `/restaurants`.

---

## 3. Detailed Analysis Per Use Case

---

### UC-27 — Approve or Reject Restaurant Applications

#### Intended Behavior (SRS)

A new restaurant owner submits a registration. It enters an "approval queue" in state `isApproved = false`. An admin reviews the application details (owner email, submitted docs) and either approves or rejects the application. Approving promotes the owner's role from `user` to `restaurant`. The decision is audited.

Key business rules from SRS:

- **BR-27.3:** Admin can filter the queue by approval status (pending / approved).
- **BR-27.4 / BR-27.5:** The approval queue displays owner email and submission timestamp.
- **BR-27.7:** Approving an already-approved restaurant must return a no-op response, not throw an error.
- **BR-27.11:** Every approval / rejection decision must be written to an audit trail (actor ID + timestamp + decision).

#### Backend Evidence

| File                                                                         | Relevant Code                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.controller.ts` | `GET /restaurants/admin/all` → `@Roles(['admin'])` → `findAllAdmin()`                                                                |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.controller.ts` | `PATCH /restaurants/:id/approve` → `@Roles(['admin'])` → `service.setApproved(id, true)`                                             |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.controller.ts` | `PATCH /restaurants/:id/unapprove` → `@Roles(['admin'])` → `service.setApproved(id, false)`                                          |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.controller.ts` | `DELETE /restaurants/:id` → `@Roles(['admin'])` → `service.remove(id)`                                                               |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.service.ts`    | `setApproved(id, isApproved)`: updates `isApproved`, promotes owner role `'user' → 'restaurant'`, publishes `RestaurantUpdatedEvent` |
| `apps/api/src/module/restaurant-catalog/restaurant/restaurant.service.ts`    | `findAllAdmin()`: calls the repository with `approvedOnly: false` — returns all restaurants                                          |

#### Frontend Evidence

| File                                                                                   | Relevant UI                                                                                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/features/restaurants/api/restaurants.api.ts`                           | `list()` → `GET /api/restaurants/admin/all`; `approve(id)`, `unapprove(id)`, `delete(id)`. `Restaurant` type exposes `ownerId` but **not** `ownerEmail` or `ownerName`. |
| `apps/admin/src/app/pages/restaurants/RestaurantsPage.tsx`                             | Restaurant table with `isApproved` badge (Active / Pending Approval); stat cards (Pending/Active/Suspended/Total) — display-only, not clickable filters |
| `apps/admin/src/app/pages/restaurants/RestaurantsPage.tsx` (inline `RestaurantDetailSheet`) | Detail panel with Approve and Suspend (unapprove) buttons; Delete action is in the per-row dropdown in the table, **not** in the detail sheet |

#### Database Evidence

The `restaurants` table has an `isApproved` boolean column. There is **no** `restaurant_approval_audit` table in `apps/api/src/drizzle/schema.ts` or any module-level schema file.

#### What Exists ✅

- Full `approve` / `unapprove` / `delete` REST API (admin-only).
- Admin listing endpoint returns all restaurants including unapproved.
- `setApproved()` correctly promotes the owner's role from `user` → `restaurant` on first approval.
- `RestaurantUpdatedEvent` is published on state change.
- Admin frontend: table view with badges, approve/unapprove/delete actions, detail sheet.

#### What Is Missing ❌

1. **No audit trail** (BR-27.11): No `restaurant_approval_audit` table, no insertion of actor ID + timestamp + decision on approval/rejection. The only record is the `isApproved` flag itself.
2. **No idempotency / no-op check** (BR-27.7 / BR-27.8): `setApproved()` always executes the DB update unconditionally (`repo.update(id, { isApproved })`); it does not check whether the restaurant is already in the desired state. SRS requires a no-op HTTP 200 (`MSG-ADM-10`) when the state already matches.
3. **No server-side filter by approval status** (BR-27.3): Both the backend `findAllAdmin()` and the frontend always operate on all restaurants. The SRS specifies that `GET /restaurants/admin/all?approvedOnly=false` for the Pending tab and `?approvedOnly=true` for the Approved tab should be separate queries. Currently the admin listing endpoint accepts no `isApproved` query parameter and always returns all restaurants.
4. **No filter tabs in the admin frontend** (BR-27.3): The restaurant list shows all restaurants; the stat cards (Pending Approval, Active, Suspended) are display-only and are not clickable filters. All filtering is client-side and limited to name/address/cuisine free-text search.
5. **Owner email absent from queue** (BR-27.4 / BR-27.5): The `Restaurant` type exposes `ownerId` (UUID) but not `ownerEmail` or `ownerName`. The detail sheet shows "Owner ID" as a truncated UUID. Submission timestamp (`createdAt`) is available and displayed; owner identity is not.

#### Completion Assessment: ~55%

Core approve/unapprove/delete workflow is functional. Missing audit trail, idempotency check, server-side approval-status filtering, and owner email resolution.

---

### UC-28 — Approve or Reject Shipper Applications

#### Intended Behavior (SRS)

A user registers as a shipper applicant (uploading ID, license, vehicle details). Admins see a pending-applications queue, review the documents, and approve or reject. Approval converts the user's role to `shipper`. A `ShipperApprovedEvent` is published to trigger onboarding.

#### Backend Evidence

Searched across the entire `apps/api/src/` directory for:

- `shipper_application` — **zero matches**
- `ShipperApplication` — **zero matches**
- `ShipperApprovedEvent` — **zero matches**
- Any entity/service/controller related to shipper applications — **none found**

The only shipper-related code found is:

- The `'shipper'` string in `APP_ROLES` (auth config).
- Role checks `hasRole(userRole, 'shipper')` in order-lifecycle transitions.
- The `shipperId` column on the `orders` table.

#### Frontend Evidence

- `apps/admin/src/app/router.tsx` has **no `/shippers` route**.
- `apps/admin/src/app/pages/` contains: `auth`, `orders`, `promotions`, `restaurants`, `settings`, `users`. **No shippers subdirectory.**
- `AdminSidebar.tsx` nav items: Restaurants, Orders, Promotions, Users. **No Shippers link.**

#### Database Evidence

No `shipper_applications` table is exported from `apps/api/src/drizzle/schema.ts`. No file matching `shipper*.schema.ts` exists in the workspace.

#### What Exists ✅

- Nothing.

#### What Is Missing ❌

The entire bounded context for shipper applications is absent:

1. **No `shipper_applications` database table** — no schema, no migration.
2. **No ShipperApplication domain entity, repository, service, or controller.**
3. **No approval/rejection endpoints** — `/admin/shipper-applications` does not exist.
4. **No `ShipperApprovedEvent`** — onboarding side effects cannot be triggered.
5. **No `shipper_approval_audit` table** (BR-28.15): SRS BR-28.15 names this specific table for recording the admin actor, decision, timestamp, and rejection reason.
6. **No admin frontend** — no queue view, no review UI.
7. **No shipper application flow for end users** (prerequisite UC-16 is also not implemented in either mobile or web apps).

#### Completion Assessment: 0%

This use case has not been started.

---

### UC-29 — Suspend or Reactivate Partner Accounts

#### Intended Behavior (SRS)

Admins can temporarily suspend any user account (customer, restaurant owner, shipper, or another administrator) to prevent login and order activity. The use case applies uniformly to every role (`user`, `restaurant`, `shipper`, `admin`). Reactivation restores access. The affected user receives a system announcement. Session revocation occurs immediately. Suspension history is audited.

Key business rules:

- **BR-29.3:** Suspension reason is **required** (1–500 characters). An empty reason must be rejected.
- **BR-29.4:** Cannot suspend the last active administrator.
- **BR-29.5:** The `user` table must record `bannedAt` (suspension timestamp) and `bannedBy` (admin actor ID) alongside the existing `banReason` / `banExpires`.
- **BR-29.9:** Reactivation eligibility check — attempting to reactivate an account that is not currently suspended must return HTTP 409.
- **BR-29 (post-condition):** A `system_announcement` notification is sent to the user on suspend/reactivate.
- **BR-29.14:** Audit trail table: `user_status_audit` (actor ID, target user ID, action, reason, timestamp, duration).
- **BR-29.15:** `PartnerSuspensionTask` — scheduled job that auto-reactivates accounts when `banExpires <= now()`.

#### Backend Evidence

| File                                      | Relevant Code                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/lib/auth.ts`                | `admin({ defaultRole: 'user', adminRoles: ['admin'] })` plugin registered — provides `/api/auth/admin/ban-user` and `/api/auth/admin/unban-user` |
| `apps/api/src/module/auth/auth.schema.ts` | `user` table: `banned` (boolean), `banReason` (text), `banExpires` (timestamp) columns                                                           |

The suspension mechanism is delegated entirely to Better Auth's built-in `admin` plugin. No custom NestJS service wraps ban/unban. Session invalidation behavior is managed by Better Auth's session revocation logic (triggered when `banned = true` on next session check).

#### Frontend Evidence

| File                                                           | Relevant UI                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/admin/src/features/users/components/UserDetailSheet.tsx` | Ban section: duration selector (1d / 7d / 30d / Permanent), reason text input, Ban / Unban button |
| `apps/admin/src/features/users/api/users.api.ts`               | `banUser(userId, banReason?, banExpiresIn?)` → `authClient.admin.banUser()`                       |
| `apps/admin/src/features/users/api/users.api.ts`               | `unbanUser(userId)` → `authClient.admin.unbanUser()`                                              |

#### Database Evidence

`banned`, `banReason`, `banExpires` columns present on `user` table. **Missing**: `bannedAt` and `bannedBy` columns (required by BR-29.5). No `user_status_audit` table (required by BR-29.14).

#### What Exists ✅

- Database schema supports suspension state (`banned` + `banReason` + `banExpires`).
- Better Auth admin plugin handles the HTTP endpoints and session revocation.
- Admin frontend: ban/unban UI with duration and reason fields.
- The suspended user's session is rejected on next request (Better Auth built-in behavior).

#### What Is Missing ❌

1. **No `system_announcement` notification** sent to the affected user on suspend or reactivate (BR-29 post-condition). The notification module has a push/system channel but no hook from the ban event.
2. **No last-administrator safeguard** (BR-29.4): Nothing prevents an admin from banning the only remaining active administrator. Neither Better Auth nor any custom code enforces this guard.
3. **Suspension reason not enforced as required** (BR-29.3): The `UserDetailSheet.tsx` labels the ban-reason field as "Reason (optional)". Better Auth's `/api/auth/admin/ban-user` accepts requests without a reason. SRS BR-29.3 requires a non-empty reason (1–500 chars); currently no validation enforces this.
4. **Missing `bannedAt` and `bannedBy` schema columns** (BR-29.5): The `user` table has `banned`, `banReason`, and `banExpires` but lacks `bannedAt` (suspension timestamp) and `bannedBy` (admin actor UUID). These are required to identify who suspended an account and when.
5. **No `user_status_audit` table** (BR-29.14): SRS BR-29.14 specifically names this table for recording per-event ban history (actor, target, action, reason, timestamp, duration). The only record is the current state of the `banned*` columns on the user row; historical events are lost on reactivation.
6. **No reactivation eligibility check** (BR-29.9): Better Auth's `unban-user` endpoint will process the request regardless of the account's current state. SRS BR-29.9 requires that attempting to reactivate a non-suspended account return HTTP 409.
7. **No `PartnerSuspensionTask` auto-expiry job** (BR-29.15): No scheduled job exists to automatically reactivate accounts when `banExpires <= now()`. If an admin sets a 7-day ban, the user remains banned indefinitely unless manually reactivated.
8. **No dedicated custom endpoint**: Suspension is exposed only via Better Auth's `/api/auth/admin/ban-user` — no `/admin/users/:id/suspend` NestJS route with business-rule validation (last-admin guard, reason enforcement, bannedBy recording).

#### Completion Assessment: ~50%

Core ban/unban mechanics work. Missing reason enforcement, missing schema columns (`bannedAt`, `bannedBy`), no audit trail, no auto-expiry task, no last-admin guard, no reactivation eligibility check.

---

### UC-30 — Monitor Orders & Platform Health

#### Intended Behavior (SRS)

Admins can browse all orders across all users, restaurants, and shippers. They can filter by status, payment method, restaurant, customer, shipper, and date range. They can view full order details including timeline, items, customer info, and payment details.

#### Backend Evidence

| File                                                                                 | Relevant Code                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/module/ordering/order-history/controllers/order-history.controller.ts` | `OrderHistoryAdminController`: `GET /admin/orders` → `getAllOrders(filters)` — no ownership filter; `@Session()` role check `hasRole(..., 'admin')`                                                  |
| `apps/api/src/module/ordering/order-history/controllers/order-history.controller.ts` | `GET /admin/orders/:id` → `getAnyOrderDetail(id)` — no ownership check                                                                                                                               |
| `apps/api/src/module/ordering/order-history/dto/order-history.dto.ts`                | `AdminOrderFiltersDto extends OrderHistoryFiltersDto`: adds `restaurantId`, `customerId`, `shipperId`, `paymentMethod`, `sortBy` (`created_at\|updated_at\|total_amount`), `sortOrder` (`asc\|desc`) |

The parent `OrderHistoryFiltersDto` provides pagination (`offset`, `limit`) and date range (`from`, `to`).

#### Frontend Evidence

| File                                                             | Relevant UI                                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/admin/src/features/orders/api/orders.api.ts`               | `list(filters)` → `GET /api/admin/orders`; `detail(id)` → `GET /api/admin/orders/${id}`. `OrderListItem` interface: has `restaurantName` but **not** `customerName` or `shipperName`. |
| `apps/admin/src/app/pages/orders/OrdersPage.tsx`                 | Status filter (tabs per status), payment method filter, paginated table                  |
| `apps/admin/src/features/orders/components/OrderDetailSheet.tsx` | Tabs: Items, Timeline, Customer, Payment; full order detail read-only view               |
| `apps/admin/src/features/orders/components/OrderDetailSheet.tsx` | Customer tab shows delivery address and `order.shipperId.slice(0, 8)…` (truncated UUID); no customer name |

#### What Exists ✅

- Full cross-tenant read endpoints for listing and detail.
- Rich DTO supporting all major filter dimensions.
- Admin frontend: order table with status + payment filter, full detail sheet with 4 tabs.
- Timeline in the detail view shows the full status history with actor role and notes.

#### What Is Missing ❌

1. **List response missing `customerName` and `shipperName`** (BR-30.5): SRS BR-30.5 explicitly requires `customerName` and `shipperName?` in the order list. The current `OrderListItemDto` does not include either field. The backend `order-history.repository.ts` queries the `orders` table only — there is no JOIN with the `user` table to resolve actor names. The frontend `orders.api.ts` `OrderListItem` interface confirms the absence.
2. **Detail response missing resolved actor names** (BR-30.7): The `OrderDetailDto` contains `shipperId` (UUID) but no `shipperName`. There is no `customerId` or `customerName` field. SRS BR-30.7 requires resolved customer and shipper names in the order detail. The detail sheet's Customer tab currently shows delivery address and a truncated shipper UUID (`shipperId.slice(0, 8)…`), not a readable name.
3. **Frontend does not expose all backend filter capabilities**: The `OrdersPage` sends `status` and `paymentMethod` filters but does not expose the backend's `restaurantId`, `customerId`, `shipperId`, or date-range (`from` / `to`) filters.
4. **No date range picker in the UI**: The backend DTO supports `from` / `to` date range (inherited from parent DTO), but the frontend never sends these parameters.
5. **Actor names not resolved in timeline**: The timeline shows `actorRole` and a truncated `actorId` UUID prefix; it does not resolve the actor's display name.

#### Completion Assessment: ~65%

Backend is well-implemented for read access. Missing actor name resolution (customerName/shipperName) in both list and detail responses, and the frontend advanced filter controls are absent.

---

### UC-31 — Search & Manage User Accounts

#### Intended Behavior (SRS)

Admins can search users by name, email, or phone. They can view a user's profile, linked restaurant(s), shipper application status, and order count. Admins can edit basic profile fields (name, contact email) and add internal notes. Role assignment and suspension are also available (covered in UC-35 and UC-29 respectively).

Key business rules:

- **BR-31.9:** User detail view must show owned restaurants, shipper application status, and total order count.
- **BR-31.12:** Admin can update `name`, `contactEmail`, and internal `notes` on a user profile.
- Changes publish a `UserProfileUpdatedEvent` for audit.

#### Backend Evidence

| File                       | Relevant Code                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/lib/auth.ts` | `admin()` plugin provides `/api/auth/admin/list-users` with `searchValue`, `filterField` (`email\|name\|role\|banned`), `sortBy`, pagination |

No custom `GET /admin/users` or `PATCH /admin/users/:id/profile` NestJS endpoint exists. User management is entirely delegated to Better Auth's admin plugin routes.

#### Frontend Evidence

| File                                                           | Relevant UI                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/features/users/api/users.api.ts`               | `list(params)` → `authClient.admin.listUsers()`; `setRole`, `banUser`, `unbanUser`, `removeUser`                          |
| `apps/admin/src/app/pages/users/UsersPage.tsx`                 | Role filter pills (All/Customer/Restaurant/Shipper/Admin), status filter (active/suspended), free-text search, pagination |
| `apps/admin/src/features/users/components/UserDetailSheet.tsx` | Name, email, role badge, status, join date, email verified; Change Role buttons; Ban/Unban section; Delete                |

#### What Exists ✅

- User listing with role-based filter, status filter, and text search (via Better Auth admin plugin).
- Detail sheet shows core user identity fields.
- Ban/Unban, role change, and delete actions are available.

#### What Is Missing ❌

1. **No owned-restaurant / shipper-application / order-count in the detail view** (BR-31.9): The `UserDetailSheet` shows only identity fields from the `user` table; there are no cross-BC joins to restaurants or orders.
2. **No profile edit** (BR-31.12): There is no name/contactEmail/notes edit form. The detail sheet is read-only for identity fields.
3. **No `UserProfileUpdatedEvent`** — the event type does not exist in the codebase.
4. **No `user_profile_audit` table** (BR-31.18): SRS BR-31.18 specifically names this audit table for recording profile edit history (adminId, userId, fieldChanges JSON, editedAt). No such table exists in the schema.
5. **No `users.version` column** (BR-31.14): Atomic profile persistence requires an optimistic-lock `version` column on the `users` table for concurrent-edit detection. This column is absent from the current Drizzle schema.
6. **No custom NestJS endpoint**: All operations go through Better Auth admin routes, meaning custom business-rule validation (like cross-BC lookups) requires a separate endpoint.

#### Completion Assessment: ~50%

User listing + basic actions work. Missing profile editing, cross-BC detail enrichment, and audit events.

---

### UC-32 — Administrative Order Cancellation & Refund

#### Intended Behavior (SRS)

An admin can cancel any order that is in a cancellable state (`pending`, `paid`, `confirmed`) and can refund a `delivered` order in dispute. A mandatory reason must be provided. If the order was paid via VNPay, a refund pipeline is triggered. The action is written to the order timeline.

#### Backend Evidence

| File                                                                                     | Relevant Code                                                                                                                                 |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts`                  | T-03: `pending→cancelled`, T-05: `paid→cancelled`, T-07: `confirmed→cancelled` — all include `'admin'` in `allowedRoles`, `requireNote: true` |
| `apps/api/src/module/ordering/order-lifecycle/constants/transitions.ts`                  | T-12: `delivered→refunded` — `allowedRoles: ['admin']`, `requireNote: true`                                                                   |
| `apps/api/src/module/ordering/order-lifecycle/controllers/order-lifecycle.controller.ts` | `PATCH /orders/:id/cancel` — uses `resolveRole()`, dispatches `TransitionOrderCommand` with target `'cancelled'`                              |
| `apps/api/src/module/ordering/order-lifecycle/controllers/order-lifecycle.controller.ts` | `POST /orders/:id/refund` — inline `hasRole(session.user.role, 'admin')` guard, dispatches `TransitionOrderCommand` with target `'refunded'`  |

The `TransitionOrderCommand` handler writes a row to `order_status_logs` and publishes `OrderCancelledAfterPaymentEvent` when `triggersRefundIfVnpay: true`.

**Important:** The `/orders/:id/cancel` endpoint is shared between customer, restaurant, and admin. It is not under an `/admin/` URL prefix. However, `resolveRole()` correctly routes to `'admin'` role when the session user has the admin role, so the TRANSITIONS guard still applies.

#### Frontend Evidence

| File                                                             | Relevant UI                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/admin/src/features/orders/api/orders.api.ts`               | Only `list(filters)` and `detail(id)` — **no cancel or refund API calls**   |
| `apps/admin/src/features/orders/components/OrderDetailSheet.tsx` | Tabs: Items, Timeline, Customer, Payment — **read-only, no action buttons** |
| `apps/admin/src/app/pages/orders/OrdersPage.tsx`                 | Table with status filter — **no per-row cancel or refund action**           |

#### What Exists ✅

- Backend: cancel and refund transitions exist with admin in `allowedRoles`.
- `requireNote: true` enforced via TRANSITIONS map.
- VNPay refund pipeline triggered via `OrderCancelledAfterPaymentEvent`.
- Timeline entry written for every transition via `order_status_logs`.

#### What Is Missing ❌

1. **Frontend: NO cancel or refund UI** — the admin panel can only view orders. There are no cancel or refund buttons, no reason-input modal, and no mutation calls for these actions. This is the primary gap: the backend fully supports UC-32 but the admin frontend does not expose it.
2. **No `/admin/orders/:id/cancel` or `/admin/orders/:id/refund` endpoints**: The shared `/orders/:id/cancel` endpoint works for admins at runtime, but the API surface is not semantically organized as admin-specific routes. This is a minor design issue but does not break functionality.

#### Completion Assessment: ~45%

Backend is complete. Frontend cannot trigger any cancellation or refund — the use case is not actionable from the admin panel.

**Recommended fix:** Add cancel and refund API calls to `apps/admin/src/features/orders/api/orders.api.ts` and add Cancel / Refund action buttons (with a reason modal) to `OrderDetailSheet.tsx`.

---

### UC-33 — View & Export Operational Reports

#### Intended Behavior (SRS)

Admins can view pre-built reports: revenue by period, order volumes, top restaurants, top shippers, and cancellation rates. Reports are filterable by date range, region, and category. Admins can export data as CSV or XLSX.

#### Backend Evidence

Searched `apps/api/src/` for: `report`, `Report`, `reports`, `aggregat`, `csv`, `xlsx`, `ReportController`, `ReportService`. **Zero matches** (other than unrelated comments).

No `/admin/reports` controller, no report service, no aggregation queries, no CSV/XLSX generation library in `apps/api/package.json`.

#### Frontend Evidence

- `apps/admin/src/app/router.tsx`: No `/reports` route.
- `apps/admin/src/app/pages/`: No `reports` subdirectory.
- `AdminSidebar.tsx` nav items: Restaurants, Orders, Promotions, Users. No Reports.
- Searched `apps/admin/src/` for `report`, `export`, `csv`. **Zero matches.**

#### What Exists ✅

- Nothing.

#### What Is Missing ❌

The entire reporting bounded context is absent:

1. **No backend report endpoints** — no controller, no service, no aggregation queries.
2. **No reporting data models** — no materialized views, no pre-aggregated tables.
3. **No export functionality** — no CSV/XLSX generation.
4. **No frontend reports page** — no route, no UI.

#### Completion Assessment: 0%

This use case has not been started.

---

### UC-34 — View Dashboard & Platform Overview

#### Intended Behavior (SRS)

The admin landing page shows a real-time dashboard with KPIs: active orders, revenue today, new registrations (restaurants, users, shippers), total disputes, and an activity stream of recent admin actions.

#### Backend Evidence

Searched `apps/api/src/` for: `dashboard`, `Dashboard`, `kpi`, `KPI`, `DashboardController`, `DashboardService`. **Zero matches.**

No `/admin/dashboard` endpoint exists.

#### Frontend Evidence

- `apps/admin/src/app/router.tsx`: Root `/` redirects to `/restaurants`. **No `/dashboard` route.**
- `apps/admin/src/app/pages/`: No `dashboard` subdirectory. No `DashboardPage.tsx`.
- `AdminSidebar.tsx`: No Dashboard nav item.

#### What Exists ✅

- Nothing.

#### What Is Missing ❌

1. **No backend dashboard endpoint** — no KPI aggregation queries.
2. **No activity stream** — no `admin_activity_log` table or event feed.
3. **No frontend dashboard page** — no route, no UI components.
4. **The admin panel has no home page**: The root `/` redirects to Restaurants, making the restaurant list the de-facto landing page.

#### Completion Assessment: 0%

This use case has not been started.

---

### UC-35 — Manage Admin Roles & Permissions

#### Intended Behavior (SRS)

Admins can assign or remove roles from any user. Valid roles are `admin`, `restaurant`, `user`. Assigning `shipper` directly is **prohibited** — it must go through the shipper application flow (UC-28). The actor must provide a reason for the role change. A `RoleAssignmentChangedEvent` is published and a `system_announcement` notification is sent. The last active administrator cannot be downgraded.

Key business rules:

- **BR-35.2:** Shipper role cannot be directly assigned; must go through UC-28.
- **BR-35.3:** Reason text is required for role changes.
- **BR-35.4:** Cannot remove the last active administrator.
- **BR-35.8:** `RoleAssignmentChangedEvent` published + `system_announcement` notification dispatched.
- **BR-35.10:** Audit trail with actor, target user, old role, new role, reason, timestamp.

#### Backend Evidence

| File                       | Relevant Code                                                              |
| -------------------------- | -------------------------------------------------------------------------- |
| `apps/api/src/lib/auth.ts` | Better Auth `admin()` plugin provides `POST /api/auth/admin/set-role`      |
| `apps/api/src/lib/auth.ts` | `adminRoles: ['admin']` — only admin users can call admin plugin endpoints |

The `setRole` endpoint is a Better Auth built-in. It directly updates the `role` column on the `user` table without custom business-rule validation.

No custom NestJS `RoleAssignmentService`, `RoleChangedEvent`, or `RoleAssignmentChangedEvent` exists in the codebase (grep confirms zero matches).

#### Frontend Evidence

| File                                                           | Relevant UI                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/features/users/components/UserDetailSheet.tsx` | "Change Role" section: 4 toggle buttons — `admin`, `restaurant`, `shipper`, `user` — with a Save button |
| `apps/admin/src/features/users/api/users.api.ts`               | `setRole(userId, role)` → `authClient.admin.setRole()`                                                  |

**Security gap:** The frontend presents `shipper` as a directly-assignable role alongside `admin`, `restaurant`, and `user`. BR-35.2 requires that shipper assignment be blocked at the API level (must go through UC-28 application flow). The Better Auth `setRole` endpoint will happily accept `'shipper'` — there is no server-side guard blocking direct shipper assignment.

#### What Exists ✅

- Role change endpoint exists via Better Auth admin plugin.
- Admin frontend: role picker with 4 role options, save action.
- Access restricted to admin users via Better Auth `adminRoles` config.

#### What Is Missing ❌

1. **`shipper` role is directly assignable** (BR-35.2 violated): Both the frontend UI and the Better Auth `setRole` endpoint will accept `'shipper'` as a target role. No server-side guard intercepts this. This is a **functional correctness issue** — shipper assignment must go through UC-28.
2. **No reason field** (BR-35.3): `UserDetailSheet` has no reason/note input for role changes. Better Auth's `setRole` has no `reason` parameter.
3. **No last-administrator safeguard** (BR-35.4): Nothing prevents an admin from changing their own role or another admin's role to `'user'`, potentially removing all admins from the system.
4. **No suspended-account guard** (BR-35.5): Attempting a role change on a suspended account (`banned = true`) must return HTTP 409 referencing `MSG-ADM-31`, requiring reactivation via UC-29 first. Neither the Better Auth `setRole` endpoint nor any custom code enforces this check.
5. **No `RoleAssignmentChangedEvent`** — the event type does not exist. No side effects are triggered after a role change.
6. **No `system_announcement` notification** to the affected user (BR-35.8).
7. **No audit trail** (BR-35.10): No `role_assignment_audit` table, no insertion of actor + target + old role + new role + reason + timestamp.
8. **No session role-data refresh after role change** (BR-35.9): SRS BR-35.9 specifies that sessions are **not** force-invalidated after a role change; instead, the session's cached role data must be refreshed on the next request so authorisation reflects the new role immediately. Currently neither session invalidation nor role-cache-refresh is implemented — the target user continues operating under their old role until manual sign-out.
9. **No `soliRoles` column** (BR-35.7): The SRS specifies a backwards-compatible `soliRoles: string[]` escape hatch on the `users` row, allowing a single account to hold multiple operational roles (e.g. a restaurant owner who also operates as a shipper). This column is absent from the current Drizzle schema — only the single `role: text` primary role column exists.
10. **No `users.version` column** (BR-35.7): Atomic role persistence requires an optimistic-lock `version` increment on the `users` row. This column is absent from the current schema.

#### Completion Assessment: ~35%

The role change action works at the API level. All business rules (shipper guard, suspended-account guard, last-admin guard, reason, audit, events, session refresh, soliRoles) are absent. The security gap in BR-35.2 is the most critical issue.

---

## 4. Cross-Cutting Findings

### 4.1 No Audit Infrastructure

Zero audit tables exist anywhere in the schema. The following are all missing:

- `restaurant_approval_audit` (UC-27 — SRS BR-27.11)
- `shipper_approval_audit` (UC-28 — SRS BR-28.15)
- `user_status_audit` (UC-29 — SRS BR-29.14)
- `user_profile_audit` (UC-31 — SRS BR-31.18)
- `role_assignment_audit` (UC-35 — SRS BR-35.10)
- `admin_activity_log` (UC-34)

This is a cross-cutting gap affecting UC-27, UC-28, UC-29, UC-31, UC-35. All audit requirements from the SRS are unmet.

### 4.2 No Admin-Specific Event Types

The codebase has no admin-domain events:

- `RestaurantApprovedEvent` (audit-specific, distinct from `RestaurantUpdatedEvent`)
- `ShipperApprovedEvent`
- `UserSuspendedEvent` / `UserReactivatedEvent`
- `RoleAssignmentChangedEvent`
- `UserProfileUpdatedEvent`

Without these events, the notification module cannot send system announcements on admin actions, and async audit-trail handlers cannot be registered.

### 4.3 Better Auth Admin Plugin Boundary

Better Auth's `admin` plugin provides working endpoints for:

- `POST /api/auth/admin/ban-user` (UC-29 ✅ delegated)
- `POST /api/auth/admin/unban-user` (UC-29 ✅ delegated)
- `POST /api/auth/admin/set-role` (UC-35 ✅ delegated)
- `GET /api/auth/admin/list-users` (UC-31 ✅ delegated)
- `POST /api/auth/admin/remove-user` (UC-31 ✅ delegated)

The plugin does **not** support: reason fields, last-admin guards, shipper-role blocking, custom event publishing, or audit-trail insertion. All custom business rules require either wrapping the plugin call in a NestJS service or replacing the frontend calls with custom NestJS endpoints that apply business rules before delegating to auth operations.

### 4.4 Missing Shipper Application Bounded Context

UC-28 is the most foundational missing piece. It blocks:

- UC-35's BR-35.2 (shipper role must come from the application flow).
- Any shipper onboarding automation.
- The ability for users to register as shippers through the platform.

Implementing UC-28 requires:

1. A `shipper_applications` table in Drizzle schema.
2. A `ShipperApplicationModule` (entity, repository, service, controller).
3. `ShipperApprovedEvent` and its handlers.
4. Admin frontend: shipper applications queue page + review UI.
5. Router: `/shippers` route in `apps/admin/src/app/router.tsx`.

### 4.5 UC-32 Frontend Gap (Security Risk)

The backend correctly enforces admin-only access for refunds (`delivered→refunded`) and allows cancellations for admins. However, the admin panel exposes **no UI to trigger these actions**. This means disputed orders or pre-delivery cancellations requiring admin intervention **cannot be processed from the admin panel**. An admin would need to call the API directly (e.g., via Postman / curl), which is not operationally acceptable. This is the highest-impact frontend gap.

---

## 5. Recommended Implementation Order

Priority is based on: (1) blocking other use cases, (2) operational impact, (3) effort.

### Priority 1 — Unblock Operations (High Impact, Moderate Effort)

| #   | Task                                                                                                  | Rationale                                                                        |
| --- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | **UC-32 Frontend** — Add Cancel + Refund buttons to `OrderDetailSheet.tsx` + calls to `orders.api.ts` | Existing backend is complete; frontend is the only gap. Low effort, high impact. |
| 2   | **UC-27 Improvements** — Add audit trail (DB table + insert in `setApproved()`) + idempotency check   | Restaurant approval audit is a compliance requirement.                           |
| 3   | **UC-27 Frontend** — Add filter tabs (Pending / Approved) to `RestaurantsPage.tsx` + show owner email | Improves operator usability without backend changes.                             |

### Priority 2 — Security & Correctness (High Impact, Low-Medium Effort)

| #   | Task                                                                                                                              | Rationale                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 4   | **UC-35 Shipper Guard** — Add server-side validation in a custom `/admin/users/:id/role` endpoint that rejects `'shipper'` target | BR-35.2 is a functional correctness + security rule. |
| 5   | **UC-35 Last-Admin Guard** — Implement in the same custom endpoint                                                                | Prevents accidental administrator lockout.           |
| 6   | **UC-29 Last-Admin Suspend Guard** — Add check before ban/unban delegation                                                        | Same administrator-lockout risk.                     |
| 7   | **UC-35 / UC-29 Notifications** — Publish `RoleAssignmentChangedEvent` and `UserSuspendedEvent`; wire to notification module      | Required for `system_announcement` post-conditions.  |

### Priority 3 — User Management Completeness (Medium Impact, Medium Effort)

| #   | Task                                                                                                        | Rationale                                    |
| --- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 8   | **UC-31 Profile Edit** — Add `PATCH /admin/users/:id/profile` endpoint + edit form in `UserDetailSheet.tsx` | Required by BR-31.12.                        |
| 9   | **UC-31 Detail Enrichment** — Join owned restaurants + order count in `/admin/users/:id` detail response    | Required by BR-31.9.                         |
| 10  | **UC-30 Frontend Filters** — Add restaurant / customer / date-range filter controls to `OrdersPage.tsx`     | Backend DTO already supports all parameters. |

### Priority 4 — New Bounded Contexts (High Effort)

| #   | Task                                                                                                          | Rationale                                                |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 11  | **UC-28 Shipper Applications** — Full bounded context: DB schema, module, admin frontend, router              | Foundational; required for UC-35 BR-35.2.                |
| 12  | **UC-34 Dashboard** — `/admin/dashboard` endpoint + KPI aggregations + `DashboardPage.tsx`                    | High operator value; requires new aggregation queries.   |
| 13  | **UC-33 Reports** — `/admin/reports` controller + aggregation service + export (CSV/XLSX) + `ReportsPage.tsx` | Most complex; requires new DB views and export pipeline. |

### Priority 5 — Cross-Cutting Infrastructure (Medium Effort, Enables All Audit BRs)

| #   | Task                                                                                                                                                              | Rationale                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 14  | **Audit Tables** — Add `restaurant_approval_audit`, `shipper_approval_audit`, `user_status_audit`, `user_profile_audit`, `role_assignment_audit` in Drizzle schema | Pre-requisite for all audit-trail BRs across UC-27, UC-28, UC-29, UC-31, UC-35. |
| 15  | **Schema Columns** — Add `bannedAt`, `bannedBy` (UC-29 BR-29.5) and `soliRoles: string[]`, `version: integer` (UC-35 BR-35.7 / UC-31 BR-31.14) to `users` table   | Required by BR-29.5, BR-31.14, BR-35.7.                                   |
| 16  | **Admin Domain Events** — Define `RestaurantApprovedEvent`, `UserSuspendedEvent`, `RoleAssignmentChangedEvent`, `UserProfileUpdatedEvent`                          | Enable async audit + notification side effects.                            |

---

## 6. Final Coverage Summary

| Use Case                          | Backend                      | Frontend                                                            | Database                                       | Overall | Status      |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- | ------- | ----------- |
| UC-27 Approve/Reject Restaurants  | ✅ Core endpoints present    | ✅ UI present, ⚠️ no server-side approval-status filter             | ❌ No audit table                              | ~55%    | ⚠️ Partial  |
| UC-28 Approve/Reject Shippers     | ❌ Not started               | ❌ Not started                                                      | ❌ No table                                    | 0%      | ❌ None     |
| UC-29 Suspend/Reactivate Partners | ✅ Via Better Auth plugin    | ✅ Ban/Unban UI, ⚠️ reason marked optional                         | ⚠️ banned cols, ❌ no bannedAt/bannedBy, no audit | ~50%    | ⚠️ Partial  |
| UC-30 Monitor Orders              | ✅ Admin endpoints, rich DTO | ✅ Table + detail view, ⚠️ limited filters                          | n/a                                            | ~65%    | ⚠️ Partial  |
| UC-31 Search/Manage Users         | ✅ Via Better Auth plugin    | ✅ List + detail, ⚠️ no profile edit                               | ❌ No user_profile_audit, no version col        | ~50%    | ⚠️ Partial  |
| UC-32 Admin Cancel/Refund         | ✅ Backend complete          | ❌ No action buttons in UI                                          | n/a                                            | ~45%    | ⚠️ Partial  |
| UC-33 Operational Reports         | ❌ Not started               | ❌ Not started                                                      | ❌ Not started                                 | 0%      | ❌ None     |
| UC-34 Dashboard                   | ❌ Not started               | ❌ Not started                                                      | ❌ Not started                                 | 0%      | ❌ None     |
| UC-35 Admin Role Management       | ✅ Via Better Auth plugin    | ✅ Role picker UI, ⚠️ shipper directly assignable, no reason input  | ❌ No audit table, no soliRoles, no version col | ~35%    | ⚠️ Partial  |

**Overall Administration & Governance implementation: approximately 38% complete.**

Three use cases (UC-28, UC-33, UC-34) are entirely unimplemented. The highest-priority fixes are: (1) adding cancel/refund UI to the admin panel (UC-32), (2) blocking direct shipper role assignment (UC-35 BR-35.2), (3) enforcing suspension reason as required and adding missing schema columns (`bannedAt`, `bannedBy`) in UC-29, and (4) implementing the shipper application bounded context (UC-28).

---

_This document was generated by automated codebase audit. All file references have been verified against the current workspace state._
