# ADR-001 — Adopt Modular Monolith Architecture

## Status

Accepted

## Problem / Context

SoLi Food Delivery is a multi-role marketplace for customers, restaurant owners, shippers, administrators, and developers. The system must support restaurant discovery, cart and checkout, VNPay payment, order lifecycle, promotion application, notifications, image management, and platform governance while remaining understandable for a course-scale and product-scale team.

The implementation evidence shows a single NestJS backend deployable composed in [app.module.ts](../../../src/app.module.ts), with modules for Auth, Restaurant Catalog, Image, Ordering, Payment, Promotion, Notification, shared infrastructure, and shared contracts. The frontend clients in `apps/mobile` and `apps/web` consume HTTP APIs and Socket.IO notifications from this backend instead of calling separate services.

Relevant drivers appear in [ASR_FoodDelivery.md](ASR_FoodDelivery.md): decoupling of bounded contexts under one deployable, exactly-once order creation, payment integrity, real-time status visibility, and maintainability of module boundaries. [ADD_FoodDelivery.md](ADD_FoodDelivery.md) defines the Implementation View as `apps/api NestJS modular monolith`, and the Quality Attribute constraints require performance, reliability, security, scalability, maintainability, testability, and interoperability without assuming a distributed service platform.

The architecture issue is choosing a deployment and modularity style that protects domain boundaries while avoiding distributed-systems overhead during the current product stage.

## Candidate Solutions

### Option A — Layered Monolith

Description

A single application organized primarily by technical layers such as controllers, services, repositories, DTOs, and database models.

Pros

- Simple to start and easy for small teams to understand.
- One deployment unit and one local development flow.
- Low operational overhead compared with distributed services.

Cons

- Domain ownership becomes blurry as Ordering, Payment, Catalog, Notification, and Promotion logic grow.
- Cross-domain imports are easy to introduce because package boundaries follow technical layers rather than business capability.
- Changes to high-risk workflows such as checkout and payment can spread across shared service layers.

Trade-offs

- This option maximizes initial simplicity but weakens maintainability and conceptual integrity once business workflows cross multiple domains.

### Option B — Microservices

Description

Split Auth, Catalog, Ordering, Payment, Promotion, Notification, Review, and Governance into independently deployed services with separate runtime processes and service-to-service communication.

Pros

- Strong physical isolation between bounded contexts.
- Independent deployment and scaling per service.
- Natural path for separate ownership when teams become large.

Cons

- Requires message broker, service discovery, deployment automation, distributed tracing, API contracts, network retry policy, and operational maturity.
- Checkout would need distributed consistency patterns across Ordering, Payment, Promotion, Notification, and Catalog snapshots.
- Local development and testing would be heavier than the current CI and Docker setup.

Trade-offs

- This option increases isolation and independent scaling but creates significant reliability and operability costs for a system whose current scale and team model fit a single deployable.

### Option C — Modular Monolith

Description

Keep one backend deployable while organizing the code by bounded contexts, module-owned schemas, in-process events, ACL snapshots, and dependency-inversion ports.

Pros

- Preserves a simple deployment topology while providing domain-oriented boundaries.
- Keeps cross-context workflows local and testable in one process.
- Supports horizontal scaling by replicating the full stateless API instance behind a load balancer.
- Matches the implemented NestJS module structure and the ADD Implementation View.

Cons

- Module boundaries require discipline, review, and boundary checks because they are logical rather than process-enforced.
- All contexts scale together as one API runtime.
- In-process events require all event publishers and handlers to run in the same application instance.

Trade-offs

- This option balances maintainability and operational simplicity. It accepts logical coupling controls instead of physical service isolation.

## Decision

Selected solution:

Adopt a Modular Monolith architecture for the SoLi backend, implemented as a single NestJS application with business modules, shared infrastructure modules, shared events, shared ports, PostgreSQL persistence, Redis runtime state, and CI/CD artifacts around the monorepo.

## Rationale

The Modular Monolith is selected because it matches the actual implementation in [app.module.ts](../../../src/app.module.ts), the ASR implementation reality in [ASR_FoodDelivery.md](ASR_FoodDelivery.md), and the ADD Logical and Implementation Views in [ADD_FoodDelivery.md](ADD_FoodDelivery.md). It provides enough structure to protect Ordering, Payment, Promotion, Catalog, Notification, Image, Auth, Review, and Governance responsibilities while keeping the runtime and deployment model suitable for the current product stage.

The Layered Monolith option is rejected because it would hide business ownership behind technical layers and make BC erosion likely. The Microservices option is rejected because its operational cost is disproportionate for the current architecture drivers, especially since accepted ASRs explicitly use in-process EventBus, one PostgreSQL database, local ACL snapshots, and full-instance horizontal scaling.

This decision directly supports the BRD goals of a multi-role ordering platform, the Vision objective of real-time order tracking and integrated online payments, and ADD quality constraints for maintainability, reliability, performance, scalability, and testability.

## Consequences

Positive:

