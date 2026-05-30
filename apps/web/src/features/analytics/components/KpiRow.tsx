import type { KitchenKpi } from '@/features/analytics/mockData';

type Direction = KitchenKpi['supporting'][number]['deltaDirection'];

function deltaPresentation(direction: Direction) {
  switch (direction) {
    case 'up':
      return {
        // "up" here means the metric went up — for time/refund metrics that's usually worse
        bg: 'bg-error-container/40',
        text: 'text-error',
        icon: 'arrow_upward',
      };
    case 'down':
      return {
        bg: 'bg-primary/10',
        text: 'text-primary',
        icon: 'arrow_downward',
      };
    case 'flat':
      return {
        bg: 'bg-surface-container',
        text: 'text-on-surface-variant',
        icon: 'horizontal_rule',
      };
    case 'perfect':
      return {
        bg: 'bg-primary/10',
        text: 'text-primary',
        icon: 'check_circle',
      };
  }
}

export function KpiRow({ kpi }: { kpi: KitchenKpi }) {
  const heroDelta = deltaPresentation(
    // Hero is "time to accept" — going down = good, up = bad.
    kpi.hero.deltaDirection === 'down' ? 'down' : kpi.hero.deltaDirection === 'up' ? 'up' : 'flat',
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Hero KPI */}
      <article className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-1">
            Kitchen Velocity
          </p>
          <p className="text-sm text-on-surface-variant">{kpi.hero.label}</p>
        </div>
        <div className="relative z-10 mt-6 flex items-baseline justify-between gap-3 flex-wrap">
          <span className="font-headline font-bold text-4xl md:text-5xl text-on-surface font-mono tracking-tight">
            {kpi.hero.value}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${heroDelta.bg} ${heroDelta.text}`}
          >
            <span className="material-symbols-outlined text-[16px]">{heroDelta.icon}</span>
            {kpi.hero.deltaLabel}
          </span>
        </div>

        {/* Decorative sparkline background */}
        <svg
          className="absolute bottom-0 left-0 right-0 h-20 z-0 opacity-60"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="hero-spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0d631b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0d631b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C20,80 40,90 60,40 C80,-10 90,60 100,20 L100,100 Z"
            fill="url(#hero-spark)"
          />
        </svg>
      </article>

      {/* Supporting trio */}
      <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {kpi.supporting.map((card) => {
          const delta = deltaPresentation(card.deltaDirection);
          return (
            <article
              key={card.label}
              className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6 flex flex-col justify-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">
                {card.label}
              </p>
              <p className="font-headline font-bold text-2xl text-on-surface font-mono tracking-tight mb-3">
                {card.value}
              </p>
              <div className={`inline-flex items-center gap-1 text-xs font-semibold ${delta.text}`}>
                <span className="material-symbols-outlined text-[16px]">{delta.icon}</span>
                <span>{card.deltaLabel}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
