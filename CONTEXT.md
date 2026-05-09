# Food Delivery Platform — Domain Context

This document defines the canonical language and architectural rules for the project.

---

## Glossary

### Ordering
- **Order:** The core aggregate root representing a customer's request for food.
- **Order Status:** One of 10 states (PENDING, PAID, CONFIRMED, PREPARING, READY_FOR_PICKUP, PICKED_UP, DELIVERING, DELIVERED, CANCELLED, REFUNDED).
- **Cart:** A transient collection of menu items from a single restaurant, stored in Redis before checkout.

### Restaurant Catalog
- **Restaurant:** A provider of food services with a menu and delivery zones.
- **Menu Item:** A specific dish or drink available for purchase.
- **Modifier:** A customisation option for a Menu Item (e.g., "Extra Cheese").
- **Delivery Zone:** A geographical area where a restaurant provides delivery, defined by a radius and pricing rules.

### Image Management
- **Image:** A visual asset stored in a 3rd party provider (Cloudinary).
- **Smart Image Module:** A domain-aware module that manages the lifecycle of images by listening to domain events (e.g., `MenuItemDeleted`) to trigger cleanup of orphan assets.

---

## Architectural Rules

1. **Hybrid Communication Strategy:**
   - **Core Domains (Ordering, Notification):** Use **ACL Snapshots** (event-driven mirroring) for stable external data (Restaurants, Menu Items). This ensures high autonomy and protects against cross-context performance impact or data drift.
   - **Support/Generic Contexts (Payment, IAM, Image):** Use the **Public API Port pattern** (Interfaces/Symbols) for real-time request/response communication. This minimizes development overhead while maintaining logical boundaries.
2. **Smart Image Cleanup:** The Image Module is responsible for deleting assets from Cloudinary when their domain owners (Restaurants, Menu Items) are deleted, using an asynchronous event-driven approach.
3. Price Isolation:** When an Order is placed, all prices (items, modifiers, delivery) must be snapshotted into the Order record to protect against future price changes in the Catalog.
4. **Image Ownership & Auth:** The Image Module must use the `@Session()` decorator (from `@thallesp/nestjs-better-auth`) for authentication. Every Image record must store an `ownerId` and `ownerType` to enforce strict ownership verification during deletion or replacement.
5. **Notification Reliability:** Critical notifications (e.g., Order Status changes) must have an automated retry mechanism for transient 3rd-party failures (FCM, SMTP). A "failed" status in the log should trigger a background self-healing task.
6. **Price Drift (Anti-Silent Increases):** The system must prevent silent price increases at checkout. If the authoritative price in the ACL snapshot is higher than the price shown to the user in their cart, the checkout must be rejected with a conflict error.