- The team can develop, test, and deploy one backend while preserving domain-oriented module ownership.
- Checkout, payment, promotion, and notification flows stay inside one transactionally observable runtime boundary.
- CI can validate the full backend with PostgreSQL and Redis services through the existing workflow.

Negative:

- Logical boundaries can be bypassed unless reviews and tooling enforce import rules.
- One deployable means module-level scaling is limited; the whole API scales together.
- In-process events are unsuitable for separating publishers and subscribers into independent runtimes.

Future impact:

- A later service extraction path remains available because domain modules, schema ownership, shared ports, and domain events already separate business responsibilities.

# ADR-002 — Adopt Boundary Context Separation

## Status

Accepted

## Problem / Context

The Food Delivery domain has distinct responsibilities: identity and sessions, restaurant and menu catalog, image metadata and Cloudinary uploads, cart and order lifecycle, payment lifecycle, promotion rules, notifications, review and rating, and platform governance. These concerns change for different reasons and are owned by different business concepts.

The implementation organizes backend source under [apps/api/src/module](../../../src/module) with concrete modules for Auth, Restaurant Catalog, Image, Ordering, Payment, Promotion, and Notification. The ADD Logical View also defines Review & Rating and Admin/Governance as architecture contexts. The SRS and Use Case Specification group system behavior into Authentication, Restaurant Discovery, Cart/Ordering, Payment, Restaurant Operations, Notification, Review, and Administration areas.

Relevant implementation examples include [ordering.module.ts](../../../src/module/ordering/ordering.module.ts), [payment.module.ts](../../../src/module/payment/payment.module.ts), [promotion.module.ts](../../../src/module/promotion/promotion.module.ts), [notification.module.ts](../../../src/module/notification/notification.module.ts), [image.module.ts](../../../src/module/image/image.module.ts), and [restaurant-catalog.module.ts](../../../src/module/restaurant-catalog/restaurant-catalog.module.ts). The ASR and ADD maintainability constraints explicitly call for bounded-context boundary enforcement and clear data ownership.

The architecture issue is how to decompose the backend so that business concepts remain coherent as the product grows.

## Candidate Solutions

### Option A — Technical Layer Separation

Description

Organize code by generic technical layers such as all controllers, all services, all repositories, and all schemas.

Pros

- Familiar structure for simple CRUD systems.
- Reuse of technical patterns is visible in one place.
- Easy to scaffold early endpoints.

Cons

- Ordering logic can easily depend on concrete Catalog, Payment, or Promotion classes.
- Business vocabulary fragments because files are grouped by technology rather than domain ownership.
- High-risk workflow changes become harder to review because they span generic folders.

Trade-offs

- This option improves technical uniformity but weakens conceptual integrity and domain-level maintainability.

### Option B — Feature-by-UI or Endpoint Separation

Description

Organize backend modules around screen flows or API endpoints, such as checkout page, dashboard page, menu management page, and notifications page.

Pros

- Aligns quickly with frontend delivery tasks.
- Makes a single user workflow easy to locate.
- Can reduce short-term coordination between frontend and backend.

Cons

- Shared business concepts such as Order, Restaurant, Payment, and Promotion become duplicated across features.
- Backend ownership shifts whenever UI screens change.
- Cross-cutting workflows such as payment confirmation, refunds, and notifications cut across many feature folders.

Trade-offs

- This option optimizes for screen delivery but risks duplicating domain rules and breaking stable backend boundaries.

### Option C — Bounded Context Separation

Description

Organize backend modules around business capabilities: Auth, Restaurant Catalog, Image, Ordering, Payment, Promotion, Notification, Review & Rating, and Admin/Governance.

Pros

- Aligns code ownership with business vocabulary and SRS domains.
- Keeps invariants near the module that owns them, such as order transitions in Ordering and payment verification in Payment.
- Enables ports, events, and ACL snapshots as explicit cross-context contracts.
- Supports modular-monolith evolution without requiring immediate service extraction.

Cons

- Requires careful contract design between contexts.
- Some workflows need more explicit integration code than direct shared-service calls.
- Review and Governance contexts must remain aligned with implemented surfaces and documented contracts.

Trade-offs

- This option increases design discipline but preserves conceptual integrity and maintainability across a growing domain model.

## Decision

Selected solution:

Adopt bounded-context separation as the primary decomposition model for the backend and architecture documents.

The accepted contexts are Auth, Restaurant Catalog, Image, Ordering, Payment, Promotion, Notification, Review & Rating, and Admin/Governance.

## Rationale

Bounded-context separation is selected because it matches both the codebase and the architecture artifacts. Restaurant Catalog owns restaurants, menus, delivery zones, search, and availability events. Ordering owns cart, checkout, order lifecycle, history, ACL snapshots, app settings, and order timeout behavior. Payment owns VNPay transaction lifecycle and IPN verification. Promotion owns promotion and coupon rules. Notification owns inbox, channel dispatch, preferences, presence, and notification ACL snapshots. Image owns image metadata and Cloudinary integration. Auth owns identity, roles, and session persistence. Review & Rating and Admin/Governance are defined by the ADD/SRS as separate business capabilities rather than UI features.

