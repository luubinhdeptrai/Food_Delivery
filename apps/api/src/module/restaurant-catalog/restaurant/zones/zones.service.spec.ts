/**
 * zones.service.spec.ts
 *
 * Unit tests for ZonesService.estimateDelivery — delivery fee rounding
 * consistency.
 *
 * Bug context: before the fix, calculateDeliveryFee used Math.round (nearest
 * 1 VND), while PlaceOrderHandler.calculateShippingFee used
 * Math.round(raw / 1000) * 1000 (nearest 1 000 VND).  This caused the
 * estimate shown to the customer (e.g. 19 992 VND) to differ from the amount
 * charged at checkout (20 000 VND).
 *
 * After the fix both use roundToNearest1000 from
 * @/shared/validators/vnd-amount.validator, so the amounts are always
 * identical for the same zone + distance input.
 *
 * Covered scenarios
 * ─────────────────
 *  1. Distance fee requiring rounding — 4 992 → 5 000
 *  2. Exact multiple of 1 000 — 5 000 → 5 000 (no change)
 *  3. Boundary values — 4 501, 4 999, 5 001, 4 499
 *  4. Zero distance — distance fee = 0, total = baseFee
 *  5. Breakdown consistency — deliveryFee === baseFee + distanceFee
 *  6. Estimate == order placement formula for identical inputs
 *  7. Outside all delivery zones → UnprocessableEntityException
 *  8. No active zones → UnprocessableEntityException
 *  9. Restaurant missing coordinates → UnprocessableEntityException
 */

import { UnprocessableEntityException } from '@nestjs/common';
import { ZonesService } from './zones.service';
import type { DeliveryZone } from '../restaurant.schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeZone(overrides: Partial<DeliveryZone> = {}): DeliveryZone {
  return {
    id: 'zone-1',
    restaurantId: 'rest-1',
    name: 'Standard Zone',
    radiusKm: 10,
    baseFee: 15000,
    perKmRate: 3200,
    avgSpeedKmh: 20,
    prepTimeMinutes: 15,
    bufferMinutes: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as DeliveryZone;
}

function makeRestaurant(overrides: Partial<any> = {}): any {
  return {
    id: 'rest-1',
    ownerId: 'owner-1',
    name: 'Phở Bắc',
    isOpen: true,
    isApproved: true,
    latitude: 10.776,
    longitude: 106.701,
    ...overrides,
  };
}

