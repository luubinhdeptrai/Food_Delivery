import { Injectable, Logger } from '@nestjs/common';
import {
  type NotificationType,
  type NotificationChannel,
} from '../domain/notification.schema';
import {
  DEFAULT_PREFERENCES,
} from '../domain/notification-preference.schema';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { NotificationTemplateService } from './notification-template.service';

// ---------------------------------------------------------------------------
// Input type for sendFromEvent
// ---------------------------------------------------------------------------
export interface SendFromEventParams {
  /** Notification type — determines template + routing */
  type: NotificationType;
  /** IAM userId of the recipient */
  recipientId: string;
  /** Role string stored on the notification row (for admin queries) */
  recipientRole: string;
  /**
   * Source entity ID used to derive the idempotency key.
   * For order events: orderId.
   * For payment events: orderId (the payment row is linked by orderId).
   */
  sourceId: string;
  /** Template interpolation variables (all values must be strings) */
  templateData: Record<string, string>;
  /** Channels to attempt delivery on */
  channels: NotificationChannel[];
  /** Optional — stored on the notification row for admin queries */
  orderId?: string;
}

// ---------------------------------------------------------------------------
// NotificationService
//
// Phase N-1 behaviour:
//   sendFromEvent() resolves the recipient's preferences, checks opt-outs,
//   renders templates, and persists one notification row per channel to
//   `notifications`. No external delivery (push, email, WebSocket) is
//   performed — those are implemented in later phases.
//
// Phase N-2+: this service will be extended to dispatch push (FCM),
//   email (SMTP), and in-app (WebSocket) delivery after persistence.
//
// Architecture decisions:
//  - NEVER throw from sendFromEvent — it is called from @EventsHandler.
//    Exceptions are caught, logged, and swallowed here.
//  - Idempotency key format: notif:{type}:{sourceId}:{recipientId}:{channel}
//    DB UNIQUE constraint enforces at-most-once persistence per key.
//    ON CONFLICT DO NOTHING in NotificationRepository.insertIfNotExists().
//
// Phase: N-1 — Foundation
// ---------------------------------------------------------------------------
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly preferenceRepo: NotificationPreferenceRepository,
    private readonly templateService: NotificationTemplateService,
  ) {}

  /**
   * Persist one notification row per requested channel after verifying
   * recipient opt-in preferences.
   *
   * Returns the count of rows successfully persisted (0 when all channels
   * are filtered out by preferences or all rows already existed).
   */
  async sendFromEvent(params: SendFromEventParams): Promise<number> {
    const {
      type,
      recipientId,
      recipientRole,
      sourceId,
      templateData,
      channels,
      orderId,
    } = params;

    try {
      // 1. Load preferences (fall back to defaults when no row exists)
      const prefs =
        (await this.preferenceRepo.findByUserId(recipientId)) ??
        DEFAULT_PREFERENCES;

      // 2. Filter to opted-in channels
      const enabledChannels = channels.filter((ch) =>
        this.isChannelEnabled(prefs, type, ch),
      );

      if (enabledChannels.length === 0) {
        this.logger.debug(
          `[Notification] All channels filtered by preferences for user=${recipientId} type=${type}`,
        );
        return 0;
      }

      // 3. Render template (compute once for all channels)
      const { title, body } = this.templateService.render(type, templateData);

      // 4. Persist one row per enabled channel (idempotent via ON CONFLICT DO NOTHING)
      let persisted = 0;
      for (const channel of enabledChannels) {
        const idempotencyKey = `notif:${type}:${sourceId}:${recipientId}:${channel}`;

        // Expiry: 90 days from now for in_app; no expiry for audit channels
        const expiresAt =
          channel === 'in_app'
            ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            : null;

        const row = await this.notificationRepo.insertIfNotExists({
          recipientId,
          recipientRole,
          type,
          channel,
          title,
          body,
          data: templateData,
          status: 'pending',
          isRead: false,
          orderId: orderId ?? null,
          idempotencyKey,
          deliveryAttempts: 0,
          expiresAt,
        });

        if (row) {
          persisted++;
          this.logger.debug(
            `[Notification] Persisted ${channel} notification id=${row.id} type=${type} recipient=${recipientId}`,
          );
          // Phase N-2+: dispatch push / WebSocket / email delivery here.
        } else {
          this.logger.debug(
            `[Notification] Skipped duplicate: idempotencyKey=${idempotencyKey}`,
          );
        }
      }

      return persisted;
    } catch (err) {
      // NEVER propagate — event handlers must not fail upstream transactions
      this.logger.error(
        `[Notification] sendFromEvent failed for type=${type} recipient=${recipientId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      return 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Preference helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns true when the channel is enabled AND the notification type is
   * not muted by the user.
   *
   * Admin-originated and system types bypass mute/quiet-hours checks (D-N7):
   * critical operational notifications must always reach the recipient.
   */
  private isChannelEnabled(
    prefs: typeof DEFAULT_PREFERENCES,
    type: NotificationType,
    channel: NotificationChannel,
  ): boolean {
    const isAdminOrSystem =
      type === 'system_announcement' || type === 'new_order_received';

    // Check per-channel opt-in
    const channelEnabled = {
      in_app: prefs.inAppEnabled,
      push: prefs.pushEnabled,
      email: prefs.emailEnabled,
      sms: prefs.smsEnabled,
    }[channel];

    if (!channelEnabled) return false;

    // System/admin types bypass mute lists
    if (isAdminOrSystem) return true;

    // Check muted types
    if (prefs.mutedTypes?.includes(type)) return false;

    return true;
  }
}
