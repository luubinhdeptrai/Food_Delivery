import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import PostHog, { PostHogProvider, usePostHog } from 'posthog-react-native';

type AnalyticsValue = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsValue>;

const SENSITIVE_PROPERTY_PATTERN =
  /authorization|cookie|token|secret|password|pass|email|phone|address|card/i;

let client: PostHog | undefined;

function appVersion(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_APP_VERSION ??
    process.env.EXPO_PUBLIC_SENTRY_RELEASE ??
    Constants.expoConfig?.version
  );
}

function compactProperties(
  properties: Record<string, AnalyticsValue | undefined>,
): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as AnalyticsProperties;
}

function appMetadata(): AnalyticsProperties {
  return compactProperties({
    app_env:
      process.env.EXPO_PUBLIC_APP_ENV ??
      process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
      process.env.NODE_ENV,
    app_version: appVersion(),
    commit_sha: process.env.EXPO_PUBLIC_COMMIT_SHA,
    surface: 'mobile',
  });
}

function safeProperties(
  properties: Record<string, AnalyticsValue | undefined> = {},
): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        value !== undefined && !SENSITIVE_PROPERTY_PATTERN.test(key),
    ),
  ) as AnalyticsProperties;
}

export function getMobileAnalyticsClient(): PostHog | undefined {
  if (client) return client;

  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return undefined;

  client = new PostHog(apiKey, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    enableSessionReplay: false,
    captureAppLifecycleEvents: true,
    customStorage: AsyncStorage,
    customAppProperties: (properties) => ({
      ...properties,
      $app_version: appVersion() ?? properties.$app_version,
    }),
  });

  void client.register(appMetadata());
  return client;
}

export function trackMobileEvent(
  name: string,
  properties?: AnalyticsProperties,
): void {
  const posthog = getMobileAnalyticsClient();
  if (!posthog) return;

  void posthog.capture(name, {
    ...appMetadata(),
    ...safeProperties(properties),
  });
}

export function identifyMobileUser(userId: string | undefined): void {
  const posthog = getMobileAnalyticsClient();
  if (!posthog || !userId) return;
  posthog.identify(userId);
}

export function resetMobileAnalyticsIdentity(): void {
  getMobileAnalyticsClient()?.reset();
}

function MobileScreenTracker() {
  const pathname = usePathname();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;
    void posthog.screen(pathname, {
      ...appMetadata(),
      pathname,
    });
  }, [pathname, posthog]);

  return null;
}

export function MobileAnalyticsProvider({ children }: { children: ReactNode }) {
  const posthog = getMobileAnalyticsClient();
  if (!posthog) return <>{children}</>;

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{ captureScreens: false, captureTouches: false }}
      style={{ flex: 1 }}
    >
      <MobileScreenTracker />
      {children}
    </PostHogProvider>
  );
}
