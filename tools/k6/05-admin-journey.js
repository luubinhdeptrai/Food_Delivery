/**
 * UITFood — Admin Journey Test
 *
 * Tests admin-role endpoints:
 *   GET  /restaurants/admin/all             — all restaurants (incl. unapproved)
 *   GET  /admin/orders                      — full platform order list
 *   GET  /admin/orders/:id                  — any order detail
 *   PATCH /restaurants/:id/approve          — approve a restaurant
 *   PATCH /restaurants/:id/unapprove        — unapprove (restores original state)
 *
 * Requires a pre-provisioned 'admin' role account:
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASS=secret
 *
 * Approve/unapprove are run as a paired idempotent test:
 *   - Find an already-approved restaurant → unapprove → re-approve
 *   - Leaves the restaurant in the same approved state as before
 *
 * Usage:
 *   k6 run -e BASE_URL=https://uitfood-api.onrender.com \
 *          -e ADMIN_EMAIL=admin@example.com \
 *          -e ADMIN_PASS=secret \
 *          tools/k6/05-admin-journey.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || '';
const ADMIN_PASS = __ENV.ADMIN_PASS || '';

const skipped = new Counter('skipped_preconditions');

// Stateful smoke test — single VU
export const options = {
  scenarios: {
    smoke: { executor: 'constant-vus', vus: 1, duration: '2m' },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    skipped_preconditions: ['count<20'],
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
  if (!ADMIN_EMAIL || !ADMIN_PASS) {
    console.warn(
      '[05-admin-journey] ADMIN_EMAIL / ADMIN_PASS not set — ' +
        'all admin mutations will be skipped',
    );
    return { token: null };
  }

  const res = http.post(
    url('/auth/sign-in/email'),
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
    { headers: JSON_HEADERS },
  );
  const body = parseBody(res);
  if (res.status !== 200 || !body?.token) {
    console.error(`[05-admin-journey] Sign-in failed: HTTP ${res.status} — ${res.body}`);
    return { token: null };
  }

  return { token: body.token };
}

export default function (data) {
  const { token } = data;

  if (!token) {
    skipped.add(1);
    console.warn('[05] No token — skipping iteration (set ADMIN_EMAIL + ADMIN_PASS)');
    sleep(10);
    return;
  }

  const headers = authHeaders(token);

  // 1. List all restaurants (including unapproved)
  let approvedRestaurantId = null;

  group('admin_list_restaurants', () => {
    const res = http.get(url('/restaurants/admin/all?limit=20&offset=0'), {
      headers,
      tags: { name: 'admin_restaurants' },
    });
    check(res, {
      'admin all restaurants: 200': (r) => r.status === 200,
      'admin all restaurants: has data': (r) => Array.isArray(parseBody(r)?.data),
    });

    const restaurants = parseBody(res)?.data ?? [];
    // Find an approved restaurant to use in the approve/unapprove cycle
    const approved = restaurants.find((r) => r.isApproved);
    if (approved) approvedRestaurantId = approved.id;
  });

  sleep(1);

  // 2. All orders with pagination + filters
  let firstOrderId = null;

  group('admin_orders', () => {
    const allRes = http.get(url('/admin/orders?limit=10&offset=0'), {
      headers,
      tags: { name: 'admin_orders' },
    });
    check(allRes, { 'admin orders: 200': (r) => r.status === 200 });

    const orders = parseBody(allRes)?.data ?? [];
    if (orders.length > 0) firstOrderId = orders[0].id;

    // Filter by status
    const deliveredRes = http.get(url('/admin/orders?status=delivered&limit=5'), {
      headers,
      tags: { name: 'admin_orders_filtered' },
    });
    check(deliveredRes, { 'admin orders delivered: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 3. Order detail (any order)
  group('admin_order_detail', () => {
    if (!firstOrderId) {
      skipped.add(1);
      return;
    }
    const res = http.get(url(`/admin/orders/${firstOrderId}`), {
      headers,
      tags: { name: 'admin_order_detail' },
    });
    check(res, { 'admin order detail: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 4. Approve/unapprove cycle — idempotent, restores original state
  // Unapprove an approved restaurant, then re-approve it, leaving state unchanged.
  group('approve_unapprove', () => {
    if (!approvedRestaurantId) {
      skipped.add(1);
      return;
    }

    const unapproveRes = http.patch(
      url(`/restaurants/${approvedRestaurantId}/unapprove`),
      null,
      { headers, tags: { name: 'restaurant_unapprove' } },
    );
    check(unapproveRes, { 'unapprove: 200': (r) => r.status === 200 });

    sleep(1);

    // Re-approve to restore original state
    const approveRes = http.patch(
      url(`/restaurants/${approvedRestaurantId}/approve`),
      null,
      { headers, tags: { name: 'restaurant_approve' } },
    );
    check(approveRes, { 'approve: 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 5 + 3);
}