function buildService(opts?: {
  restaurant?: any;
  zones?: DeliveryZone[];
  distanceKm?: number;
}) {
  const restaurant = opts?.restaurant ?? makeRestaurant();
  const zones = opts?.zones ?? [makeZone()];
  const distanceKm = opts?.distanceKm ?? 1.56;

  const repo = {
    findByRestaurant: jest.fn().mockResolvedValue(zones),
    findById: jest.fn().mockResolvedValue(zones[0] ?? null),
    findActiveByRestaurantOrderedByRadius: jest.fn().mockResolvedValue(zones),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const restaurantService = {
    findOne: jest.fn().mockResolvedValue(restaurant),
  };

  const geo = {
    calculateDistanceKm: jest.fn().mockReturnValue(distanceKm),
  };

  const eventBus = {
    publish: jest.fn(),
  };

  const service = new ZonesService(
    repo as any,
    restaurantService as any,
    geo as any,
    eventBus as any,
  );

  return { service, repo, restaurantService, geo };
}

const CUSTOMER_COORDS = { latitude: 10.78, longitude: 106.71 };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ZonesService.estimateDelivery — delivery fee rounding', () => {
  // ── Case 1: the bug scenario ────────────────────────────────────────────
  describe('Case 1: distance fee requiring rounding (4 992 → 5 000)', () => {
    it('rounds deliveryFee to nearest 1 000 VND', async () => {
      // baseFee=15000, perKmRate=3200, distanceKm=1.56 → raw=19992 → 20000
      const { service } = buildService({ distanceKm: 1.56 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.deliveryFee).toBe(20000);
    });

    it('rounds distanceFee in breakdown to nearest 1 000 VND', async () => {
      // 1.56 × 3200 = 4992 → 5000
      const { service } = buildService({ distanceKm: 1.56 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.breakdown.distanceFee).toBe(5000);
    });

    it('breakdown is internally consistent: deliveryFee === baseFee + distanceFee', async () => {
      const { service } = buildService({ distanceKm: 1.56 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.deliveryFee).toBe(
        result.breakdown.baseFee + result.breakdown.distanceFee,
      );
    });
  });

  // ── Case 2: exact multiple of 1 000 ─────────────────────────────────────
  describe('Case 2: exact multiple of 1 000 (no rounding needed)', () => {
    it('returns 5 000 when distanceFee is already 5 000', async () => {
      // perKmRate=1000, distanceKm=5 → raw distanceFee=5000 (exact)
      const zone = makeZone({ baseFee: 10000, perKmRate: 1000 });
      const { service } = buildService({ zones: [zone], distanceKm: 5 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.breakdown.distanceFee).toBe(5000);
      expect(result.deliveryFee).toBe(15000); // 10000 + 5000
    });

    it('returns baseFee unchanged when distanceFee is exactly a multiple', async () => {
      const zone = makeZone({ baseFee: 15000, perKmRate: 2000 });
      const { service } = buildService({ zones: [zone], distanceKm: 2.0 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.breakdown.distanceFee).toBe(4000);
      expect(result.deliveryFee).toBe(19000);
    });
  });

  // ── Case 3: boundary values ──────────────────────────────────────────────
  describe('Case 3: boundary values', () => {
    // perKmRate=1000 → raw distanceFee = distanceKm × 1000

    it('4 501 rounds up to 5 000', async () => {
      const zone = makeZone({ baseFee: 10000, perKmRate: 1000 });
      const { service } = buildService({ zones: [zone], distanceKm: 4.501 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);
      // raw=4501 → Math.round(4501/1000)*1000 = 5000
      expect(result.breakdown.distanceFee).toBe(5000);
    });

    it('4 999 rounds up to 5 000', async () => {
      const zone = makeZone({ baseFee: 10000, perKmRate: 1000 });
      const { service } = buildService({ zones: [zone], distanceKm: 4.999 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);
      // raw=4999 → Math.round(4999/1000)*1000 = 5000
      expect(result.breakdown.distanceFee).toBe(5000);
    });

    it('5 001 rounds down to 5 000', async () => {
      const zone = makeZone({ baseFee: 10000, perKmRate: 1000, radiusKm: 20 });
      const { service } = buildService({ zones: [zone], distanceKm: 5.001 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);
      // raw=5001 → Math.round(5001/1000)*1000 = 5000
      expect(result.breakdown.distanceFee).toBe(5000);
    });

    it('4 499 rounds down to 4 000', async () => {
      const zone = makeZone({ baseFee: 10000, perKmRate: 1000 });
      const { service } = buildService({ zones: [zone], distanceKm: 4.499 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);
      // raw=4499 → Math.round(4499/1000)*1000 = 4000
      expect(result.breakdown.distanceFee).toBe(4000);
    });
  });

  // ── Case 4: zero distance ────────────────────────────────────────────────
  describe('Case 4: zero distance', () => {
    it('returns baseFee as deliveryFee and distanceFee=0', async () => {
      const zone = makeZone({ baseFee: 15000 });
      const { service } = buildService({ zones: [zone], distanceKm: 0 });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.breakdown.distanceFee).toBe(0);
      expect(result.deliveryFee).toBe(15000);
    });
  });

  // ── Case 5: breakdown consistency invariant ──────────────────────────────
  describe('Case 5: breakdown consistency (deliveryFee === baseFee + distanceFee)', () => {
    const distanceCases = [0, 0.5, 1.0, 1.56, 2.48, 3.0, 4.999, 5.001, 7.777];

    test.each(distanceCases)('holds for distanceKm=%f', async (distanceKm) => {
      const zone = makeZone({ radiusKm: 20 });
      const { service } = buildService({ zones: [zone], distanceKm });
      const result = await service.estimateDelivery('rest-1', CUSTOMER_COORDS);

      expect(result.deliveryFee).toBe(
        result.breakdown.baseFee + result.breakdown.distanceFee,
      );
    });
  });

  // ── Case 6: estimate == PlaceOrderHandler formula ────────────────────────
  describe('Case 6: estimate fee equals PlaceOrderHandler fee for identical inputs', () => {
    /**
     * This test encodes the shared contract: both APIs must produce the same
     * shippingFee for the same (baseFee, perKmRate, distanceKm) triple.
     *
     * PlaceOrderHandler formula: Math.round(raw / 1000) * 1000
     * ZonesService formula (after fix): roundToNearest1000(raw)
     * These are mathematically equivalent.
     */
    function placeOrderFee(
      baseFee: number,
      perKmRate: number,
      distanceKm: number,
    ): number {
      const raw = baseFee + distanceKm * perKmRate;
      return Math.round(raw / 1000) * 1000;
    }

    const cases: Array<{
      baseFee: number;
      perKmRate: number;
      distanceKm: number;
    }> = [
      { baseFee: 15000, perKmRate: 3200, distanceKm: 1.56 }, // bug scenario
      { baseFee: 10000, perKmRate: 2000, distanceKm: 3.5 },
      { baseFee: 20000, perKmRate: 5000, distanceKm: 0.8 },
      { baseFee: 15000, perKmRate: 3000, distanceKm: 4.999 },
    ];

    test.each(cases)(
      'baseFee=$baseFee perKmRate=$perKmRate distanceKm=$distanceKm',
      async ({ baseFee, perKmRate, distanceKm }) => {
        const zone = makeZone({ baseFee, perKmRate, radiusKm: 20 });
        const { service } = buildService({ zones: [zone], distanceKm });
        const result = await service.estimateDelivery(
          'rest-1',
          CUSTOMER_COORDS,
        );

        const expectedFee = placeOrderFee(baseFee, perKmRate, distanceKm);
        expect(result.deliveryFee).toBe(expectedFee);
      },
    );
  });

  // ── Error cases ──────────────────────────────────────────────────────────
  describe('error cases', () => {
    it('throws UnprocessableEntityException when customer is outside all zones', async () => {
      // zone radiusKm=1, but distanceKm=5
      const zone = makeZone({ radiusKm: 1 });
      const { service } = buildService({ zones: [zone], distanceKm: 5 });

      await expect(
        service.estimateDelivery('rest-1', CUSTOMER_COORDS),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException when no active zones exist', async () => {
      const { service } = buildService({ zones: [] });

      await expect(
        service.estimateDelivery('rest-1', CUSTOMER_COORDS),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException when restaurant has no coordinates', async () => {
      const restaurant = makeRestaurant({ latitude: null, longitude: null });
      const { service } = buildService({ restaurant });

      await expect(
        service.estimateDelivery('rest-1', CUSTOMER_COORDS),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });

  // ── deliveryFee is always a multiple of 1 000 ────────────────────────────
  describe('deliveryFee is always a multiple of 1 000 VND', () => {
    const distanceCases = [0.1, 0.333, 1.56, 2.78, 4.123, 9.876];

    test.each(distanceCases)(
      'deliveryFee %% 1000 === 0 for distanceKm=%f',
      async (distanceKm) => {
        const zone = makeZone({ radiusKm: 20 });
        const { service } = buildService({ zones: [zone], distanceKm });
        const result = await service.estimateDelivery(
          'rest-1',
          CUSTOMER_COORDS,
        );

        expect(result.deliveryFee % 1000).toBe(0);
        expect(result.breakdown.distanceFee % 1000).toBe(0);
      },
    );
  });
});