Technical layering is rejected because the system is not a simple CRUD application; it has strong business invariants such as single-restaurant cart, payment callback integrity, promotion reservation, and order state-machine integrity. Feature-by-UI separation is rejected because it would couple backend architecture to web and mobile screens.

The decision aligns with ASR AD-3, ADD Maintainability constraints, SRS domain decomposition, and the Quality Attributes strategy that recommends module boundaries by bounded context inside a modular monolith.

## Consequences

Positive:

- Each major business capability has a stable owner and vocabulary.
- Cross-context dependencies become visible through events, ports, and snapshots.
- Code review can reason about boundary violations and ownership changes.

Negative:

- Developers must understand both the local module and its integration contracts.
- Some data needed by one context must be projected or passed through ports instead of directly imported.
- Documentation must keep BC names and responsibilities consistent across ASR, ADD, SRS, and code.

Future impact:

- Contexts can be extracted selectively only after their contracts, schemas, and event flows are stable enough to justify a separate runtime.

# ADR-003 — Use Database per BC Ownership

## Status

Accepted

## Problem / Context

The platform needs durable persistence for users, sessions, restaurants, menus, images, orders, order items, order status logs, ACL snapshots, payments, promotions, notifications, preferences, devices, and delivery logs. These data groups belong to different bounded contexts, but the selected architecture is a modular monolith rather than distributed services.

The implementation uses a single PostgreSQL database configured through [drizzle.module.ts](../../../src/drizzle/drizzle.module.ts) and [drizzle.config.ts](../../../drizzle.config.ts). The schema barrel [schema.ts](../../../src/drizzle/schema.ts) exports module-owned schemas from Auth, Restaurant Catalog, Image, Ordering, Payment, Notification, and Promotion. Domain schemas such as [order.schema.ts](../../../src/module/ordering/order/order.schema.ts), [payment-transaction.schema.ts](../../../src/module/payment/domain/payment-transaction.schema.ts), [promotion.schema.ts](../../../src/module/promotion/domain/promotion.schema.ts), and [restaurant.schema.ts](../../../src/module/restaurant-catalog/restaurant/restaurant.schema.ts) show logical ownership by BC.

Important data ownership choices are visible in code: `orders.customerId`, `orders.restaurantId`, `orderItems.menuItemId`, `payment_transactions.orderId`, and `promotions.restaurantId` are stored as cross-context UUID references rather than hard foreign keys into other BC tables. Ordering reads Catalog data through ACL snapshot tables rather than joining Catalog tables directly at checkout.

The architecture issue is balancing data consistency, module ownership, and operational simplicity.

## Candidate Solutions

### Option A — Shared Database with Unrestricted Cross-Module Access

Description

All modules use one database and can freely join or mutate tables owned by any module.

Pros

- Very simple to query.
- Easy to enforce referential constraints globally.
- Minimal data duplication.

Cons

- Module boundaries collapse at the database layer.
- Ordering could rely on Catalog table details, making Catalog changes risky.
- Business ownership becomes ambiguous when multiple modules write the same table group.

Trade-offs

- This option simplifies SQL but undermines bounded contexts and maintainability.

### Option B — Physical Database per Service or Context

Description

Each bounded context owns a separate physical database, even while the backend remains one codebase.

Pros

- Strongest persistence isolation.
- Clear data ownership enforced by infrastructure.
- Easier service extraction for contexts that already have isolated storage.

Cons

- Cross-context workflows require distributed consistency patterns, replication, or broker-backed events.
- Local development, CI, migrations, backup, and reporting become significantly more complex.
- Checkout and payment flows would need more coordination for a product that currently fits one deployable.

Trade-offs

- This option improves isolation but adds operational and consistency costs too early.

### Option C — Single PostgreSQL with Database per BC Ownership

Description

Use one PostgreSQL database while assigning table groups to bounded contexts. Contexts own their schemas and expose data through repositories, snapshots, ports, or events. Cross-context references are stored as IDs or immutable snapshots where appropriate.

Pros

- Fits the modular monolith deployment model.
- Keeps transactions local for high-risk workflows such as order creation.
- Preserves clear ownership through module-scoped schema files.
- Simplifies CI and deployment through one PostgreSQL service.

Cons

- Ownership is logical and must be enforced by convention, review, and tooling.
- Reporting queries can be tempted to bypass module boundaries.
- Some read models are duplicated as snapshots to protect runtime boundaries.

Trade-offs

- This option keeps operational simplicity while preserving enough data ownership discipline for modular architecture.

## Decision

Selected solution:

Use a single PostgreSQL database with database per BC ownership: table groups are owned by bounded contexts, cross-context writes are avoided, and cross-context reads are performed through snapshots, repositories, ports, or stable contracts.

## Rationale

This decision matches the implemented Drizzle schema organization and the ADD Data View/Implementation View. PostgreSQL remains the durable source of truth for core business state, while Redis is used for volatile runtime state. The schema barrel centralizes exports for Drizzle Kit but the source schema definitions remain located inside their owning modules.

