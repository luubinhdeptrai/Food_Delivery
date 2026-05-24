import { authClient, useSession } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export function useImpersonation() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isImpersonating = !!(session?.session as any)?.impersonatedBy;

  async function startImpersonating(userId: string) {
    await (authClient as any).admin.impersonateUser({ userId });
    await queryClient.invalidateQueries();
    navigate('/dashboard');
  }

  async function stopImpersonating() {
    await (authClient as any).admin.stopImpersonating();
    await queryClient.invalidateQueries();
    navigate('/admin/restaurants');
  }

  return { isImpersonating, startImpersonating, stopImpersonating };
}
