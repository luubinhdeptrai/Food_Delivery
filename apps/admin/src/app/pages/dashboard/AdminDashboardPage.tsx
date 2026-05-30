import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Store,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Clock,
  ChevronRight,
  BadgeDollarSign,
  HandCoins,
  Award,
  ExternalLink,
  Banknote,
  CalendarClock,
  CheckCircle,
  FileWarning,
} from 'lucide-react';
import { PlatformLoadChart } from '@/features/dashboard/components/PlatformLoadChart';
import { LiveOrderMap } from '@/features/dashboard/components/LiveOrderMap';
import {
  PLATFORM_KPIS,
  TOP_EARNERS,
  BOTTLENECKS,
  PENDING_APPROVALS,
  PENDING_PAYOUTS,
  formatVND,
} from '@/features/dashboard/mockData';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  subtext,
  delta,
  icon,
  accent,
}: {
  label: string;
  value: string;
  subtext?: string;
  delta?: { value: number; label: string };
  icon: React.ReactNode;
  accent?: boolean;
}) {
  const isPositive = (delta?.value ?? 0) >= 0;

  return (
    <div
      className={[
        'relative rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        accent
          ? 'bg-primary-container border-primary/20'
          : 'bg-surface-container-lowest border-outline-variant/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={[
            'flex h-9 w-9 items-center justify-center rounded-xl',
            accent ? 'bg-primary/15 text-on-primary-container' : 'bg-surface-container text-primary',
          ].join(' ')}
        >
          {icon}
        </span>
        {delta && (
          <span
            className={[
              'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
              isPositive
                ? 'bg-primary/10 text-primary'
                : 'bg-error/10 text-error',
            ].join(' ')}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{delta.value.toFixed(1)}{delta.label}
          </span>
        )}
      </div>

      <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${accent ? 'text-on-primary-container/70' : 'text-on-surface-variant'}`}>
        {label}
      </p>
      <p className={`font-headline font-extrabold text-3xl tracking-tight font-mono ${accent ? 'text-on-primary-container' : 'text-on-surface'}`}>
        {value}
      </p>
      {subtext && (
        <p className={`text-xs mt-2 font-medium ${accent ? 'text-on-primary-container/60' : 'text-on-surface-variant'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: 'critical' | 'warning' | 'info' }) {
  const map = {
    critical: { text: 'Critical', bg: 'bg-error/10 text-error border-error/20' },
    warning:  { text: 'Warning',  bg: 'bg-secondary-container/40 text-on-secondary-container border-secondary/20' },
    info:     { text: 'Watch',    bg: 'bg-surface-container text-on-surface-variant border-outline-variant' },
  };
  const s = map[severity];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg}`}>
      {s.text}
    </span>
  );
}

function ApprovalStatusBadge({ status }: { status: 'pending-review' | 'docs-missing' }) {
  if (status === 'pending-review') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
        <CheckCircle className="h-3 w-3" /> Pending Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container/40 text-on-secondary-container border border-secondary/20">
      <FileWarning className="h-3 w-3" /> Docs Missing
    </span>
  );
}

function PayoutStatusBadge({ status }: { status: 'ready' | 'processing' }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
        <CircleCheck className="h-3 w-3" /> Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant">
      <Clock className="h-3 w-3" /> Processing
    </span>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-headline font-bold text-base text-on-surface">{title}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminDashboardPage() {
  const [chartView, setChartView] = useState<'volume' | 'revenue'>('volume');

  const kpis = PLATFORM_KPIS;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pb-8">

      {/* Section 1: KPI cards */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/60">
            Platform Overview
          </span>
          <div className="h-px flex-1 bg-outline-variant/40" />
          <span className="font-mono text-[10px] text-on-surface-variant/40">
            Live — refreshes every 60s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Platform GMV"
            value={formatVND(kpis.gmv)}
            subtext="Total order value processed today"
            delta={{ value: kpis.gmvDelta, label: '%' }}
            icon={<BadgeDollarSign className="h-4 w-4" />}
            accent
          />
          <KpiCard
            label="Platform Revenue"
            value={formatVND(kpis.revenue)}
            subtext="Commission & platform fees (15%)"
            delta={{ value: kpis.revenueDelta, label: '%' }}
            icon={<HandCoins className="h-4 w-4" />}
          />
          <KpiCard
            label="Active Operations"
            value={String(kpis.restaurantsOnline)}
            subtext={`${kpis.restaurantsOffline} restaurants offline right now`}
            icon={<Store className="h-4 w-4" />}
          />
          <KpiCard
            label="Order Success Rate"
            value={`${kpis.orderSuccessRate}%`}
            subtext="Delivered vs total orders placed"
            delta={{ value: kpis.orderSuccessDelta, label: 'pp' }}
            icon={<CircleCheck className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Section 2: Chart + Map */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Platform Load */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5">
          <SectionHeader
            title="Live Platform Load"
            subtitle="Hourly orders and revenue — today"
            action={
              <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
                <button
                  onClick={() => setChartView('volume')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    chartView === 'volume' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Volume
                </button>
                <button
                  onClick={() => setChartView('revenue')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    chartView === 'revenue' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Revenue
                </button>
              </div>
            }
          />

          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-on-surface-variant">
              <span className="w-3 h-0.5 bg-primary inline-block rounded" /> Orders (left axis)
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-on-surface-variant">
              <span className="w-3 h-0.5 bg-secondary-container inline-block rounded border-dashed border-b border-current" /> Revenue ₫M (right axis)
            </span>
          </div>

          <PlatformLoadChart />
        </div>

        {/* System Heatmap */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5">
          <SectionHeader
            title="System Heatmap"
            subtitle="Live order density across Ho Chi Minh City"
          />
          <LiveOrderMap />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Active zones', value: '12' },
              { label: 'Peak district', value: 'Q.19' },
              { label: 'Hottest hour', value: '19:00' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container rounded-lg px-3 py-2 text-center">
                <p className="font-mono font-bold text-sm text-on-surface">{stat.value}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Leaderboards + Watchlist + Queue */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Earners */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5">
          <SectionHeader
            title="Top Earners"
            subtitle="By GMV this week"
            action={
              <button className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline">
                All <ChevronRight className="h-3 w-3" />
              </button>
            }
          />

          <ol className="space-y-2">
            {TOP_EARNERS.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors group"
              >
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black shrink-0',
                    r.rank === 1 ? 'bg-[#FFD700]/20 text-[#b8860b]'
                    : r.rank === 2 ? 'bg-surface-container-high text-on-surface-variant'
                    : r.rank === 3 ? 'bg-[#CD7F32]/15 text-[#8B4513]'
                    : 'bg-surface-container text-on-surface-variant/60',
                  ].join(' ')}
                >
                  {r.rank}
                </span>

                <span className="text-lg shrink-0">{r.logo}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate leading-tight">{r.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono">{r.orders} orders</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-sm text-on-surface">{formatVND(r.gmv)}</p>
                  <p className={`text-[11px] font-mono font-semibold ${r.trend >= 0 ? 'text-primary' : 'text-error'}`}>
                    {r.trend >= 0 ? '+' : ''}{r.trend}%
                  </p>
                </div>

                {r.rank === 1 && (
                  <Award className="h-4 w-4 text-[#FFD700] shrink-0" />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Operational Bottlenecks */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5">
          <SectionHeader
            title="Bottleneck Watchlist"
            subtitle="High cancellation or slow prep"
            action={
              <AlertTriangle className="h-4 w-4 text-secondary-container" />
            }
          />

          <div className="space-y-2">
            {BOTTLENECKS.map((b) => (
              <div
                key={b.id}
                className={[
                  'p-3 rounded-xl border',
                  b.severity === 'critical'
                    ? 'bg-error/5 border-error/15'
                    : b.severity === 'warning'
                    ? 'bg-secondary-container/10 border-secondary/15'
                    : 'bg-surface-container border-outline-variant/40',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-on-surface leading-tight">{b.name}</p>
                  <SeverityBadge severity={b.severity} />
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  {b.issue === 'high-cancel' ? (
                    <span className="flex items-center gap-1 text-error">
                      <CircleX className="h-3 w-3" />
                      {b.cancelRate}% cancel rate
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <Clock className="h-3 w-3" />
                      {b.avgPrepMin}m avg prep
                    </span>
                  )}
                  <span className="text-on-surface-variant">{b.ordersToday} orders today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals + Payouts */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-5">

          {/* Pending Approvals */}
          <div>
            <SectionHeader
              title="Pending Approvals"
              subtitle={`${PENDING_APPROVALS.length} awaiting review`}
            />
            <div className="space-y-2">
              {PENDING_APPROVALS.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate leading-tight">{a.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{a.category} · {a.district}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ApprovalStatusBadge status={a.status} />
                    <button className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline">
                      Review <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant/30" />

          {/* Pending Payouts */}
          <div>
            <SectionHeader
              title="Pending Payouts"
              subtitle="Week 21 — processing queue"
              action={
                <Banknote className="h-4 w-4 text-on-surface-variant" />
              }
            />
            <div className="space-y-2">
              {PENDING_PAYOUTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low"
                >
                  <CalendarClock className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate leading-tight">{p.name}</p>
                    <p className="font-mono text-xs text-primary font-bold">{formatVND(p.amount)}</p>
                  </div>
                  <PayoutStatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
