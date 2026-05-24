import { Navigate } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';

export function RootRedirect() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  return <Navigate to={role === 'admin' ? '/admin/restaurants' : '/dashboard'} replace />;
}
