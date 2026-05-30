import type { OperationalState } from '@/features/analytics/mockData';

const STATUS_STYLES: Record<
  OperationalState['status'],
  { iconBg: string; iconText: string; icon: string; sparkColor: string }
> = {
  healthy: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    icon: 'speed',
    sparkColor: '#0d631b',
  },
  attention: {
    iconBg: 'bg-secondary-container/40',
    iconText: 'text-on-secondary-container',
    icon: 'warning',
    sparkColor: '#D69E2E',
  },
  critical: {
    iconBg: 'bg-error-container/40',
    iconText: 'text-error',
    icon: 'crisis_alert',
    sparkColor: '#C44545',
  },
};

export function OperationalStateBanner({ state }: { state: OperationalState }) {
  const style = STATUS_STYLES[state.status];

  const [before, after] = state.detail.split('{highlight}');

  const max = Math.max(...state.sparkline);
  const min = Math.min(...state.sparkline);
  const range = Math.max(max - min, 1);
  const points = state.sparkline
    .map((v, i) => {
      const x = (i / (state.sparkline.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 22 - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastX = 100;
  const lastY = 30 - ((state.sparkline.at(-1)! - min) / range) * 22 - 4;

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg}`}>
          <span className={`material-symbols-outlined text-[28px] ${style.iconText}`}>
            {style.icon}
          </span>
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-1">
            {state.headline}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {before}
            <span className="font-mono font-semibold text-primary">{state.highlight}</span>
            {after}
          </p>
        </div>
      </div>

      <div className="h-12 w-48 shrink-0">
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="banner-spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={style.sparkColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={style.sparkColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${points} 100,30 0,30`} fill="url(#banner-spark)" />
          <polyline
            points={points}
            fill="none"
            stroke={style.sparkColor}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r={2.2} fill={style.sparkColor} />
        </svg>
      </div>
    </section>
  );
}
