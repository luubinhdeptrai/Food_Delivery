# Project Issues & Architectural Debt

This file tracks identified bugs, edge cases, and architectural gaps that need to be addressed.

---

## 1. The "Late Payment" Trap (Zombie Payments)

**Status:** Open 🔴
**Priority:** High
**Context:** Ordering BC / Payment BC Integration
**Impact:** Financial inconsistency, customer trust.

### Problem
When a customer's VNPay payment takes too long to process, the `OrderTimeoutTask` (Ordering BC) may fire and cancel the order (`pending → cancelled`) before the payment confirmation arrives.

When the `PaymentConfirmedEvent` finally arrives:
1. `PaymentConfirmedEventHandler` attempts to transition the order from `cancelled` to `paid`.
2. The state machine rejects this transition (`ALLOWED_TRANSITIONS['cancelled'] = []`).
3. The handler logs an error and discards the event.

**Result:** The customer is charged, but the order is dead, and no refund is initiated because the payment confirmation arrived after the terminal state was reached.

### Proposed Solutions
- **Option A (Automated Refund):** Update `PaymentConfirmedEventHandler` to check if the order is already `cancelled`. If it is, immediately publish an `OrderCancelledAfterPaymentEvent` to trigger an automated refund in the Payment BC.
- **Option B (Manual Intervention Alert):** Publish a `LatePaymentAlertEvent` that notifies admins to manually resolve the discrepancy and initiate a refund.
- **Option C (State Machine Adjustment):** Allow a transition from `cancelled` to a special `cancelled_paid` state that triggers a refund flow, though this complicates the state machine.

### Recommended Action
Implement **Option A**. The system should be resilient enough to handle asynchronous race conditions between payment gateways and internal timeout crons without manual intervention.

---

## 2. Price Drift (Cart Integrity)

**Status:** Open 🔴
**Priority:** Medium
**Context:** Ordering BC / Checkout Flow
**Impact:** Customer trust, negative reviews (silent price increases).

### Problem
The `PlaceOrderHandler` uses ACL snapshots as the authoritative source for prices at checkout. If a restaurant updates a price after a customer has added an item to their cart but before they click "Checkout," the customer is currently **silently charged the new (potentially higher) price**.

### Proposed Solutions
- **Option A (Strict Rejection):** Compare the computed total at checkout (using ACL prices) against the total stored in the Redis cart. If the total has increased, throw a `409 Conflict` and prompt the user to refresh their cart.
- **Option B (Price Guarantee):** Honor the price at the time of "Add to Cart" for a short window (e.g., 30 minutes). This is complex to implement as it requires the Ordering BC to track temporary price overrides.
- **Option C (Tolerance Threshold):** Allow small increases (e.g., < 1%) but block and notify for larger changes.

### Recommended Action
Implement **Option A**. It is the most transparent and simplest approach. "Silent" increases should be avoided at all costs.
