import { ClipboardList } from 'lucide-react';

export function OrdersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="rounded-full bg-surface-container p-4 mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-on-surface">Platform Orders</h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Cross-restaurant order monitoring is coming soon.
      </p>
    </div>
  );
}
