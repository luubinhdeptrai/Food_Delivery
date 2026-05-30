/**
 * Demo data for the Operational Analytics page.
 * Replace these once the analytics API endpoints land.
 */

export type RangeKey = 'today' | 'yesterday' | '7d';

export type OperationalState = {
  status: 'healthy' | 'attention' | 'critical';
  headline: string;
  detail: string;
  highlight: string;
  sparkline: number[];
};

export type KitchenKpi = {
  hero: {
    label: string;
    value: string;
    deltaLabel: string;
    deltaDirection: 'up' | 'down' | 'flat';
  };
  supporting: Array<{
    label: string;
    value: string;
    deltaLabel: string;
    deltaDirection: 'up' | 'down' | 'flat' | 'perfect';
  }>;
};

export type FailureSegment = {
  label: string;
  count: number;
  /** raw hex used for swatches & arc strokes */
  color: string;
};

export type Incident = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  state: 'pending' | 'resolved';
};

export type SlowItem = {
  name: string;
  avgPrep: string;
};

export const ANALYTICS_DATA: Record<
  RangeKey,
  {
    operationalState: OperationalState;
    kitchenKpi: KitchenKpi;
    timeToAcceptBuckets: number[];
    failureSegments: FailureSegment[];
    hourlyDensity: Array<{ hour: string; today: number; baseline: number }>;
    refundRateSeries: number[];
    slowItems: SlowItem[];
    incidents: Incident[];
  }
