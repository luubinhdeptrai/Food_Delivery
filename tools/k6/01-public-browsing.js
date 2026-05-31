/**
 * UITFood — Public Browsing Load Test
 *
 * Tests all unauthenticated / @AllowAnonymous endpoints:
 *   GET  /restaurants               — list + pagination
 *   GET  /restaurants/:id           — restaurant detail
 *   GET  /search?q=...              — unified accent-insensitive search
 *   GET  /menu-items?restaurantId=  — menu items
 *   GET  /menu-items/categories     — menu categories
 *   GET  /menu-items/:id            — item detail
 *   GET  /restaurants/:id/delivery-zones             — zones list
 *   GET  /restaurants/:id/delivery-zones/delivery-estimate?lat=&lon= — estimate
 *   GET  /promotions/active?restaurantId=            — active promos
 *
 * No auth, no seeds required — runs out of the box.
 *
 * Usage:
 *   k6 run tools/k6/01-public-browsing.js
 *   k6 run -e SCENARIO=load -e BASE_URL=https://uitfood-api.onrender.com tools/k6/01-public-browsing.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SCENARIO = __ENV.SCENARIO || 'smoke';

const SCENARIOS = {
  smoke: { executor: 'constant-vus', vus: 1, duration: '1m' },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  },
};

const errorRate = new Rate('error_rate');
const searchDuration = new Trend('search_duration_ms');

export const options = {
  scenarios: { [SCENARIO]: SCENARIOS[SCENARIO] || SCENARIOS.smoke },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    error_rate: ['rate<0.05'],
    'http_req_duration{name:list_restaurants}': ['p(95)<1000'],
    'http_req_duration{name:restaurant_detail}': ['p(95)<1000'],
    'http_req_duration{name:search}': ['p(95)<3000'],
    'http_req_duration{name:menu_items}': ['p(95)<1000'],
    'http_req_duration{name:delivery_zones}': ['p(95)<1000'],
  },
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const SEARCH_TERMS = ['cơm', 'phở', 'bánh mì', 'gà', 'bún', 'pizza', 'burger'];
const CUISINE_TYPES = ['Vietnamese', 'Western', 'Japanese', 'Korean'];

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

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fetch seed data once so all VUs share the same restaurant + menu pool
export function setup() {
  const res = http.get(url('/restaurants?limit=20'), { headers: JSON_HEADERS });
  const body = parseBody(res);
  const restaurants = body?.data ?? [];

  const menuByRestaurant = {};
  for (const r of restaurants.slice(0, 6)) {
    const mRes = http.get(url(`/menu-items?restaurantId=${r.id}&limit=10`), {
      headers: JSON_HEADERS,
    });
    const mBody = parseBody(mRes);
    const items = Array.isArray(mBody) ? mBody : (mBody?.data ?? []);
    if (items.length > 0) menuByRestaurant[r.id] = items;
  }

  return { restaurants, menuByRestaurant };
}

export default function (data) {
  const { restaurants, menuByRestaurant } = data;
  const restaurant = restaurants.length ? randItem(restaurants) : null;
  const menuItems = restaurant ? (menuByRestaurant[restaurant.id] ?? []) : [];
  const menuItem = menuItems.length ? randItem(menuItems) : null;

  // 1. List restaurants with pagination
  group('list_restaurants', () => {
    const res = http.get(url('/restaurants?offset=0&limit=10'), {
      headers: JSON_HEADERS,
      tags: { name: 'list_restaurants' },
    });
    const ok = check(res, {
      'list restaurants: 200': (r) => r.status === 200,
      'list restaurants: has data array': (r) => Array.isArray(parseBody(r)?.data),
    });
    errorRate.add(!ok);

    // Page 2
    const page2 = http.get(url('/restaurants?offset=10&limit=10'), {
      headers: JSON_HEADERS,
      tags: { name: 'list_restaurants' },
    });
    check(page2, { 'list restaurants page 2: 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 2. Restaurant detail
  if (restaurant) {
    group('restaurant_detail', () => {
      const res = http.get(url(`/restaurants/${restaurant.id}`), {
        headers: JSON_HEADERS,
        tags: { name: 'restaurant_detail' },
      });
      const ok = check(res, {
        'restaurant detail: 200': (r) => r.status === 200,
        'restaurant detail: has id': (r) => parseBody(r)?.id != null,
      });
      errorRate.add(!ok);
    });
    sleep(1);
  }

  // 3. Unified search — text + cuisine type filter
  group('search', () => {
    const q = encodeURIComponent(randItem(SEARCH_TERMS));
    const res = http.get(
      url(`/search?q=${q}&lat=10.7769&lon=106.7009&limit=10`),
      { headers: JSON_HEADERS, tags: { name: 'search' } },
    );
    searchDuration.add(res.timings.duration);
    const ok = check(res, { 'search text: 200': (r) => r.status === 200 });
    errorRate.add(!ok);

    // Cuisine type filter (no text query)
    const cuisineRes = http.get(
      url(`/search?cuisineType=${encodeURIComponent(randItem(CUISINE_TYPES))}&limit=5`),
      { headers: JSON_HEADERS, tags: { name: 'search' } },
    );
    check(cuisineRes, { 'search cuisine: 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1);

  // 4. Menu items + categories
  if (restaurant) {
    group('browse_menu', () => {
      const itemsRes = http.get(
        url(`/menu-items?restaurantId=${restaurant.id}&limit=10`),
        { headers: JSON_HEADERS, tags: { name: 'menu_items' } },
      );
      check(itemsRes, { 'menu items: 200': (r) => r.status === 200 });

      const catRes = http.get(
        url(`/menu-items/categories?restaurantId=${restaurant.id}`),
        { headers: JSON_HEADERS, tags: { name: 'menu_categories' } },
      );
      check(catRes, { 'menu categories: 200': (r) => r.status === 200 });
    });
    sleep(1);

    // 5. Menu item detail
    if (menuItem) {
      group('menu_item_detail', () => {
        const res = http.get(url(`/menu-items/${menuItem.id}`), {
          headers: JSON_HEADERS,
          tags: { name: 'menu_item_detail' },
        });
        check(res, {
          'item detail: 200': (r) => r.status === 200,
          'item detail: has price': (r) => parseBody(r)?.price != null,
        });
      });
      sleep(1);
    }

    // 6. Delivery zones + estimate
    group('delivery_zones', () => {
      const zonesRes = http.get(
        url(`/restaurants/${restaurant.id}/delivery-zones`),
        { headers: JSON_HEADERS, tags: { name: 'delivery_zones' } },
      );
      check(zonesRes, { 'delivery zones: 200': (r) => r.status === 200 });

      const estRes = http.get(
        url(`/restaurants/${restaurant.id}/delivery-zones/delivery-estimate?lat=10.7769&lon=106.7009`),
        { headers: JSON_HEADERS, tags: { name: 'delivery_estimate' } },
      );
      // 422 is valid when restaurant has no zone covering this coordinate
      check(estRes, {
        'delivery estimate: 200 or 422': (r) => r.status === 200 || r.status === 422,
      });
    });
    sleep(1);

    // 7. Active promotions
    group('promotions_active', () => {
      const res = http.get(
        url(`/promotions/active?restaurantId=${restaurant.id}`),
        { headers: JSON_HEADERS, tags: { name: 'promotions_active' } },
      );
      check(res, {
        'promotions active: 200': (r) => r.status === 200,
        'promotions active: is array': (r) => Array.isArray(parseBody(r)),
      });
    });
  }

  sleep(Math.random() * 3 + 1);
}
