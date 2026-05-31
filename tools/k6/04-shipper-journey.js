/**
 * UITFood — Shipper Journey Test
 *
 * Tests shipper-role endpoints:
 *   GET  /shipper/orders/available   — orders ready for pickup (capped at 50)
 *   GET  /shipper/orders/active      — current active delivery (or null)
 *   GET  /shipper/orders/history     — paginated delivery history
 *   PATCH /orders/:id/pickup         — T-09: ready_for_pickup → picked_up
 *   PATCH /orders/:id/en-route       — T-10: picked_up → delivering
 *   PATCH /orders/:id/deliver        — T-11: delivering → delivered
 *
 * Requires a pre-provisioned 'shipper' role account:
 *   SHIPPER_EMAIL=driver@example.com
 *   SHIPPER_PASS=secret
 *
 * The pickup → en-route → deliver chain only runs when:
 *   a) No active delivery exists (fresh slot available), AND
 *   b) At least one order is in ready_for_pickup state
 *
 * If neither condition is met the mutation chain is skipped and counted
 * in skipped_preconditions — a persistently high count signals no test
 * orders are flowing through the pipeline.
 *
 * Usage:
 *   k6 run -e BASE_URL=https://uitfood-api.onrender.com \
 *          -e SHIPPER_EMAIL=driver@example.com \
 *          -e SHIPPER_PASS=secret \
 *          tools/k6/04-shipper-journey.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SHIPPER_EMAIL = __ENV.SHIPPER_EMAIL || '';
const SHIPPER_PASS = __ENV.SHIPPER_PASS || '';

const skipped = new Counter('skipped_preconditions');

// Stateful smoke test — single VU
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
  if (!SHIPPER_EMAIL || !SHIPPER_PASS) {
    console.warn(
      '[04-shipper-journey] SHIPPER_EMAIL / SHIPPER_PASS not set — ' +
        'mutation chain will be skipped',
    );
    return { token: null };
  }

  const res = http.post(
    url('/auth/sign-in/email'),
    JSON.stringify({ email: SHIPPER_EMAIL, password: SHIPPER_PASS }),
    { headers: JSON_HEADERS },
  );
  const body = parseBody(res);
  if (res.status !== 200 || !body?.token) {
    console.error(`[04-shipper-journey] Sign-in failed: HTTP ${res.status} — ${res.body}`);
    return { token: null };
  }

  return { token: body.token };
}

export default function (data) {
  const { token } = data;

  if (!token) {
    skipped.add(1);
    console.warn('[04] No token — skipping iteration (set SHIPPER_EMAIL + SHIPPER_PASS)');
    sleep(10);
    return;
  }

  const headers = authHeaders(token);

  // 1. Available orders (ready_for_pickup pool)
  let availableOrderId = null;
  group('available_orders', () => {
    const res = http.get(url('/shipper/orders/available'), {
      headers,
      tags: { name: 'shipper_available' },
    });
    check(res, {
      'available orders: 200': (r) => r.status === 200,
      'available orders: is array': (r) => Array.isArray(parseBody(r)),
    });

    const orders = parseBody(res) ?? [];
    if (orders.length > 0) {
      availableOrderId = orders[0].id;
    }
  });

  sleep(1);

  // 2. Current active delivery
  let activeOrderId = null;
  group('active_delivery', () => {
    const res = http.get(url('/shipper/orders/active'), {
      headers,
      tags: { name: 'shipper_active' },
    });
    // 200 with null body is valid when shipper has no active delivery
    check(res, { 'active delivery: 200': (r) => r.status === 200 });

    const body = parseBody(res);
    if (body && body.id) {
      activeOrderId = body.id;
    }
  });

  sleep(1);

  // 3. Delivery history (paginated)
  group('delivery_history', () => {
    const res = http.get(url('/shipper/orders/history?limit=10&offset=0'), {
      headers,
      tags: { name: 'shipper_history' },
    });
    check(res, { 'delivery history: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 4. Pickup → en-route → deliver chain
  // Only run when no active delivery and an available order exists.
  // If shipper already has an active order, continue from where it left off.
  if (activeOrderId) {
    // Continue an in-progress delivery
    group('en_route', () => {
      const res = http.patch(url(`/orders/${activeOrderId}/en-route`), null, {
        headers,
        tags: { name: 'order_en_route' },
      });
      // 422 = already in this state or wrong transition — not a test failure
      check(res, { 'en-route: 200 or 422': (r) => r.status === 200 || r.status === 422 });
    });

    sleep(2);

    group('deliver', () => {
      const res = http.patch(url(`/orders/${activeOrderId}/deliver`), null, {
        headers,
        tags: { name: 'order_deliver' },
      });
      check(res, { 'deliver: 200 or 422': (r) => r.status === 200 || r.status === 422 });
    });
  } else if (availableOrderId) {
    // Pick up a new order and walk the full chain
    group('pickup', () => {
      const res = http.patch(url(`/orders/${availableOrderId}/pickup`), null, {
        headers,
        tags: { name: 'order_pickup' },
      });
      check(res, { 'pickup: 200': (r) => r.status === 200 });
      if (res.status === 200) activeOrderId = availableOrderId;
    });

    sleep(2);

    if (activeOrderId) {
      group('en_route', () => {
        const res = http.patch(url(`/orders/${activeOrderId}/en-route`), null, {
          headers,
          tags: { name: 'order_en_route' },
        });
        check(res, { 'en-route: 200': (r) => r.status === 200 });
      });

      sleep(2);

      group('deliver', () => {
        const res = http.patch(url(`/orders/${activeOrderId}/deliver`), null, {
          headers,
          tags: { name: 'order_deliver' },
        });
        check(res, { 'deliver: 200': (r) => r.status === 200 });
      });
    }
  } else {
    skipped.add(1);
    console.log('[04] No available orders to pick up — read-only iteration');
  }

  sleep(Math.random() * 5 + 3);
}