> = {
  today: {
    operationalState: {
      status: 'healthy',
      headline: 'Operations are running smoothly',
      detail: 'Kitchen is running {highlight} than your 7-day baseline. No stuck orders.',
      highlight: '22 seconds faster',
      sparkline: [25, 22, 18, 25, 22, 15, 18, 20, 15, 20],
    },
    kitchenKpi: {
      hero: {
        label: 'Average time to accept',
        value: '2m 47s',
        deltaLabel: '18s faster',
        deltaDirection: 'down',
      },
      supporting: [
        { label: 'Time to Ready', value: '11m 04s', deltaLabel: 'Stable vs baseline', deltaDirection: 'flat' },
        { label: 'Refund Rate', value: '1.4%', deltaLabel: '0.2% improvement', deltaDirection: 'down' },
        { label: 'Auto-Cancel Rate', value: '0.0%', deltaLabel: 'Perfect', deltaDirection: 'perfect' },
      ],
    },
    timeToAcceptBuckets: [40, 55, 75, 90, 65, 45, 30, 15],
    failureSegments: [
      { label: 'Kitchen Cancel', count: 42, color: '#0d631b' },
      { label: 'Driver No-show', count: 24, color: '#3FB37F' },
      { label: 'Out of Stock', count: 12, color: '#D69E2E' },
      { label: 'Other', count: 8, color: '#bfcaba' },
    ],
    hourlyDensity: [
      { hour: '12am', today: 20, baseline: 15 },
      { hour: '4am', today: 28, baseline: 22 },
      { hour: '8am', today: 45, baseline: 35 },
      { hour: '11am', today: 75, baseline: 60 },
      { hour: '1pm', today: 85, baseline: 80 },
      { hour: '4pm', today: 65, baseline: 70 },
      { hour: '7pm', today: 92, baseline: 78 },
      { hour: '9pm', today: 40, baseline: 45 },
      { hour: '11pm', today: 30, baseline: 25 },
    ],
    refundRateSeries: [1.6, 1.4, 1.5, 0.9, 1.3, 1.45, 1.55, 1.2, 1.4],
    slowItems: [
      { name: 'Phở Bò Tái', avgPrep: '14m 22s' },
      { name: 'Bún Bò Huế', avgPrep: '12m 48s' },
      { name: 'Cơm Tấm Sườn', avgPrep: '11m 30s' },
      { name: 'Bánh Mì Thịt', avgPrep: '08m 11s' },
      { name: 'Gỏi Cuốn', avgPrep: '04m 02s' },
    ],
    incidents: [
      {
        id: 'inc-1',
        timestamp: '14:28:11',
        title: 'Batch order spike from DoorDash',
        detail: 'Kitchen queue extended by 4m. High volume detected in Section B.',
        state: 'pending',
      },
      {
        id: 'inc-2',
        timestamp: '14:15:02',
        title: 'Driver cancellation for Order #8292',
        detail: 'Refund processed automatically. Prep was at 80% completion.',
        state: 'pending',
      },
      {
        id: 'inc-3',
        timestamp: '13:50:55',
        title: 'Auto-timeout risk for Order #8280',
        detail: 'Acceptance threshold reached. Manual intervention logged.',
        state: 'resolved',
      },
    ],
  },
  yesterday: {
    operationalState: {
      status: 'attention',
      headline: 'A small spike, but recovered',
      detail: 'Kitchen ran {highlight} versus baseline during the 7pm rush.',
      highlight: '38 seconds slower',
      sparkline: [22, 28, 32, 38, 35, 40, 30, 28, 25, 22],
    },
    kitchenKpi: {
      hero: {
        label: 'Average time to accept',
        value: '3m 25s',
        deltaLabel: '38s slower',
        deltaDirection: 'up',
      },
      supporting: [
        { label: 'Time to Ready', value: '12m 18s', deltaLabel: '1m 14s slower', deltaDirection: 'up' },
        { label: 'Refund Rate', value: '1.8%', deltaLabel: '0.4% worse', deltaDirection: 'up' },
        { label: 'Auto-Cancel Rate', value: '0.3%', deltaLabel: '2 incidents', deltaDirection: 'up' },
      ],
    },
    timeToAcceptBuckets: [30, 45, 60, 75, 88, 70, 50, 35],
    failureSegments: [
      { label: 'Kitchen Cancel', count: 28, color: '#0d631b' },
      { label: 'Driver No-show', count: 34, color: '#3FB37F' },
      { label: 'Out of Stock', count: 18, color: '#D69E2E' },
      { label: 'Other', count: 6, color: '#bfcaba' },
    ],
    hourlyDensity: [
      { hour: '12am', today: 15, baseline: 18 },
      { hour: '4am', today: 22, baseline: 24 },
      { hour: '8am', today: 38, baseline: 40 },
      { hour: '11am', today: 70, baseline: 68 },
      { hour: '1pm', today: 78, baseline: 80 },
      { hour: '4pm', today: 60, baseline: 65 },
      { hour: '7pm', today: 95, baseline: 75 },
      { hour: '9pm', today: 55, baseline: 50 },
      { hour: '11pm', today: 32, baseline: 28 },
    ],
    refundRateSeries: [1.4, 1.6, 1.8, 1.7, 2.0, 1.9, 1.85, 1.7, 1.8],
    slowItems: [
      { name: 'Phở Đặc Biệt', avgPrep: '15m 02s' },
      { name: 'Phở Bò Tái', avgPrep: '13m 44s' },
      { name: 'Bún Chả Hà Nội', avgPrep: '12m 15s' },
      { name: 'Cơm Tấm Sườn', avgPrep: '10m 50s' },
      { name: 'Gỏi Cuốn', avgPrep: '04m 28s' },
    ],
    incidents: [
      {
        id: 'inc-y1',
        timestamp: '19:14:08',
        title: 'Rush hour overflow, Station B',
        detail: 'Concurrent orders exceeded 14. Auto-throttle engaged.',
        state: 'resolved',
      },
      {
        id: 'inc-y2',
        timestamp: '18:42:21',
        title: 'Out-of-stock toggle for Phở Tái',
        detail: 'Item paused 22 minutes. 9 customers redirected.',
        state: 'resolved',
      },
    ],
  },
  '7d': {
    operationalState: {
      status: 'healthy',
      headline: 'Strong week — top quartile performance',
      detail: 'Kitchen accept time is {highlight} versus the previous 7-day window.',
      highlight: '12 seconds faster on average',
      sparkline: [28, 24, 22, 20, 22, 18, 20, 18, 16, 17],
    },
    kitchenKpi: {
      hero: {
        label: 'Average time to accept',
        value: '3m 02s',
        deltaLabel: '12s faster',
        deltaDirection: 'down',
      },
      supporting: [
        { label: 'Time to Ready', value: '11m 22s', deltaLabel: 'Stable vs prior week', deltaDirection: 'flat' },
        { label: 'Refund Rate', value: '1.5%', deltaLabel: '0.1% improvement', deltaDirection: 'down' },
        { label: 'Auto-Cancel Rate', value: '0.2%', deltaLabel: '4 incidents total', deltaDirection: 'flat' },
      ],
    },
    timeToAcceptBuckets: [35, 50, 70, 85, 70, 50, 35, 20],
    failureSegments: [
      { label: 'Kitchen Cancel', count: 188, color: '#0d631b' },
      { label: 'Driver No-show', count: 142, color: '#3FB37F' },
      { label: 'Out of Stock', count: 64, color: '#D69E2E' },
      { label: 'Other', count: 38, color: '#bfcaba' },
    ],
    hourlyDensity: [
      { hour: '12am', today: 18, baseline: 16 },
      { hour: '4am', today: 25, baseline: 22 },
      { hour: '8am', today: 42, baseline: 38 },
      { hour: '11am', today: 72, baseline: 65 },
      { hour: '1pm', today: 82, baseline: 78 },
      { hour: '4pm', today: 62, baseline: 60 },
      { hour: '7pm', today: 88, baseline: 80 },
      { hour: '9pm', today: 48, baseline: 45 },
      { hour: '11pm', today: 28, baseline: 26 },
    ],
    refundRateSeries: [1.7, 1.5, 1.4, 1.6, 1.55, 1.5, 1.45, 1.5, 1.5],
    slowItems: [
      { name: 'Phở Bò Tái', avgPrep: '13m 55s' },
      { name: 'Bún Bò Huế', avgPrep: '12m 30s' },
      { name: 'Cơm Tấm Sườn', avgPrep: '11m 12s' },
      { name: 'Bánh Mì Thịt', avgPrep: '08m 02s' },
      { name: 'Chả Giò', avgPrep: '05m 40s' },
    ],
    incidents: [
      {
        id: 'inc-w1',
        timestamp: 'Mon · 19:30',
        title: 'Two-driver no-show window',
        detail: 'Backup driver dispatched within 4 minutes. SLA preserved.',
        state: 'resolved',
      },
      {
        id: 'inc-w2',
        timestamp: 'Wed · 13:12',
        title: 'POS sync delay',
        detail: 'Kitchen tickets delayed 90s during peak. Cleared automatically.',
        state: 'resolved',
      },
      {
        id: 'inc-w3',
        timestamp: 'Fri · 20:08',
        title: 'Refund cluster — bánh mì batch',
        detail: '3 refunds tied to a single prep ticket. Trained staff retroactively.',
        state: 'resolved',
      },
    ],
  },
};
