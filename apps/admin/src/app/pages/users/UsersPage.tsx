import { Users } from 'lucide-react';

export function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="rounded-full bg-surface-container p-4 mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-on-surface">Users</h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        User management interface is coming soon.
      </p>
    </div>
  );
}
