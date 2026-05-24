import { Navigate } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';

export function RootRedirect() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  if (role === 'admin') return <Navigate to="/admin/restaurants" replace />;
  if (role === 'restaurant') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/pending-approval" replace />;
}
