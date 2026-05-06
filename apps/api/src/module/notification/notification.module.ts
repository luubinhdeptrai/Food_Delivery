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

// Event Handlers
import { OrderPlacedNotificationHandler } from './events/order-placed.handler';
import { OrderStatusChangedNotificationHandler } from './events/order-status-changed.handler';
import { PaymentConfirmedNotificationHandler } from './events/payment-confirmed.handler';
import { PaymentFailedNotificationHandler } from './events/payment-failed.handler';
import { OrderCancelledAfterPaymentNotificationHandler } from './events/order-cancelled-after-payment.handler';

/**
 * NotificationModule — Phase N-1 Foundation
 *
 * Implements the Notification BC as a non-global NestJS module.
 * NOT @Global() — imported explicitly in AppModule.
 *
 * Responsibilities in Phase N-1:
 *  - Define all Drizzle-managed DB tables (5 tables via schema files)
 *  - Register ACL projector for RestaurantUpdatedEvent → snapshot table
 *  - Register event handlers for all upstream domain events
 *  - Persist notification rows to DB on every event (no delivery yet)
 *
 * Phase N-2+: WebSocket gateway + in-app real-time delivery
 * Phase N-4:  Firebase Cloud Messaging push delivery
 * Phase N-5:  SMTP email delivery, cleanup cron
 * Phase N-6:  Retry worker, dead-letter queue
 *
 * CqrsModule import is required: @EventsHandler-decorated classes only
 * register with the EventBus if CqrsModule is imported in the same module
 * (NestJS CQRS DI scoping rule).
 *
 * DatabaseModule provides DB_CONNECTION (Drizzle NodePgDatabase) to all
 * repositories and the ACL repository.
 *
 * No exports — Phase N-1 has no services consumed by other modules.
 * NotificationService will be exported starting Phase N-3 (REST controller).
 */
@Module({
  imports: [CqrsModule, DatabaseModule],
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
