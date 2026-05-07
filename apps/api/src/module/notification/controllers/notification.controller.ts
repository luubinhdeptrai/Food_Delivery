import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { NotificationService } from '../services/notification.service';
import {
  MarkAllReadResponseDto,
  MarkReadResponseDto,
  NotificationInboxQueryDto,
  NotificationInboxResponseDto,
  UnreadCountResponseDto,
} from '../dto/notification.dto';

/**
 * NotificationController
 *
 * Exposes the Phase N-3 in-app notification inbox REST API.
 *
 * All routes are protected by the Better Auth session guard — the `@Session()`
 * decorator verifies the Bearer token and populates `session.user.id`.
 *
 * Routes:
 *  GET  /notifications/my            — paginated inbox (filters: unreadOnly, type)
 *  GET  /notifications/my/unread-count — cached unread badge count
 *  PATCH /notifications/my/read-all  — bulk mark all as read
 *  PATCH /notifications/:id/read     — mark single notification as read
 *
 * Route ordering note:
 *  The static sub-paths `my/unread-count` and `my/read-all` are registered
 *  BEFORE the parameterised `:id/read` route. NestJS prioritises static
 *  segments over parameterised ones, preventing the literal string `my` from
 *  being treated as a UUID parameter.
 *
 * Phase: N-3 — Notification Persistence + In-App Inbox
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ---------------------------------------------------------------------------
  // GET /notifications/my
  // ---------------------------------------------------------------------------

  /**
   * Return a paginated page of the caller's in-app notification inbox.
   *
   * Query parameters:
   *  - unreadOnly (boolean, default: false) — filter to unread only
   *  - type (NotificationType)              — filter by notification type
   *  - limit (1–100, default: 20)           — page size
   *  - offset (≥ 0, default: 0)            — pagination offset
   *
   * The `unreadCount` field in the response reflects the caller's total
   * unread count (from Redis cache or DB fallback) — not just for this page.
   */
  @Get('my')
  @ApiOperation({
    summary: "Get current user's in-app notification inbox (paginated)",
  })
  @ApiOkResponse({ type: NotificationInboxResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getInbox(
    @Session() session: UserSession,
    @Query() query: NotificationInboxQueryDto,
  ): Promise<NotificationInboxResponseDto> {
    return this.notificationService.getInbox(session.user.id, query);
  }

  // ---------------------------------------------------------------------------
  // GET /notifications/my/unread-count
  // ---------------------------------------------------------------------------

  /**
   * Return the total unread in-app notification count for the current user.
   *
   * Redis-cached (TTL: 5 minutes). Invalidated immediately on any write
   * operation (markRead, markAllRead, new notification received).
   *
   * Lightweight endpoint intended for polling or badge refresh without
   * fetching the full inbox.
   */
  @Get('my/unread-count')
  @ApiOperation({
    summary: "Get current user's total unread notification count (cached)",
  })
  @ApiOkResponse({ type: UnreadCountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getUnreadCount(
    @Session() session: UserSession,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationService.getUnreadCount(session.user.id);
    return { count };
  }

  // ---------------------------------------------------------------------------
  // PATCH /notifications/my/read-all
  // ---------------------------------------------------------------------------

  /**
   * Mark all of the caller's unread in-app notifications as read.
   *
   * Idempotent: safe to call when there are no unread notifications
   * (returns count = 0).
   *
   * After the bulk update:
   *  - Redis unread cache is invalidated.
   *  - A `notification.read` WS event (`{ all: true }`) is emitted to the
   *    caller's room so that all open tabs clear their unread indicators.
   */
  @Patch('my/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Mark all current user's unread notifications as read",
  })
  @ApiOkResponse({ type: MarkAllReadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async markAllRead(
    @Session() session: UserSession,
  ): Promise<MarkAllReadResponseDto> {
    const count = await this.notificationService.markAllRead(session.user.id);
    return { count };
  }

  // ---------------------------------------------------------------------------
  // PATCH /notifications/:id/read
  // NOTE: defined AFTER the static /my/** routes to avoid `:id` capturing `my`
  // ---------------------------------------------------------------------------

  /**
   * Mark a single notification as read.
   *
   * Ownership is enforced at the DB level — a notification belonging to
   * another user returns `{ success: false }` without revealing whether the
   * notification exists (no 404 leakage).
   *
   * Idempotent: calling this on an already-read notification returns
   * `{ success: true }` if the row exists (the DB mark-read is a no-op
   * when `is_read` is already true — the WHERE clause filters on ownership,
   * not on read state).
   *
   * After a successful mark-read:
   *  - Redis unread cache is invalidated.
   *  - A `notification.read` WS event is emitted so other open tabs update.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a single notification as read (idempotent)' })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    format: 'uuid',
  })
  @ApiOkResponse({ type: MarkReadResponseDto })
  @ApiNotFoundResponse({
    description:
      'Notification not found or does not belong to the current user',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async markRead(
    @Session() session: UserSession,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkReadResponseDto> {
    const success = await this.notificationService.markRead(
      session.user.id,
      id,
    );
    return { success };
  }
}
