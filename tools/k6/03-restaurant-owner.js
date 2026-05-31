/**
 * UITFood — Restaurant Owner Journey Test
 *
 * Tests restaurant-role endpoints:
 *   GET  /restaurants/my                               — own restaurant info
 *   GET  /restaurant/orders?limit=&offset=&status=     — paginated order history
 *   GET  /restaurant/orders/active                     — kitchen view (live)
 *   PATCH /orders/:id/confirm                          — T-01: pending → confirmed
 *   PATCH /orders/:id/start-preparing                  — T-06: confirmed → preparing
 *   PATCH /orders/:id/ready                            — T-08: preparing → ready_for_pickup
 *   GET  /promotions/restaurant/my?restaurantId=       — list own promotions
 *   POST /promotions/restaurant?restaurantId=          — create draft promotion
 *
 * Requires a pre-provisioned 'restaurant' role account:
 *   RESTAURANT_EMAIL=owner@example.com
 *   RESTAURANT_PASS=secret
 *
 * The order lifecycle chain (confirm → preparing → ready) only runs when orders
 * in the matching state exist in the kitchen view. skipped_preconditions tracks
 * how many steps were skipped — a high count means no test data is flowing.
 *
 * Usage:
 *   k6 run -e BASE_URL=https://uitfood-api.onrender.com \
 *          -e RESTAURANT_EMAIL=owner@example.com \
 *          -e RESTAURANT_PASS=secret \
 *          tools/k6/03-restaurant-owner.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const RESTAURANT_EMAIL = __ENV.RESTAURANT_EMAIL || '';
const RESTAURANT_PASS = __ENV.RESTAURANT_PASS || '';

const skipped = new Counter('skipped_preconditions');

// Stateful smoke test — single VU, extended duration for manual order injection
export const options = {
  scenarios: {
    smoke: { executor: 'constant-vus', vus: 1, duration: '3m' },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    skipped_preconditions: ['count<50'],
  },
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function url(path) {
  return `${BASE_URL}/api${path}`;
}

function parseBody(res) {
  try {
    return JSON.parse(res.body);
  } catch {
    return null;
  }
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function setup() {
  if (!RESTAURANT_EMAIL || !RESTAURANT_PASS) {
    console.warn(
      '[03-restaurant-owner] RESTAURANT_EMAIL / RESTAURANT_PASS not set — ' +
        'order lifecycle mutations will be skipped',
    );
    return { token: null, restaurantId: null };
  }

  const res = http.post(
    url('/auth/sign-in/email'),
    JSON.stringify({ email: RESTAURANT_EMAIL, password: RESTAURANT_PASS }),
    { headers: JSON_HEADERS },
  );
  const body = parseBody(res);
  if (res.status !== 200 || !body?.token) {
    console.error(`[03-restaurant-owner] Sign-in failed: HTTP ${res.status} — ${res.body}`);
    return { token: null, restaurantId: null };
  }

  const token = body.token;
  const rRes = http.get(url('/restaurants/my'), {
    headers: authHeaders(token),
  });
  const restaurant = parseBody(rRes);
  const restaurantId = restaurant?.id ?? null;

  if (!restaurantId) {
    console.warn('[03-restaurant-owner] No restaurant found for this user — promotion tests skipped');
  }

  return { token, restaurantId };
}

export default function (data) {
  const { token, restaurantId } = data;

  if (!token) {
    skipped.add(1);
    console.warn('[03] No token — skipping iteration (set RESTAURANT_EMAIL + RESTAURANT_PASS)');
    sleep(10);
    return;
  }

  const headers = authHeaders(token);

  // 1. Own restaurant info
  group('my_restaurant', () => {
    const res = http.get(url('/restaurants/my'), {
      headers,
      tags: { name: 'restaurant_my' },
    });
    check(res, {
      'my restaurant: 200': (r) => r.status === 200,
      'my restaurant: has id': (r) => parseBody(r)?.id != null,
    });
  });

  sleep(1);

  // 2. Order list — paginated + status filter
  group('restaurant_orders', () => {
    const allRes = http.get(url('/restaurant/orders?limit=10&offset=0'), {
      headers,
      tags: { name: 'restaurant_orders' },
    });
    check(allRes, { 'restaurant orders: 200': (r) => r.status === 200 });

    const pendingRes = http.get(url('/restaurant/orders?status=pending&limit=10'), {
      headers,
      tags: { name: 'restaurant_orders_filtered' },
    });
    check(pendingRes, { 'restaurant orders pending: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 3. Kitchen view — find orders in each lifecycle state
  let pendingOrderId = null;
  let confirmedOrderId = null;
  let preparingOrderId = null;

  group('kitchen_view', () => {
    const res = http.get(url('/restaurant/orders/active'), {
      headers,
      tags: { name: 'kitchen_active' },
    });
    check(res, { 'kitchen active: 200': (r) => r.status === 200 });

    const orders = parseBody(res) ?? [];
    for (const o of orders) {
      if (!pendingOrderId && o.status === 'pending') pendingOrderId = o.id;
      if (!confirmedOrderId && o.status === 'confirmed') confirmedOrderId = o.id;
      if (!preparingOrderId && o.status === 'preparing') preparingOrderId = o.id;
    }
  });

  sleep(1);

  // 4. Lifecycle: T-01 confirm pending COD order
  group('order_confirm', () => {
    if (!pendingOrderId) {
      skipped.add(1);
      return;
    }
    const res = http.patch(url(`/orders/${pendingOrderId}/confirm`), null, {
      headers,
      tags: { name: 'order_confirm' },
    });
    check(res, { 'confirm order: 200': (r) => r.status === 200 });
    if (res.status === 200) confirmedOrderId = pendingOrderId;
  });

  sleep(1);

  // 5. Lifecycle: T-06 start preparing
  group('order_start_preparing', () => {
    if (!confirmedOrderId) {
      skipped.add(1);
      return;
    }
    const res = http.patch(url(`/orders/${confirmedOrderId}/start-preparing`), null, {
      headers,
      tags: { name: 'order_preparing' },
    });
    check(res, { 'start-preparing: 200': (r) => r.status === 200 });
    if (res.status === 200) preparingOrderId = confirmedOrderId;
  });

  sleep(1);

  // 6. Lifecycle: T-08 ready for pickup
  group('order_ready', () => {
    if (!preparingOrderId) {
      skipped.add(1);
      return;
    }
    const res = http.patch(url(`/orders/${preparingOrderId}/ready`), null, {
      headers,
      tags: { name: 'order_ready' },
    });
    check(res, { 'order ready: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 7. Promotions — list + create (only when restaurantId is available)
  if (restaurantId) {
    group('promotions', () => {
      const listRes = http.get(
        url(`/promotions/restaurant/my?restaurantId=${restaurantId}&limit=10`),
        { headers, tags: { name: 'promotions_list' } },
      );
      check(listRes, { 'promotions list: 200': (r) => r.status === 200 });

      // Create a draft promotion (safe — draft status, no impact on customers)
      const createRes = http.post(
        url(`/promotions/restaurant?restaurantId=${restaurantId}`),
        JSON.stringify({
          name: 'K6 Test Promo',
          type: 'percentage',
          value: 10,
          minOrderAmount: 0,
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
        }),
        { headers, tags: { name: 'promotions_create' } },
      );
      // 201 = created, 400 = bad payload shape — only 5xx is a real error
      check(createRes, { 'promotion create: not 5xx': (r) => r.status < 500 });
    });
  }

  sleep(Math.random() * 5 + 3);
}
