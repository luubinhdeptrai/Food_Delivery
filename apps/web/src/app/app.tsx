import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './provider';
import { router } from './router';
import { Sentry } from '@/lib/observability';
import { AnalyticsProvider } from '@/lib/analytics';

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

export function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <AppProvider>
        <AnalyticsProvider>
          <RouterProvider router={router} />
        </AnalyticsProvider>
      </AppProvider>
    </Sentry.ErrorBoundary>
  );
}