The unrestricted shared database option is rejected because it would make direct joins and writes across Auth, Catalog, Ordering, Payment, Promotion, and Notification routine. The physical database per context option is rejected because it would impose distributed data management on a system intentionally designed as one modular deployable.

This decision supports ASR AD-3, ADD Maintainability, ADD Reliability, and ADD Scalability by preserving local transactions for order placement, clear table ownership, and full-instance horizontal scaling.

## Consequences

Positive:

- The system keeps one database connection, one migration flow, and straightforward CI setup.
- Ownership remains clear because schemas live in their module folders.
- Ordering can persist order, order items, and audit logs atomically without distributed transactions.

Negative:

- Logical ownership can be violated by careless imports or ad hoc SQL.
- Snapshot duplication introduces synchronization responsibilities.
- Cross-context reporting must respect ownership boundaries or use curated read models.

Future impact:

- Physical separation remains possible for selected contexts because cross-context references are already modeled as IDs and snapshots rather than pervasive foreign-key coupling.

# ADR-004 — Use In-process EventBus Communication

## Status

Accepted

## Problem / Context

Several workflows need cross-context reactions after business state changes. Restaurant Catalog publishes menu, restaurant, and delivery-zone updates so Ordering and Notification can refresh snapshots. Ordering publishes order placement and lifecycle changes so Notification, Payment, Promotion, Review, and Governance concerns can react. Payment publishes payment confirmed or failed events after VNPay IPN processing. Promotion participates in reservation and rollback behavior around checkout and cancellation.

The implementation uses `@nestjs/cqrs` EventBus. Evidence includes [menu.service.ts](../../../src/module/restaurant-catalog/menu/menu.service.ts), [restaurant.service.ts](../../../src/module/restaurant-catalog/restaurant/restaurant.service.ts), [place-order.handler.ts](../../../src/module/ordering/order/commands/place-order.handler.ts), [process-ipn.handler.ts](../../../src/module/payment/commands/process-ipn.handler.ts), the Ordering ACL projectors, and Notification event handlers. [ordering.module.ts](../../../src/module/ordering/ordering.module.ts), [acl.module.ts](../../../src/module/ordering/acl/acl.module.ts), and [notification.module.ts](../../../src/module/notification/notification.module.ts) import `CqrsModule` to support commands and event handlers.

The ADD Scalability section explicitly notes that in-process synchronous EventBus assumes publishers and handlers live in the same application instance. The ASR implementation reality also states that no external message broker is part of the architecture.

The architecture issue is selecting an integration mechanism that decouples modules without adding distributed infrastructure.

## Candidate Solutions

### Option A — Direct Service Calls Between Modules

Description

When Catalog, Ordering, Payment, or Promotion changes state, it directly invokes services in the other contexts that need to react.

Pros

- Straightforward control flow and debugging.
- Immediate success/failure feedback from downstream actions.
- No event handler registration required.

Cons

- Creates concrete cross-BC dependencies and circular module risk.
- Publisher modules must know all subscribers.
- Non-critical side effects can block critical state changes.

Trade-offs

- This option is simple for a few interactions but scales poorly as notifications, projections, audit, and compensation handlers grow.

### Option B — External Message Broker

Description

Publish domain events to Kafka, RabbitMQ, NATS, SQS, or similar infrastructure for asynchronous subscribers.

Pros

- Decouples runtime processes.
- Enables durable asynchronous delivery and service extraction.
- Supports retries, buffering, and independent consumers.

Cons

- Requires broker operations, schema governance, dead-letter handling, idempotent consumers, and monitoring.
- Adds eventual consistency and operational complexity to checkout and payment flows.
- Heavier than necessary for a single deployable modular monolith.

Trade-offs

- This option improves distributed scalability but adds infrastructure and delivery semantics that the current architecture does not need.

### Option C — In-process EventBus

Description

Use NestJS CQRS EventBus inside the same process. Publishers emit domain events after state changes; handlers update snapshots, notifications, lifecycle state, or compensation state.

Pros

- Decouples publisher and subscriber code inside one deployable.
- Keeps event flow fast and testable without external infrastructure.
- Supports fan-out, as seen with RestaurantUpdatedEvent consumed by both Ordering and Notification ACL projectors.
- Matches the modular monolith and CI setup.

Cons

- Events are not durable once the process terminates.
- Publishers and handlers must run in the same application instance.
- Handler failure policies must be explicit because they run in-process.

Trade-offs

- This option gives clean module decoupling at low operational cost while accepting process-local delivery semantics.

## Decision

Selected solution:

Use NestJS in-process EventBus as the cross-BC domain-event mechanism for the modular monolith.

## Rationale

In-process EventBus is selected because it matches the implementation and the architecture drivers. Catalog publishes `RestaurantUpdatedEvent`, `MenuItemUpdatedEvent`, and delivery-zone events; Ordering ACL projectors maintain local snapshots. Ordering publishes `OrderPlacedEvent` and order-status events. Payment publishes `PaymentConfirmedEvent` and `PaymentFailedEvent` after IPN state is durably updated. Notification handlers consume order and payment events for multi-channel user communication.

