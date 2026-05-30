import type { Incident } from '@/features/analytics/mockData';

export function IncidentsList({ incidents }: { incidents: Incident[] }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-outline-variant bg-surface-container flex items-center gap-3">
        <span className="material-symbols-outlined text-on-surface-variant">warning</span>
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Recent Operational Incidents
        </h3>
      </header>

      <ul className="divide-y divide-outline-variant">
        {incidents.map((incident) => (
          <li
            key={incident.id}
            className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-start gap-5 min-w-0">
              <span className="font-mono text-xs text-on-surface-variant pt-0.5 shrink-0">
                {incident.timestamp}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {incident.title}
                </p>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                  {incident.detail}
                </p>
              </div>
            </div>

            {incident.state === 'resolved' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full shrink-0">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Resolved
              </span>
            ) : (
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-sm shrink-0"
              >
                Investigate
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
