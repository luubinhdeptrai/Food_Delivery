import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from '@/drizzle/drizzle.constants';
import * as schema from '@/drizzle/schema';
import {
  notifications,
  type NewNotification,
  type Notification,
  type NotificationStatus,
} from '../domain/notification.schema';

/**
 * NotificationRepository
 *
 * Read/write access to `notifications`.
 * One row per notification per recipient per channel.
 *
 * Idempotency is enforced at the DB level via the UNIQUE constraint on
 * `idempotency_key`. Callers must use INSERT … ON CONFLICT DO NOTHING.
 *
 * Phase: N-1 — Foundation
 */
@Injectable()
export class NotificationRepository {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Insert a new notification row.
   * Returns null when an identical idempotency key already exists
   * (duplicate event — safe to ignore).
   */
  async insertIfNotExists(data: NewNotification): Promise<Notification | null> {
    const result = await this.db
      .insert(notifications)
      .values(data)
      .onConflictDoNothing({ target: notifications.idempotencyKey })
      .returning();
    return result[0] ?? null;
  }

  /**
   * Fetch one page of a user's in-app inbox, newest first.
   * Used by the inbox REST endpoint (Phase N-3).
   */
  async findInboxByUserId(
    recipientId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    return this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.channel, 'in_app'),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Count unread in-app notifications for a user.
   * Uses the `notif_recipient_unread_idx` partial index.
   * Returns a DB-level COUNT aggregate — no rows are loaded into memory.
   */
  async countUnread(recipientId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.channel, 'in_app'),
          eq(notifications.isRead, false),
        ),
      );
    return result[0]?.count ?? 0;
  }

  /**
   * Mark a single notification as read.
   */
  async markRead(
    notificationId: string,
    recipientId: string,
  ): Promise<Notification | null> {
    const result = await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date(), status: 'read' })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, recipientId),
        ),
      )
      .returning();
    return result[0] ?? null;
  }

  /**
   * Bulk mark all unread in-app notifications as read for a user.
   * Called from the "Mark all as read" inbox action.
   */
  async markAllRead(recipientId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date(), status: 'read' })
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.channel, 'in_app'),
          eq(notifications.isRead, false),
        ),
      );
  }

  /**
   * Update the delivery status of a notification.
   * Used by PushService (Phase N-4) after FCM delivery.
   */
  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    extra?: Partial<Pick<Notification, 'sentAt' | 'lastAttemptAt' | 'nextRetryAt' | 'deliveryAttempts'>>,
  ): Promise<void> {
    await this.db
      .update(notifications)
      .set({ status, ...extra })
      .where(eq(notifications.id, notificationId));
  }
}