Direct service calls are rejected because they would make publishers depend on consumers and weaken BC separation. An external broker is rejected because the architecture is a modular monolith and the accepted ASRs do not require distributed event infrastructure.

This decision supports ADD Performance by avoiding chatty cross-context calls, ADD Reliability by publishing events after commit, ADD Maintainability by making side effects explicit, and the SRS requirement for real-time notifications and payment-aware order transitions.

## Consequences

Positive:

- Domain events provide a clear integration style inside one runtime.
- Multiple contexts can react to the same event without the publisher knowing each subscriber.
- The system avoids broker operations while preserving an event-oriented design.

Negative:

- Events are process-local and lack broker durability.
- Event handler behavior must be carefully reviewed to avoid blocking critical flows.
- Scaling separated publishers and subscribers requires a later integration mechanism.

Future impact:

- If selected contexts move to separate deployables, the existing event classes and handlers provide a strong starting contract for broker-backed integration.

# ADR-005 — Adopt ACL Snapshot Pattern

## Status

Accepted

## Problem / Context

Ordering must validate restaurant approval/open status, menu item availability, prices, modifiers, and delivery zones during checkout. Notification must know restaurant owner routing information to send restaurant-related messages. These data items are owned by Restaurant Catalog, not Ordering or Notification.

The implementation provides an Anti-Corruption Layer for Ordering in [acl.module.ts](../../../src/module/ordering/acl/acl.module.ts). It listens to Catalog domain events and writes local snapshot tables through [menu-item.projector.ts](../../../src/module/ordering/acl/projections/menu-item.projector.ts), [restaurant-snapshot.projector.ts](../../../src/module/ordering/acl/projections/restaurant-snapshot.projector.ts), and [delivery-zone-snapshot.projector.ts](../../../src/module/ordering/acl/projections/delivery-zone-snapshot.projector.ts). [place-order.handler.ts](../../../src/module/ordering/order/commands/place-order.handler.ts) reads snapshot repositories rather than calling Catalog services during checkout. Notification has a separate restaurant ACL projector in [notification-restaurant-snapshot.projector.ts](../../../src/module/notification/acl/notification-restaurant-snapshot.projector.ts).

ADD Quality Attribute scenarios state that checkout uses local ACL snapshot reads with no cross-BC RPC and that menu/availability propagation flows from Catalog events into Ordering projections. Business Rules BR-2, BR-3, BR-4, BR-7, and BR-8 require stable cart, delivery, payment, lifecycle, and availability behavior.

The architecture issue is how a context can consume another context's data without owning it or coupling to its internals.

## Candidate Solutions

### Option A — Direct Cross-BC Joins

Description

Ordering directly joins Catalog tables at checkout, and Notification directly queries Catalog tables when routing notifications.

Pros

- Always reads the latest Catalog database state.
- Fewer duplicated tables.
- Simple SQL for one physical database.

Cons

- Ordering becomes dependent on Catalog table structure.
- Catalog schema changes can break checkout.
- Violates BC data ownership by encouraging read coupling across modules.

Trade-offs

- This option improves freshness and SQL simplicity but weakens maintainability and modularity.

### Option B — Runtime Service Calls to Source BC

Description

Ordering calls RestaurantService, MenuService, or ZoneService at checkout; Notification calls Catalog services during event handling.

Pros

- Preserves source BC as the runtime authority.
- Avoids snapshot duplication.
- Keeps business validation close to the owning service.

Cons

- Adds synchronous cross-module calls to the critical checkout path.
- Can create circular dependencies between modules.
- Availability or latency issues in a non-owning context can block checkout.

Trade-offs

- This option centralizes authority but increases runtime coupling and checkout latency risk.

### Option C — ACL Snapshot Pattern

Description

Source contexts publish domain events; consuming contexts store local read models containing only fields they need for their own decisions.

Pros

- Checkout reads local Ordering-owned snapshot tables, improving performance and reliability.
- Consumers depend on stable event contracts instead of source table internals.
- Snapshot contents can be minimal and tailored per consumer.
- Supports idempotent replay through upsert behavior.

Cons

- Snapshot staleness must be managed through event propagation and monitoring.
- More tables and projectors exist than in direct-query designs.
- Event payloads become part of the architecture contract.

Trade-offs

- This option accepts duplication to preserve context ownership, performance, and checkout isolation.

## Decision

Selected solution:

Adopt the ACL Snapshot Pattern for cross-BC read needs, especially Ordering and Notification consuming Restaurant Catalog data.

## Rationale

ACL snapshots are selected because they are already implemented and directly support the critical checkout path. Ordering reads `ordering_menu_item_snapshots`, `ordering_restaurant_snapshots`, and `ordering_delivery_zone_snapshots` to validate cart contents, restaurant state, modifiers, pricing, and delivery radius without importing Catalog services. Notification stores `notification_restaurant_snapshots` with only restaurant owner routing fields.

Direct joins are rejected because they make module ownership porous. Runtime service calls are rejected because they add cross-context dependencies to the checkout path and weaken the modular monolith boundary.

