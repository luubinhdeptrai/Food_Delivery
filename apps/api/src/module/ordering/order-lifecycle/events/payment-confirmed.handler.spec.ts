import { CommandBus } from '@nestjs/cqrs';
import { PaymentConfirmedEventHandler } from './payment-confirmed.handler';
import { OrderRepository } from '../repositories/order.repository';
import { PaymentConfirmedEvent } from '@/shared/events/payment-confirmed.event';
import { TransitionOrderCommand } from '../commands/transition-order.command';
import type { Order } from '../../order/order.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    customerId: 'cust-1',
    restaurantId: 'rest-1',
    restaurantName: 'Test Restaurant',
    cartId: 'cart-1',
    status: 'pending',
    paymentMethod: 'vnpay',
    totalAmount: 150000,
    shippingFee: 15000,
    discountAmount: 0,
    deliveryAddress: { street: '1 Main St', district: 'D1', city: 'HCM' },
    note: null,
    expiresAt: new Date(),
    estimatedDeliveryMinutes: null,
    paymentUrl: 'https://pay.vnpay.vn/...',
    shipperId: null,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as Order;
}

function buildHandler() {
  const commandBus = {
    execute: jest.fn().mockResolvedValue(undefined),
  } as unknown as CommandBus;

  const orderRepo = {
    findById: jest.fn(),
  } as unknown as OrderRepository;

  const handler = new PaymentConfirmedEventHandler(commandBus, orderRepo);

  return { handler, commandBus, orderRepo };
}

function makeEvent(
  overrides: Partial<PaymentConfirmedEvent> = {},
): PaymentConfirmedEvent {
  return new PaymentConfirmedEvent(
    overrides.orderId ?? 'order-1',
    overrides.customerId ?? 'cust-1',
    'vnpay',
    overrides.paidAmount ?? 150000,
    overrides.paidAt ?? new Date(),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PaymentConfirmedEventHandler', () => {
  describe('handle', () => {
    it('dispatches TransitionOrderCommand to paid (T-02) for a valid VNPay order', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(makeOrder());

      await handler.handle(makeEvent());

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      const [cmd] = (commandBus.execute as jest.Mock).mock.calls[0] as [
        TransitionOrderCommand,
      ];
      expect(cmd).toBeInstanceOf(TransitionOrderCommand);
      expect(cmd.orderId).toBe('order-1');
      expect(cmd.toStatus).toBe('paid');
      expect(cmd.actorRole).toBe('system');
    });

    it('discards the event when order is not found', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(null);

      await handler.handle(makeEvent());

      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('discards the event when order is a COD order (not vnpay)', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(
        makeOrder({ paymentMethod: 'cod' }),
      );

      await handler.handle(makeEvent());

      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('discards the event when paidAmount does not match order total (epsilon > 0.01)', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(
        makeOrder({ totalAmount: 150000 }),
      );

      // paidAmount differs by 100, well beyond epsilon 0.01
      await handler.handle(makeEvent({ paidAmount: 150100 }));

      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('accepts paidAmount that matches order total within epsilon', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(
        makeOrder({ totalAmount: 150000 }),
      );

      // Exact match — well within epsilon
      await handler.handle(makeEvent({ paidAmount: 150000 }));

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('does not rethrow when commandBus.execute throws', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(makeOrder());
      (commandBus.execute as jest.Mock).mockRejectedValue(
        new Error('Invalid transition'),
      );

      await expect(handler.handle(makeEvent())).resolves.toBeUndefined();
    });

    it('uses actorId=null for system-initiated transition', async () => {
      const { handler, commandBus, orderRepo } = buildHandler();
      (orderRepo.findById as jest.Mock).mockResolvedValue(makeOrder());

      await handler.handle(makeEvent());

      const [cmd] = (commandBus.execute as jest.Mock).mock.calls[0] as [
        TransitionOrderCommand,
      ];
      expect(cmd.actorId).toBeNull();
    });
  });
});
