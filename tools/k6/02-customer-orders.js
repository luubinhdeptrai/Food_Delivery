/**
 * UITFood — Customer Order History & Notifications Load Test
 *
 * Tests authenticated customer use cases (read-heavy; no checkout):
 *   GET  /orders/my                       — order history (paginated + status filter)
 *   GET  /orders/my/:id                   — order detail
 *   GET  /orders/my/:id/reorder           — reorder items for cart pre-fill
 *   GET  /notifications/my                — inbox (all + unread filter)
 *   GET  /notifications/my/unread-count   — badge count
 *   PATCH /notifications/my/read-all      — bulk mark as read
 *   PATCH /notifications/:id/read         — mark single as read
 *   GET  /notifications/my/preferences    — get delivery preferences
 *   PATCH /notifications/my/preferences   — update delivery preferences
 *   POST /promotions/coupons/validate     — validate coupon code
 *
 * Cart checkout is intentionally omitted (tested in realistic-user.js).
 *
 * Usage:
 *   k6 run tools/k6/02-customer-orders.js
 *   k6 run -e SCENARIO=load -e BASE_URL=https://uitfood-api.onrender.com tools/k6/02-customer-orders.js
 *   k6 run -e NUM_USERS=10 -e BASE_URL=https://uitfood-api.onrender.com tools/k6/02-customer-orders.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SCENARIO = __ENV.SCENARIO || 'smoke';
const NUM_USERS = parseInt(__ENV.NUM_USERS || '5', 10);

const SCENARIOS = {
  smoke: { executor: 'constant-vus', vus: 1, duration: '1m' },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 10 },
      { duration: '2m', target: 0 },
    ],
  },
};

const errorRate = new Rate('error_rate');
const skipped = new Counter('skipped_preconditions');

export const options = {
  scenarios: { [SCENARIO]: SCENARIOS[SCENARIO] || SCENARIOS.smoke },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    error_rate: ['rate<0.05'],
    // Alert if too many steps were skipped due to missing data
    skipped_preconditions: ['count<100'],
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

function signIn(email, password) {
  const res = http.post(
    url('/auth/sign-in/email'),
    JSON.stringify({ email, password }),
    { headers: JSON_HEADERS },
  );
  const body = parseBody(res);
  if (res.status !== 200 || !body?.token) {
    console.error(`Sign-in failed for ${email}: HTTP ${res.status}`);
    return null;
  }
  return body.token;
}

export function setup() {
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const email = `k6test+${i}@uitfood.test`;
    const password = 'K6Test@1234';

    // 409 = already exists; both cases are fine
    http.post(
      url('/auth/sign-up/email'),
      JSON.stringify({ email, password, name: `K6 Customer ${i}` }),
      { headers: JSON_HEADERS },
    );

    const token = signIn(email, password);
    if (token) users.push({ email, token });
  }

  if (users.length === 0) {
    console.error('[02-customer-orders] Could not sign in any test user — check credentials');
  }
  return { users };
}

export default function (data) {
  const { users } = data;

  if (!users.length) {
    skipped.add(1);
    console.warn('[02] No signed-in users available — skipping iteration');
    sleep(5);
    return;
  }

  const user = users[__VU % users.length];
  const headers = authHeaders(user.token);

  // 1. Order history — paginated + status filter
  group('order_history', () => {
    const res = http.get(url('/orders/my?limit=10&offset=0'), {
      headers,
      tags: { name: 'order_history' },
    });
    const ok = check(res, { 'order history: 200': (r) => r.status === 200 });
    errorRate.add(!ok);

    // Filter by specific status
    const statusRes = http.get(url('/orders/my?status=delivered&limit=5'), {
      headers,
      tags: { name: 'order_history_filtered' },
    });
    check(statusRes, { 'order history filtered: 200': (r) => r.status === 200 });

    // Try to view a specific order + reorder items
    const orders = parseBody(res)?.data ?? [];
    if (orders.length > 0) {
      const orderId = orders[0].id;

      const detailRes = http.get(url(`/orders/my/${orderId}`), {
        headers,
        tags: { name: 'order_detail' },
      });
      check(detailRes, { 'order detail: 200': (r) => r.status === 200 });

      const reorderRes = http.get(url(`/orders/my/${orderId}/reorder`), {
        headers,
        tags: { name: 'reorder' },
      });
      check(reorderRes, {
        'reorder items: 200': (r) => r.status === 200,
        'reorder items: is array': (r) => Array.isArray(parseBody(r)),
      });
    } else {
      skipped.add(1);
    }
  });

  sleep(1);

  // 2. Notification inbox — all + unread filter
  group('notification_inbox', () => {
    const allRes = http.get(url('/notifications/my?limit=20&offset=0'), {
      headers,
      tags: { name: 'notification_inbox' },
    });
    check(allRes, { 'inbox all: 200': (r) => r.status === 200 });

    const unreadRes = http.get(url('/notifications/my?unreadOnly=true&limit=10'), {
      headers,
      tags: { name: 'notification_inbox_unread' },
    });
    check(unreadRes, { 'inbox unread filter: 200': (r) => r.status === 200 });

    const countRes = http.get(url('/notifications/my/unread-count'), {
      headers,
      tags: { name: 'notification_count' },
    });
    check(countRes, {
      'unread count: 200': (r) => r.status === 200,
      'unread count: has count field': (r) => parseBody(r)?.count != null,
    });

    // Mark a single unread notification as read (if one exists)
    const notifications = parseBody(allRes)?.notifications ?? [];
    const unread = notifications.find((n) => !n.isRead);
    if (unread) {
      const markRes = http.patch(url(`/notifications/${unread.id}/read`), null, {
        headers,
        tags: { name: 'notification_mark_read' },
      });
      check(markRes, { 'mark single read: 200': (r) => r.status === 200 });
    } else {
      skipped.add(1);
    }

    // Bulk mark all as read (idempotent — safe even if already all read)
    const markAllRes = http.patch(url('/notifications/my/read-all'), null, {
      headers,
      tags: { name: 'notification_mark_all' },
    });
    check(markAllRes, {
      'mark all read: 200': (r) => r.status === 200,
      'mark all read: count field': (r) => parseBody(r)?.count != null,
    });
  });

  sleep(1);

  // 3. Notification preferences
  group('notification_preferences', () => {
    const getRes = http.get(url('/notifications/my/preferences'), {
      headers,
      tags: { name: 'notif_prefs_get' },
    });
    check(getRes, { 'prefs get: 200': (r) => r.status === 200 });

    // Idempotent partial update — same values, no visible side effects
    const updateRes = http.patch(
      url('/notifications/my/preferences'),
      JSON.stringify({ inAppEnabled: true, emailEnabled: true }),
      { headers, tags: { name: 'notif_prefs_update' } },
    );
    check(updateRes, { 'prefs update: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 4. Coupon validation — invalid code expected to return 4xx (not 5xx)
  group('coupon_validate', () => {
    const validateRes = http.post(
      url('/promotions/coupons/validate'),
      JSON.stringify({ code: 'INVALID_CODE_K6TEST' }),
      { headers, tags: { name: 'coupon_validate' } },
    );
    check(validateRes, {
      'coupon validate: not 5xx': (r) => r.status < 500,
    });
  });

  sleep(Math.random() * 2 + 1);
}