The decision aligns with ASR AD-3 and AD-7, ADD Performance, ADD Maintainability, ADD Reliability, SRS availability/update-propagation requirements, and Business Rules BR-2, BR-3, and BR-8.

## Consequences

Positive:

- Ordering can validate checkout using local data and a stable snapshot contract.
- Catalog can evolve internal schemas while preserving event payload compatibility.
- Notification can route messages without depending on full Catalog models.

Negative:

- Event propagation failures can leave snapshots stale until repaired.
- More projection tests and monitoring are required around event handlers.
- Snapshot table definitions must be kept intentionally minimal to avoid recreating the source context.

Future impact:

- The same snapshot pattern can support additional consumers such as Review aggregation or Governance reporting without exposing source-context internals.

# ADR-006 — Use Redis Runtime Layer

## Status

Accepted

## Problem / Context

The platform needs low-latency runtime state for carts, checkout coordination, idempotency, WebSocket presence, unread-count caching, and rate-limit windows. This state is operationally important but differs from durable business truth stored in PostgreSQL.

The implementation uses Redis through [redis.module.ts](../../../src/lib/redis/redis.module.ts) and [redis.service.ts](../../../src/lib/redis/redis.service.ts), backed by `ioredis`. [cart.redis-repository.ts](../../../src/module/ordering/cart/cart.redis-repository.ts) stores `cart:{customerId}` values with TTL. [place-order.handler.ts](../../../src/module/ordering/order/commands/place-order.handler.ts) uses Redis idempotency keys and cart checkout locks. [user-presence.service.ts](../../../src/module/notification/services/user-presence.service.ts) stores `ws:connections:{userId}` reference counts with TTL for Socket.IO presence. Redis sorted-set primitives exist for rate-limit windows.

PostgreSQL remains the authoritative store for orders, payments, notifications, promotion usage, sessions, and schemas. The ADD explicitly separates Redis / Valkey shared volatile state from PostgreSQL `DB_CONNECTION`, and the ASR drivers identify Redis for cart state, idempotency keys, distributed locks, and WebSocket presence.

The architecture issue is choosing where to place fast-changing runtime state without overloading PostgreSQL or relying on per-process memory.

## Candidate Solutions

### Option A — PostgreSQL-Only Runtime State

Description

Store carts, idempotency keys, locks, presence, and rate-limit counters in PostgreSQL tables.

Pros

- One data store for all state.
- Strong durability and SQL queryability.
- Backup and operations are consolidated.

Cons

- Higher write overhead for high-frequency mutable state such as carts and presence heartbeats.
- Locks and TTL cleanup require extra schema and jobs.
- Presence and rate-limit windows are less natural in relational tables.

Trade-offs

- This option improves durability but makes volatile state heavier and slower.

### Option B — In-Memory Process State

Description

Store carts, locks, idempotency, presence, and counters inside the NestJS process memory.

Pros

- Fastest local access.
- No additional infrastructure.
- Simple for a single development instance.

Cons

- State is lost on restart.
- Multiple API instances cannot share state.
- Idempotency, cart consistency, and WebSocket presence become unreliable under horizontal scaling.

Trade-offs

- This option optimizes single-process speed but fails scalability and reliability requirements.

### Option C — Redis Runtime Layer

Description

Use Redis / Valkey for volatile, TTL-based, shared runtime state while PostgreSQL remains the durable business store.

Pros

- O(1) key-based cart, idempotency, lock, and presence operations.
- TTL semantics match carts, session-like presence, checkout locks, and retry windows.
- Shared across replicated API instances.
- Supports atomic primitives such as SET NX, INCR, DECR, EXPIRE, and sorted sets.

Cons

- Requires another infrastructure service and availability monitoring.
- Redis data model is less self-describing than relational tables.
- Code must handle Redis errors gracefully where state is advisory.

Trade-offs

- This option adds a focused runtime dependency to meet performance, reliability, and scaling needs without replacing PostgreSQL.

## Decision

Selected solution:

Use Redis as the runtime layer for volatile shared state: cart data, checkout locks, order idempotency, WebSocket presence, unread-count acceleration, and rate-limit windows. PostgreSQL remains the durable source of truth for business records.

## Rationale

Redis is selected because the implemented architecture already uses it for the exact state types called out in ASR and ADD. Cart state is key-based and TTL-bound. Idempotency keys map retry requests to order IDs. Checkout locks use SET NX semantics. Notification presence uses reference-counted keys with heartbeat TTL. Rate-limit support uses sorted-set primitives.

PostgreSQL-only runtime state is rejected because high-frequency volatile operations would add relational overhead and cleanup complexity. In-memory state is rejected because the ADD scalability constraint requires stateless API instances with shared runtime state across replicas.

This decision supports ADD Performance, Reliability, Scalability, Availability, and Usability by keeping cart mutation fast, duplicate order prevention reliable, and real-time notification routing aware of online users.

## Consequences

Positive:

- Cart and idempotency operations stay fast and naturally expire.
- Presence state is shared across API instances and resilient to disconnect races.
- PostgreSQL is reserved for durable business facts rather than transient coordination.

