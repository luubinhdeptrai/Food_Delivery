import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './provider';
import { router } from './router';
import { Sentry } from '@/lib/observability';
import {
  AnalyticsProvider,
  identifyUser,
  resetAnalyticsIdentity,
} from '@/lib/analytics';
import { useSession } from '@/lib/auth-client';

function ErrorFallback() {
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <h1 className="text-xl font-semibold">Something went wrong.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Refresh the page or try again later.
      </p>
    </main>
  );
}

function ObservabilityIdentitySync() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending) return;

    if (userId) {
      identifyUser(userId);
      Sentry.setUser({ id: userId });
      return;
    }

    resetAnalyticsIdentity();
    Sentry.setUser(null);
  }, [userId, isPending]);

  return null;
}

export function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <AppProvider>
        <AnalyticsProvider>
          <ObservabilityIdentitySync />
          <RouterProvider router={router} />
        </AnalyticsProvider>
      </AppProvider>
    </Sentry.ErrorBoundary>
  );
}
