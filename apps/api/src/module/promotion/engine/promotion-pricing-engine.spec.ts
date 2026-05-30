/**
 * promotion-pricing-engine.spec.ts
 *
 * Pure unit tests for PromotionPricingEngine — no DB, no IO.
 *
 * Covers:
 *  §1 Date-range eligibility (not started / expired)
 *  §2 Min-order-amount gate
 *  §3 Quota exhaustion (currentTotalUses >= maxTotalUses)
 *  §4 Type-specific discount math
 *     - percentage with and without maxDiscountAmount cap
 *     - fixed_amount cap by subtotal
 *     - free_delivery (full shipping zero-out)
 *     - reduced_delivery cap by shippingFee
 *     - buy_x_get_y / free_item → not eligible (Phase PR-4)
 *  §5 Floor-to-1000 rounding invariant
 *  §6 Zero discount → not eligible (vacuous reservation guard)
 */
import { PromotionPricingEngine } from './promotion-pricing-engine';
import type { Promotion } from '../domain/promotion.schema';

const now = new Date('2026-06-15T12:00:00Z');

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'promo-1',
    name: 'Test promo',
    description: null,
    type: 'percentage',
    scope: 'platform',
    status: 'active',
    trigger: 'auto_apply',
    stackingMode: 'stackable',
    discountValue: 10,
    restaurantId: null,
    minOrderAmount: null,
    maxDiscountAmount: null,
    maxTotalUses: null,
    currentTotalUses: 0,
    maxUsesPerUser: null,
    priority: 0,
    startsAt: new Date('2026-06-01T00:00:00Z'),
    endsAt: new Date('2026-07-01T00:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as Promotion;
}

describe('PromotionPricingEngine', () => {
  const engine = new PromotionPricingEngine();

  describe('date-range eligibility', () => {
    it('rejects promotion that has not started', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          startsAt: new Date('2026-07-01T00:00:00Z'),
        }),
        itemsSubtotal: 100_000,
        shippingFee: 20_000,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/not started/i);
      expect(result.discountAmount).toBe(0);
    });

    it('rejects expired promotion', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ endsAt: new Date('2026-05-01T00:00:00Z') }),
        itemsSubtotal: 100_000,
        shippingFee: 20_000,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/expired/i);
    });
  });

  describe('min-order-amount gate', () => {
    it('rejects when subtotal below minOrderAmount', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ minOrderAmount: 200_000 }),
        itemsSubtotal: 150_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/minimum order amount/i);
    });

    it('allows when subtotal equal to minOrderAmount', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          minOrderAmount: 100_000,
          discountValue: 10,
        }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(true);
    });
  });

  describe('quota exhaustion', () => {
    it('rejects when current uses reaches max', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ maxTotalUses: 100, currentTotalUses: 100 }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/quota/i);
    });
  });

  describe('percentage type', () => {
    it('computes 10% discount, floored to 1000', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'percentage', discountValue: 10 }),
        itemsSubtotal: 123_456,
        shippingFee: 0,
        now,
      });
      // 10% of 123_456 = 12_345.6 → floor → 12_345 → floor to thousand → 12_000
      expect(result.eligible).toBe(true);
      expect(result.discountOnItems).toBe(12_000);
      expect(result.discountOnShipping).toBe(0);
      expect(result.discountAmount).toBe(12_000);
    });

    it('caps at maxDiscountAmount before floor-to-1000', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          type: 'percentage',
          discountValue: 50,
          maxDiscountAmount: 30_000,
        }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.discountOnItems).toBe(30_000);
    });

    it('never exceeds itemsSubtotal', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'percentage', discountValue: 100 }),
        itemsSubtotal: 25_000,
        shippingFee: 0,
        now,
      });
      expect(result.discountOnItems).toBe(25_000);
    });
  });

  describe('fixed_amount type', () => {
    it('applies the fixed discount when subtotal large enough', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          type: 'fixed_amount',
          discountValue: 15_000,
        }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.discountOnItems).toBe(15_000);
    });

    it('caps at subtotal then floors to 1000', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          type: 'fixed_amount',
          discountValue: 50_000,
        }),
        itemsSubtotal: 23_500,
        shippingFee: 0,
        now,
      });
      // min(50_000, 23_500) = 23_500 → floor to 1000 → 23_000
      expect(result.discountOnItems).toBe(23_000);
    });
  });

  describe('free_delivery type', () => {
    it('zeros out the shipping fee', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'free_delivery', discountValue: 0 }),
        itemsSubtotal: 100_000,
        shippingFee: 20_000,
        now,
      });
      expect(result.discountOnItems).toBe(0);
      expect(result.discountOnShipping).toBe(20_000);
      expect(result.discountAmount).toBe(20_000);
    });

    it('returns ineligible when shipping is already 0 (vacuous discount)', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'free_delivery', discountValue: 0 }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/0 VND/);
    });
  });

  describe('reduced_delivery type', () => {
    it('reduces shipping by fixed amount, capped at shippingFee', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          type: 'reduced_delivery',
          discountValue: 15_000,
        }),
        itemsSubtotal: 100_000,
        shippingFee: 10_000,
        now,
      });
      expect(result.discountOnShipping).toBe(10_000);
    });
  });

  describe('unsupported types', () => {
    it('buy_x_get_y returns not eligible with PR-4 hint', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'buy_x_get_y' }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/PR-4/);
    });

    it('free_item returns not eligible with PR-4 hint', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ type: 'free_item' }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.eligible).toBe(false);
    });
  });

  describe('breakdown shape', () => {
    it('returns breakdown with promotionId and name on eligible result', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({
          id: 'promo-xyz',
          name: 'Lunch deal',
          type: 'fixed_amount',
          discountValue: 10_000,
        }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.breakdown.promotionId).toBe('promo-xyz');
      expect(result.breakdown.promotionName).toBe('Lunch deal');
      expect(result.breakdown.discountAmount).toBe(10_000);
    });

    it('returns empty (zero-value) breakdown when not eligible', () => {
      const result = engine.computeDiscount({
        promotion: makePromotion({ minOrderAmount: 999_999 }),
        itemsSubtotal: 100_000,
        shippingFee: 0,
        now,
      });
      expect(result.breakdown.discountAmount).toBe(0);
      expect(result.breakdown.discountOnItems).toBe(0);
      expect(result.breakdown.discountOnShipping).toBe(0);
    });
  });
});