Negative:

- Redis availability becomes important for cart and checkout responsiveness.
- Runtime keys need naming discipline and observability.
- Redis-stored carts require defensive validation before order creation.

Future impact:

- The Redis layer can support additional runtime concerns such as adaptive throttling, hot search caches, and multi-instance WebSocket coordination while preserving PostgreSQL as the system of record.

# ADR-007 — Use Ports and Adapters Integration Pattern

## Status

Accepted

## Problem / Context

SoLi integrates with external systems and cross-context capabilities: VNPay for online payment, Cloudinary for image storage, FCM and SMTP for notifications, Better Auth for session handling, and Promotion/Payment business capabilities consumed by Ordering during checkout.

The implementation shows explicit ports in [payment-initiation.port.ts](../../../src/shared/ports/payment-initiation.port.ts) and [promotion-application.port.ts](../../../src/shared/ports/promotion-application.port.ts). [payment.module.ts](../../../src/module/payment/payment.module.ts) binds `PAYMENT_INITIATION_PORT` to `PaymentService`; [promotion.module.ts](../../../src/module/promotion/promotion.module.ts) binds `PROMOTION_APPLICATION_PORT` to `PromotionService`. [place-order.handler.ts](../../../src/module/ordering/order/commands/place-order.handler.ts) depends on these ports rather than importing concrete Payment or Promotion services. [vnpay.service.ts](../../../src/module/payment/services/vnpay.service.ts) is a pure VNPay adapter. [cloudinary.provider.ts](../../../src/module/image/cloudinary.provider.ts) and Notification channel providers wrap external delivery systems behind module-owned adapter interfaces.

The ADD Flexibility and Interoperability constraints require payment providers, notification providers, and external integrations to change without rewriting checkout or domain logic. The Utility Tree also calls for provider abstraction for payment evolution and multi-channel notification delivery.

The architecture issue is how domain workflows can use external and cross-context capabilities without becoming coupled to implementation details.

## Candidate Solutions

### Option A — Direct Provider SDK Imports in Business Logic

Description

Ordering, Catalog, and Notification services directly import SDKs or concrete services such as VNPay, Cloudinary, Firebase, Nodemailer, PaymentService, or PromotionService.

Pros

- Very direct and quick to implement.
- Fewer interfaces and DI tokens.
- Easy to trace for one integration.

Cons

- Business logic becomes coupled to provider protocols.
- Testing requires provider-specific stubs at many call sites.
- Replacing providers or changing cross-BC contracts forces changes in core workflows.

Trade-offs

- This option reduces indirection but sacrifices flexibility, testability, and boundary integrity.

### Option B — Shared Integration Services

Description

Create shared services such as PaymentGatewayService, StorageService, or NotificationProviderService and inject them wherever needed.

Pros

- Centralizes provider code.
- Reduces duplicate SDK usage.
- Easier than fully defined ports for simple integrations.

Cons

- Shared services can become cross-domain utility hubs with unclear ownership.
- Business contexts may still depend on concrete methods shaped by provider details.
- Harder to express which context owns a capability, especially Payment and Promotion.

Trade-offs

- This option centralizes code but can obscure domain boundaries and create broad shared dependencies.

### Option C — Ports and Adapters

Description

Define ports at domain or shared-contract boundaries and bind concrete adapters in owning modules. Business logic depends on ports; infrastructure and external protocols live behind adapters.

Pros

- Ordering depends on Payment and Promotion capabilities, not concrete implementations.
- VNPay, Cloudinary, email, and push provider details stay at adapter boundaries.
- Tests can substitute ports and providers cleanly.
- Supports provider replacement and contract evolution.

Cons

- Adds interfaces, symbols, provider binding, and module registration rules.
- Poorly named ports can leak provider-specific vocabulary.
- Requires architecture review to keep ports stable and cohesive.

Trade-offs

- This option adds modest design overhead to protect business workflows from infrastructure change.

## Decision

Selected solution:

Use Ports and Adapters for cross-context and external integrations. Business modules depend on ports and provider interfaces; owning modules bind concrete implementations and external SDK adapters.

## Rationale

Ports and Adapters is selected because it is already the integration style used by the core checkout path. Ordering calls `PAYMENT_INITIATION_PORT` and `PROMOTION_APPLICATION_PORT`; Payment and Promotion provide the concrete implementations. VNPay signing and verification stay in `VNPayService`, Cloudinary configuration stays in the Image module provider, and Notification channel providers hide SMTP/FCM details behind channel abstractions.

Direct provider imports are rejected because they would couple core use cases to infrastructure protocols and weaken testability. Shared integration services are rejected as the primary pattern because they blur ownership between contexts and can become generic utility hubs.

This decision supports ADD Flexibility, Interoperability, Testability, and Maintainability; ASR AD-1, AD-2, AD-3, and AD-9; BR-4 online payment behavior; and the Vision goal of integrated online payments and real-time customer communication.

## Consequences

Positive:

- Checkout remains decoupled from concrete Payment and Promotion services.
- External provider code is isolated in adapter modules.
- Provider substitution and test doubles are straightforward.

