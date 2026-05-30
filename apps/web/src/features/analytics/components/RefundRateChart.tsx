const TIME_LABELS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

const W = 800;
const H = 200;
const PAD_X = 0;
const PAD_Y = 12;

export function RefundRateChart({ series }: { series: number[] }) {
  const max = Math.max(...series, 5); // critical band is >5%
  const min = 0;
  const stepX = (W - PAD_X * 2) / (series.length - 1);
  const points = series.map((v, i) => {
    const x = PAD_X + stepX * i;
    const y = PAD_Y + (1 - (v - min) / (max - min)) * (H - PAD_Y * 2);
    return { x, y, v };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${points.at(-1)!.x} ${H} L ${points[0].x} ${H} Z`;

  // Critical band — represents >5%
  const criticalY = PAD_Y + (1 - 5 / max) * (H - PAD_Y * 2);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Refund Rate Over Time
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          % of paid orders
        </span>
      </div>

      <div className="relative h-64">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient id="refund-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0d631b" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0d631b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Critical band ( > 5% ) */}
          <rect
            x={0}
            y={PAD_Y}
            width={W}
            height={Math.max(criticalY - PAD_Y, 0)}
            fill="#C44545"
            fillOpacity={0.06}
          />
          <line
            x1={0}
            x2={W}
            y1={criticalY}
            y2={criticalY}
            stroke="#C44545"
            strokeOpacity={0.35}
            strokeDasharray="4 4"
          />

          <path d={areaPath} fill="url(#refund-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#0d631b"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#0d631b"
              stroke="white"
              strokeWidth={1.5}
            >
              <title>{`${p.v.toFixed(1)}%`}</title>
            </circle>
          ))}
        </svg>

        <span className="absolute top-1 right-2 text-[10px] font-bold uppercase tracking-wide text-error/80">
          Critical Band &gt; 5%
        </span>
      </div>

      <div className="flex justify-between mt-2 text-[11px] font-mono text-on-surface-variant">
        {TIME_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </section>
  );
}
