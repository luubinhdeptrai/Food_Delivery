import { useImpersonation } from '@/features/admin/hooks/useImpersonation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const { isImpersonating, stopImpersonating } = useImpersonation();

  if (!isImpersonating) return null;

  const userName = session?.user?.name ?? session?.user?.email ?? 'a user';

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base">
          supervised_user_circle
        </span>
        <span>
          You are viewing as <strong>{userName}</strong>. Changes you make will
          affect their account.
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-amber-800 bg-transparent text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        onClick={stopImpersonating}
      >
        Exit Impersonation
      </Button>
    </div>
  );
}
