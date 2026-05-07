import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '@/drizzle/drizzle.module';

// ACL
import { NotificationRestaurantAclRepository } from './acl/notification-restaurant-acl.repository';
import { NotificationRestaurantSnapshotProjector } from './acl/notification-restaurant-snapshot.projector';

// Repositories
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { DeviceTokenRepository } from './repositories/device-token.repository';
import { NotificationDeliveryLogRepository } from './repositories/notification-delivery-log.repository';

// Services
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationService } from './services/notification.service';

// Gateway
import { NotificationGateway } from './gateway/notification.gateway';

// Controller (Phase N-3)
import { NotificationController } from './controllers/notification.controller';

// Event Handlers
import { OrderPlacedNotificationHandler } from './events/order-placed.handler';
import { OrderStatusChangedNotificationHandler } from './events/order-status-changed.handler';
import { PaymentConfirmedNotificationHandler } from './events/payment-confirmed.handler';
import { PaymentFailedNotificationHandler } from './events/payment-failed.handler';
import { OrderCancelledAfterPaymentNotificationHandler } from './events/order-cancelled-after-payment.handler';

/**
 * NotificationModule — Phase N-3 Notification Inbox REST API
 *
 * Implements the Notification BC as a non-global NestJS module.
 * NOT @Global() — imported explicitly in AppModule.
 *
 * Phase N-3 additions over N-2:
 *  - NotificationController: 4 REST endpoints for the in-app inbox.
 *    GET  /api/notifications/my            — paginated inbox
 *    GET  /api/notifications/my/unread-count — cached badge count
 *    PATCH /api/notifications/my/read-all  — bulk mark all as read
 *    PATCH /api/notifications/:id/read     — mark single notification as read
 *  - NotificationService: getInbox, getUnreadCount, markRead, markAllRead
 *    with Redis unread count caching (key: `unread:{userId}`, TTL: 5 min).
 *  - RedisService (from global RedisModule) injected into NotificationService
 *    for unread count cache management.
 *
 * Phase N-2 additions over N-1:
 *  - NotificationGateway: Socket.IO WebSocket gateway on the /notifications
 *    namespace. Authenticates connections via Better Auth session (same
 *    mechanism as HTTP guards). Per-user rooms + Redis presence tracking.
 *  - NotificationService now injects NotificationGateway to push real-time
 *    'notification:new' events to connected in_app channel recipients.
 *
 * Phase N-4:  Firebase Cloud Messaging push delivery
 * Phase N-5:  SMTP email delivery, cleanup cron
 * Phase N-6:  Retry worker, dead-letter queue, Socket.IO Redis adapter
 *
 * CqrsModule import is required: @EventsHandler-decorated classes only
 * register with the EventBus if CqrsModule is imported in the same module.
 *
 * DatabaseModule provides DB_CONNECTION to all repositories.
 *
 * ScheduleModule.forRoot() is imported in AppModule — @Interval on
 * NotificationGateway.logConnectionMetrics() works without re-importing
 * ScheduleModule here.
 *
 * RedisModule is @Global() — RedisService is available without importing
 * RedisModule explicitly here.
 *
 * No exports — NotificationService has no port consumed by other modules.
 */
@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [
    // Phase N-3: inbox REST API
    NotificationController,
  ],
  providers: [
    // --- ACL ---
    NotificationRestaurantAclRepository,
    NotificationRestaurantSnapshotProjector,

    // --- Repositories ---
    NotificationRepository,
    NotificationPreferenceRepository,
    DeviceTokenRepository,
    NotificationDeliveryLogRepository,

    // --- Services ---
    NotificationTemplateService,
    NotificationService,

    // --- Gateway (Phase N-2) ---
    NotificationGateway,

    // --- Event Handlers ---
    OrderPlacedNotificationHandler,
    OrderStatusChangedNotificationHandler,
    PaymentConfirmedNotificationHandler,
    PaymentFailedNotificationHandler,
    OrderCancelledAfterPaymentNotificationHandler,
  ],
  exports: [],
})
export class NotificationModule {}
