import type { SlowItem } from '@/features/analytics/mockData';

export function SlowItemsTable({ items }: { items: SlowItem[] }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm p-6 h-full">
      <h3 className="font-headline text-lg font-bold text-on-surface mb-4">
        Slowest Items to Prep
      </h3>
      <div className="overflow-hidden rounded-lg border border-outline-variant">
        <table className="w-full">
          <thead className="bg-surface-container border-b border-outline-variant">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="text-left py-3 px-4">Item Name</th>
              <th className="text-right py-3 px-4">Avg Prep</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item) => (
              <tr key={item.name} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-on-surface">{item.name}</td>
                <td className="py-3 px-4 text-right font-mono text-sm text-on-surface-variant">
                  {item.avgPrep}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
