import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/lib/auth-client';
import { resetAnalyticsIdentity } from '@/lib/analytics';
import { resetObservabilityUser } from '@/lib/observability';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      resetAnalyticsIdentity();
      resetObservabilityUser();
      queryClient.clear();
      navigate('/auth/login', { replace: true });
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
