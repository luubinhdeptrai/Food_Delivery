type Point = { hour: string; today: number; baseline: number };

export function HourlyDensityChart({
  data,
  showBaseline,
}: {
  data: Point[];
  showBaseline: boolean;
}) {
  const max = Math.max(...data.flatMap((d) => [d.today, d.baseline]));

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Hourly Order Density
        </h3>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-primary" /> Today
          </span>
          {showBaseline && (
            <span className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-on-surface-variant/30" /> 7-day Average
            </span>
          )}
        </div>
      </div>

      <div className="relative h-64 w-full">
        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] font-mono text-on-surface-variant/70 pb-1">
          <span>{max}</span>
          <span>{Math.round(max * 0.75)}</span>
          <span>{Math.round(max * 0.5)}</span>
          <span>{Math.round(max * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="ml-10 h-[calc(100%-1.5rem)] border-l border-b border-outline-variant/40 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-full border-t border-outline-variant/15" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-around px-2">
            {data.map((point) => (
              <div key={point.hour} className="group flex items-end gap-1 h-full">
                <div
                  className="w-3 sm:w-4 bg-primary rounded-t-sm transition-all group-hover:brightness-110"
                  style={{ height: `${(point.today / max) * 100}%` }}
                  title={`Today · ${point.today}`}
                />
                {showBaseline && (
                  <div
                    className="w-3 sm:w-4 bg-on-surface-variant/25 rounded-t-sm transition-all group-hover:bg-on-surface-variant/40"
                    style={{ height: `${(point.baseline / max) * 100}%` }}
                    title={`Baseline · ${point.baseline}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="ml-10 mt-2 flex justify-around text-[11px] font-mono text-on-surface-variant uppercase">
          {data.map((p) => (
            <span key={p.hour}>{p.hour}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
