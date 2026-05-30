import { type ReactNode } from 'react';

type AnalyticsValue = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsValue>;

/**
 * Tracks a mobile analytics event.
 * Analytics have been removed; this is a no-op stub kept for API compatibility.
 */
export function trackMobileEvent(
  _name: string,
  _properties?: AnalyticsProperties,
): void {
  // no-op – PostHog removed
}

/**
 * Associates subsequent events with the given user ID.
 * Analytics have been removed; this is a no-op stub kept for API compatibility.
 */
export function identifyMobileUser(_userId: string | undefined): void {
  // no-op – PostHog removed
}

/**
 * Resets the current analytics identity (e.g. on sign-out).
 * Analytics have been removed; this is a no-op stub kept for API compatibility.
 */
export function resetMobileAnalyticsIdentity(): void {
  // no-op – PostHog removed
}

/**
 * Wraps children with the analytics provider context.
 * Analytics have been removed; this is a simple passthrough kept for API compatibility.
 */
export function MobileAnalyticsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
