import type { NotificationType } from '../domain/notification.schema';

// ---------------------------------------------------------------------------
// WebSocket event name constants
//
// All Server→Client and Client→Server event names are defined here as typed
// string constants. Import and use these instead of bare string literals to
// prevent silent event name mismatches between backend and frontend.
// ---------------------------------------------------------------------------

/** Emitted server→client when a new notification row is persisted. */
export const WS_NOTIFICATION_CREATED = 'notification.created' as const;

/** Emitted server→client when a notification is marked read on another device. */
export const WS_NOTIFICATION_READ = 'notification.read' as const;

/** Emitted server→client when the Better Auth session expires. */
export const WS_AUTH_EXPIRED = 'auth:expired' as const;

/**
 * Emitted server→client immediately after a socket successfully joins its
 * per-user room. Serves as both a UX confirmation and a diagnostic probe:
 * if the client receives this event, room join, namespace routing, and
 * emit path are all confirmed working.
 */
export const WS_CONNECTION_ESTABLISHED = 'connection:established' as const;

/** Emitted client→server as a heartbeat to refresh the Redis presence TTL. */
export const WS_NOTIFICATION_PING = 'notification:ping' as const;

// ---------------------------------------------------------------------------
// NotificationPayload
//
// The canonical shape emitted over WebSocket as the 'notification.created'
// event. The client SDK should parse and display this payload directly — no
// further transformation required on the client side.
//
// All timestamp fields are ISO 8601 strings so they can be safely serialised
// over JSON without loss of precision (unlike Date objects).
//
// Phase: N-2 — Real-time WebSocket Gateway
// ---------------------------------------------------------------------------
export interface NotificationPayload {
  /** UUID of the notification row in the `notifications` table */
  id: string;
  /** Notification type — determines icon, colour, and deep-link on client */
  type: NotificationType;
  /** Short, localised notification title (from NotificationTemplateService) */
  title: string;
  /** Full, localised notification body (from NotificationTemplateService) */
  body: string;
  /**
   * Key-value template data used to render the notification.
   * Passed through to the client for potential client-side re-rendering.
   */
  data?: Record<string, string>;
  /** The order this notification is associated with (when applicable) */
  orderId?: string;
  /** ISO 8601 creation timestamp — used by clients to sort / deduplicate */
  createdAt: string;
  /** Always false on first delivery — updated to true via notification:read event */
  isRead: boolean;
  /** ISO 8601 timestamp when the user read this notification (undefined = unread) */
  readAt?: string;
}

// ---------------------------------------------------------------------------
// WebSocket event contracts (documentation — not enforced at runtime)
//
// Server → Client (ServerToClientEvents):
//   WS_CONNECTION_ESTABLISHED  ('connection:established')
//     payload: { userId, room, connectedAt }  — sent on successful room join
//   WS_NOTIFICATION_CREATED    ('notification.created')
//     payload: NotificationPayload            — new notification row persisted
//   WS_NOTIFICATION_READ       ('notification.read')
//     payload: { id: string }                 — read on another device (sync)
//   WS_AUTH_EXPIRED            ('auth:expired')
//     payload: none                           — session expired, must reconnect
//
// Client → Server (ClientToServerEvents):
//   WS_NOTIFICATION_PING  ('notification:ping')  — heartbeat, refreshes presence TTL
// ---------------------------------------------------------------------------
