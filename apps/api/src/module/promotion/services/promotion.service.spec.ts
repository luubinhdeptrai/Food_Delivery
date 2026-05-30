import { PromotionService } from './promotion.service';
import { PromotionRepository } from '../repositories/promotion.repository';
import { CouponCodeRepository } from '../repositories/coupon-code.repository';
import { PromotionUsageRepository } from '../repositories/promotion-usage.repository';
import type { Promotion } from '../domain/promotion.schema';
import type {
  DiscountPreviewParams,
  DiscountReservationParams,
} from '@/shared/ports/promotion-application.port';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  const now = new Date();
  return {
    id: 'promo-1',
    name: '10% Off',
    description: null,
    type: 'percentage',
    scope: 'restaurant',
    status: 'active',
    trigger: 'auto_apply',
    stackingMode: 'non_stackable',
    restaurantId: 'rest-1',
    discountValue: 10,
    minOrderAmount: null,
    maxDiscountAmount: null,
    maxTotalUses: null,
    currentTotalUses: 0,
    maxUsesPerUser: null,
    requiresApprovedRestaurant: false,
    startsAt: new Date(now.getTime() - 3600_000),
    endsAt: new Date(now.getTime() + 3600_000),
    version: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as unknown as Promotion;
}

function makeCoupon(
  overrides: Partial<{ id: string; promotionId: string; code: string }> = {},
) {
  return {
    id: overrides.id ?? 'coupon-1',
    promotionId: overrides.promotionId ?? 'promo-1',
    code: overrides.code ?? 'SAVE10',
    status: 'active',
    maxUses: null,
    currentUses: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeUsage() {
  return {
    id: 'usage-1',
    promotionId: 'promo-1',
    couponCodeId: null,
    orderId: 'order-1',
    customerId: 'cust-1',
    discountOnItems: 10000,
    discountOnShipping: 0,
    discountAmount: 10000,
    status: 'reserved',
    reservedAt: new Date(),
    confirmedAt: null,
    rolledBackAt: null,
  };
}

function buildService() {
  const promotionRepo = {
    findActiveAutoApplyForRestaurant: jest.fn().mockResolvedValue([]),
    findActiveCouponPromotionForRestaurant: jest.fn().mockResolvedValue(null),
    findPublicActive: jest.fn().mockResolvedValue([]),
    atomicIncrementUses: jest.fn().mockResolvedValue(true),
    decrementUses: jest.fn().mockResolvedValue(undefined),
  } as unknown as PromotionRepository;

  const couponRepo = {
    findActiveByCode: jest.fn().mockResolvedValue(null),
    atomicIncrementUses: jest.fn().mockResolvedValue(true),
    decrementUses: jest.fn().mockResolvedValue(undefined),
    checkAndMarkExhausted: jest.fn().mockResolvedValue(undefined),
  } as unknown as CouponCodeRepository;

  const usageRepo = {
    countActiveUsagesByCustomer: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue(makeUsage()),
    confirmByOrderId: jest.fn().mockResolvedValue(undefined),
    rollbackByOrderId: jest.fn().mockResolvedValue([]),
  } as unknown as PromotionUsageRepository;

  const service = new PromotionService(promotionRepo, couponRepo, usageRepo);

  return { service, promotionRepo, couponRepo, usageRepo };
}

function makePreviewParams(
  overrides: Partial<DiscountPreviewParams> = {},
): DiscountPreviewParams {
  return {
    customerId: 'cust-1',
    restaurantId: 'rest-1',
    items: [],
    itemsSubtotal: 100000,
    shippingFee: 15000,
    couponCode: undefined,
    ...overrides,
  };
}

function makeReservationParams(
  overrides: Partial<DiscountReservationParams> = {},
): DiscountReservationParams {
  return {
    customerId: 'cust-1',
    restaurantId: 'rest-1',
    items: [],
    itemsSubtotal: 100000,
    shippingFee: 15000,
    couponCode: undefined,
    tempOrderId: 'order-temp-1',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PromotionService', () => {
  // -------------------------------------------------------------------------
  // previewDiscount
  // -------------------------------------------------------------------------
  describe('previewDiscount', () => {
    describe('auto-apply branch', () => {
      it('returns applicable=false when no promotions exist', async () => {
        const { service } = buildService();

        const result = await service.previewDiscount(makePreviewParams());

        expect(result.applicable).toBe(false);
        expect(result.discountAmount).toBe(0);
      });

      it('returns applicable=true and discount for an eligible auto-apply promotion', async () => {
        const { service, promotionRepo } = buildService();
        (
          promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
        ).mockResolvedValue([
          makePromotion(), // 10% off, no min-order
        ]);

        const result = await service.previewDiscount(
          makePreviewParams({ itemsSubtotal: 100000 }),
        );

        expect(result.applicable).toBe(true);
        expect(result.discountAmount).toBeGreaterThan(0);
        expect(result.promotionId).toBe('promo-1');
      });

      it('skips promotions where per-user quota is exhausted', async () => {
        const { service, promotionRepo, usageRepo } = buildService();
        (
          promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
        ).mockResolvedValue([makePromotion({ maxUsesPerUser: 1 })]);
        (usageRepo.countActiveUsagesByCustomer as jest.Mock).mockResolvedValue(
          1,
        );

        const result = await service.previewDiscount(makePreviewParams());

        expect(result.applicable).toBe(false);
      });
    });

    describe('coupon code branch', () => {
      it('returns applicable=false when coupon code is not found', async () => {
        const { service } = buildService();

        const result = await service.previewDiscount(
          makePreviewParams({ couponCode: 'NONEXISTENT' }),
        );

        expect(result.applicable).toBe(false);
        expect(result.reason).toMatch(/not found/i);
      });

      it('returns applicable=false when promotion for coupon is unavailable', async () => {
        const { service, couponRepo } = buildService();
        (couponRepo.findActiveByCode as jest.Mock).mockResolvedValue(
          makeCoupon(),
        );
        // promotion not found

        const result = await service.previewDiscount(
          makePreviewParams({ couponCode: 'SAVE10' }),
        );

        expect(result.applicable).toBe(false);
      });

      it('returns applicable=true for a valid coupon with an eligible promotion', async () => {
        const { service, couponRepo, promotionRepo } = buildService();
        (couponRepo.findActiveByCode as jest.Mock).mockResolvedValue(
          makeCoupon(),
        );
        (
          promotionRepo.findActiveCouponPromotionForRestaurant as jest.Mock
        ).mockResolvedValue(makePromotion({ trigger: 'coupon_code' }));

        const result = await service.previewDiscount(
          makePreviewParams({ couponCode: 'SAVE10', itemsSubtotal: 100000 }),
        );

        expect(result.applicable).toBe(true);
        expect(result.couponCodeId).toBe('coupon-1');
      });

      it('normalizes coupon code to uppercase before lookup', async () => {
        const { service, couponRepo, promotionRepo } = buildService();
        (couponRepo.findActiveByCode as jest.Mock).mockResolvedValue(
          makeCoupon(),
        );
        (
          promotionRepo.findActiveCouponPromotionForRestaurant as jest.Mock
        ).mockResolvedValue(makePromotion());

        await service.previewDiscount(
          makePreviewParams({ couponCode: 'save10' }),
        );

        const [code] = (couponRepo.findActiveByCode as jest.Mock).mock.calls[0];
        expect(code).toBe('SAVE10');
      });
    });
  });

  // -------------------------------------------------------------------------
  // computeAndReserveDiscount
  // -------------------------------------------------------------------------
  describe('computeAndReserveDiscount', () => {
    it('returns reserved=false when no promotion found', async () => {
      const { service } = buildService();

      const result = await service.computeAndReserveDiscount(
        makeReservationParams(),
      );

      expect(result.reserved).toBe(false);
      expect(result.discountAmount).toBe(0);
    });

    it('returns reserved=false when coupon code is not found', async () => {
      const { service } = buildService();

      const result = await service.computeAndReserveDiscount(
        makeReservationParams({ couponCode: 'DOESNOTEXIST' }),
      );

      expect(result.reserved).toBe(false);
    });

    it('reserves discount and returns usageId for eligible auto-apply', async () => {
      const { service, promotionRepo } = buildService();
      (
        promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
      ).mockResolvedValue([makePromotion()]);

      const result = await service.computeAndReserveDiscount(
        makeReservationParams({ itemsSubtotal: 100000 }),
      );

      expect(result.reserved).toBe(true);
      expect(result.usageId).toBe('usage-1');
      expect(result.discountAmount).toBeGreaterThan(0);
    });

    it('returns reserved=false when quota is exhausted (atomicIncrementUses returns false)', async () => {
      const { service, promotionRepo } = buildService();
      (
        promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
      ).mockResolvedValue([makePromotion()]);
      (promotionRepo.atomicIncrementUses as jest.Mock).mockResolvedValue(false);

      const result = await service.computeAndReserveDiscount(
        makeReservationParams({ itemsSubtotal: 100000 }),
      );

      expect(result.reserved).toBe(false);
      expect(result.reason).toMatch(/quota exhausted/i);
    });

    it('returns reserved=false when per-user quota is exhausted', async () => {
      const { service, promotionRepo, usageRepo } = buildService();
      (
        promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
      ).mockResolvedValue([makePromotion({ maxUsesPerUser: 1 })]);
      (usageRepo.countActiveUsagesByCustomer as jest.Mock).mockResolvedValue(1);

      const result = await service.computeAndReserveDiscount(
        makeReservationParams({ itemsSubtotal: 100000 }),
      );

      expect(result.reserved).toBe(false);
    });

    it('increments promotion uses before inserting usage row', async () => {
      const { service, promotionRepo, usageRepo } = buildService();
      (
        promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
      ).mockResolvedValue([makePromotion()]);
      const callOrder: string[] = [];
      (promotionRepo.atomicIncrementUses as jest.Mock).mockImplementation(
        async () => {
          callOrder.push('increment');
          return true;
        },
      );
      (usageRepo.create as jest.Mock).mockImplementation(async () => {
        callOrder.push('create');
        return makeUsage();
      });

      await service.computeAndReserveDiscount(
        makeReservationParams({ itemsSubtotal: 100000 }),
      );

      expect(callOrder).toEqual(['increment', 'create']);
    });

    it('rolls back promotion increment when coupon atomicIncrementUses fails', async () => {
      const { service, promotionRepo, couponRepo } = buildService();
      (couponRepo.findActiveByCode as jest.Mock).mockResolvedValue(
        makeCoupon(),
      );
      (
        promotionRepo.findActiveCouponPromotionForRestaurant as jest.Mock
      ).mockResolvedValue(makePromotion({ trigger: 'coupon_code' }));
      (couponRepo.atomicIncrementUses as jest.Mock).mockResolvedValue(false); // exhausted

      const result = await service.computeAndReserveDiscount(
        makeReservationParams({ couponCode: 'SAVE10', itemsSubtotal: 100000 }),
      );

      expect(result.reserved).toBe(false);
      expect(promotionRepo.decrementUses).toHaveBeenCalledWith('promo-1');
    });

    it('returns no-discount gracefully when an unexpected error occurs', async () => {
      const { service, promotionRepo } = buildService();
      (
        promotionRepo.findActiveAutoApplyForRestaurant as jest.Mock
      ).mockRejectedValue(new Error('DB error'));

      const result = await service.computeAndReserveDiscount(
        makeReservationParams(),
      );

      expect(result.reserved).toBe(false);
      expect(result.discountAmount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // confirmReservations
  // -------------------------------------------------------------------------
  describe('confirmReservations', () => {
    it('calls usageRepo.confirmByOrderId with the given orderId', async () => {
      const { service, usageRepo } = buildService();

      await service.confirmReservations('order-42');

      expect(usageRepo.confirmByOrderId).toHaveBeenCalledWith('order-42');
    });

    it('does not throw when confirmByOrderId throws (must not abort committed order)', async () => {
      const { service, usageRepo } = buildService();
      (usageRepo.confirmByOrderId as jest.Mock).mockRejectedValue(
        new Error('DB failure'),
      );

      await expect(
        service.confirmReservations('order-1'),
      ).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // rollbackReservations
  // -------------------------------------------------------------------------
  describe('rollbackReservations', () => {
    it('calls usageRepo.rollbackByOrderId and decrements promotion uses', async () => {
      const { service, usageRepo, promotionRepo } = buildService();
      (usageRepo.rollbackByOrderId as jest.Mock).mockResolvedValue([
        { promotionId: 'promo-1', couponCodeId: null },
      ]);

      await service.rollbackReservations('order-1');

      expect(promotionRepo.decrementUses).toHaveBeenCalledWith('promo-1');
    });

    it('also decrements coupon uses when couponCodeId is set', async () => {
      const { service, usageRepo, promotionRepo, couponRepo } = buildService();
      (usageRepo.rollbackByOrderId as jest.Mock).mockResolvedValue([
        { promotionId: 'promo-1', couponCodeId: 'coupon-1' },
      ]);

      await service.rollbackReservations('order-1');

      expect(promotionRepo.decrementUses).toHaveBeenCalledWith('promo-1');
      expect(couponRepo.decrementUses).toHaveBeenCalledWith('coupon-1');
    });

    it('does nothing when there are no rolled-back usages', async () => {
      const { service, usageRepo, promotionRepo } = buildService();
      (usageRepo.rollbackByOrderId as jest.Mock).mockResolvedValue([]);

      await service.rollbackReservations('order-1');

      expect(promotionRepo.decrementUses).not.toHaveBeenCalled();
    });

    it('does not throw when rollbackByOrderId throws', async () => {
      const { service, usageRepo } = buildService();
      (usageRepo.rollbackByOrderId as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.rollbackReservations('order-1'),
      ).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // listPublicActive
  // -------------------------------------------------------------------------
  describe('listPublicActive', () => {
    it('returns active promotions from the repository', async () => {
      const { service, promotionRepo } = buildService();
      (promotionRepo.findPublicActive as jest.Mock).mockResolvedValue([
        makePromotion(),
      ]);

      const result = await service.listPublicActive('rest-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('promo-1');
    });

    it('passes restaurantId and date to the repository', async () => {
      const { service, promotionRepo } = buildService();
      (promotionRepo.findPublicActive as jest.Mock).mockResolvedValue([]);

      await service.listPublicActive('rest-99');

      expect(promotionRepo.findPublicActive).toHaveBeenCalledWith(
        'rest-99',
        expect.any(Date),
      );
    });

    it('returns empty array when no active promotions exist', async () => {
      const { service } = buildService();

      const result = await service.listPublicActive('rest-1');

      expect(result).toEqual([]);
    });
  });
});