Negative:

- DI token registration order matters for global ports.
- Interfaces must be curated so they do not expose provider-specific details unnecessarily.
- More files are required than direct service imports.

Future impact:

- New payment, storage, email, push, or promotion engines can be introduced by adding adapters or refining ports while preserving the core workflow contracts.

# ADR-008 — Adopt Drizzle Type-safe Persistence Layer

## Status

Accepted

## Problem / Context

The backend needs a persistence layer for PostgreSQL that supports schema ownership by bounded context, explicit SQL visibility, migrations, type safety, transactional checkout, optimistic locking, indexes, uniqueness constraints, and integration with Better Auth.

The implementation uses `drizzle-orm`, `drizzle-kit`, and `pg` as shown in [package.json](../../../package.json), [drizzle.config.ts](../../../drizzle.config.ts), [drizzle.module.ts](../../../src/drizzle/drizzle.module.ts), and [db.ts](../../../src/drizzle/db.ts). Schemas are defined in TypeScript files inside owning modules, then exported through [schema.ts](../../../src/drizzle/schema.ts). Repositories and handlers use Drizzle query builders, transactions, typed inserts, typed selects, and PostgreSQL constraints. Better Auth is wired through the Drizzle adapter in [auth.ts](../../../src/lib/auth.ts).

The ADD states that Drizzle migrations own schema evolution and that Drizzle parameterization protects database access. The ASR implementation reality identifies a single PostgreSQL database with Drizzle ORM and module-scoped table groups. CI uses `pnpm --filter=api run db:push` against PostgreSQL during validation.

The architecture issue is selecting a persistence technology that keeps SQL clear, domain schemas close to modules, and type safety high without hiding database behavior.

## Candidate Solutions

### Option A — Raw SQL with `pg`

Description

Use handwritten SQL strings and the PostgreSQL driver directly for all queries and migrations.

Pros

- Maximum SQL control and visibility.
- No ORM abstraction overhead.
- Easy to use database-specific features.

Cons

- Manual type mapping is error-prone.
- Refactors can break queries without compile-time feedback.
- Repeated boilerplate for inserts, selects, transactions, and result mapping.

Trade-offs

- This option maximizes control but weakens type safety and developer productivity.

### Option B — Prisma

Description

Use Prisma schema, Prisma Client, and Prisma migrations as the ORM and migration system.

Pros

- Strong generated client experience.
- Productive relational modeling and query API.
- Mature migration workflow and tooling.

Cons

- Prisma schema centralization can pull schema ownership away from module folders.
- Generated abstraction can hide SQL shape more than desired for performance-sensitive paths.
- Some PostgreSQL-specific constructs and custom migration edits can be less direct.

Trade-offs

- This option improves developer ergonomics but reduces SQL transparency and module-local schema ownership.

### Option C — Drizzle ORM and Drizzle Kit

Description

Use Drizzle TypeScript schema definitions, typed query builders, Drizzle Kit migrations, and the PostgreSQL driver.

Pros

- Schema definitions live near owning modules and remain TypeScript-native.
- SQL-like query builder keeps generated SQL understandable.
- Strong typed inserts/selects reduce mapping errors.
- Supports explicit constraints, indexes, enums, transactions, and migration control.
- Works with Better Auth Drizzle adapter.

Cons

- Requires more explicit repository code than high-level ORMs.
- Some advanced migration details may need manual SQL after generation.
- Developers must understand PostgreSQL and Drizzle query semantics.

Trade-offs

- This option balances SQL visibility, type safety, and module ownership while accepting more explicit persistence code.

## Decision

Selected solution:

Adopt Drizzle ORM and Drizzle Kit as the type-safe persistence layer for PostgreSQL.

## Rationale

Drizzle is selected because it aligns with the modular-monolith data ownership model. Each bounded context defines its own schemas in its module folder, while the schema barrel supports Drizzle Kit and Better Auth integration. Drizzle gives enough type safety for repositories and handlers while preserving SQL visibility for performance-sensitive queries, constraints, indexes, optimistic locking, JSONB snapshots, and transaction boundaries.

Raw SQL is rejected because the system has many schemas and repositories where manual result mapping would increase defects. Prisma is rejected because the architecture benefits from TypeScript-native, module-local schema files and explicit SQL-oriented control.

This decision supports ADD Schema Evolution via Drizzle Migrations, ADD Security through parameterized queries, ASR single PostgreSQL with module-scoped table groups, CI database setup, and Business Rules requiring reliable order, payment, promotion, and notification persistence.

## Consequences

Positive:

- Schema ownership stays close to the bounded context that owns the data.
- Type-safe query code reduces persistence mapping mistakes.
- Developers can inspect and control database constraints, indexes, enums, and transactions.

Negative:

- Repository code is more explicit than with a high-level ORM.
- Migration review remains necessary for advanced PostgreSQL details.
- Teams must learn both Drizzle and PostgreSQL behavior.

Future impact:

- Drizzle keeps a clear path for schema evolution, performance tuning, and selective context extraction because database definitions and query intent remain visible in code.