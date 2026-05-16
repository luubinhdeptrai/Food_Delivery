import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import { notificationApi } from '../api';
import { useSession } from '@/src/lib/auth-client';

export function usePushToken() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      registerPushToken();
    }
  }, [session]);
}

async function registerPushToken() {
  try {
    // 1. Request permission (Expo)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    // 2. Get FCM token (Firebase)
    // Note: This requires the app to be correctly configured with google-services.json/GoogleService-Info.plist
    // If running in Expo Go, this might fail or require a dev client.
    let token: string;
    try {
      token = await messaging().getToken();
    } catch (error) {
      console.warn('[PushToken] Failed to get FCM token. Ensure Firebase is configured.', error);
      return;
    }

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    // 3. Register with backend
    await notificationApi.registerPushToken(token, platform);
    console.log('[PushToken] Registered successfully');

    // 4. Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
      try {
        await notificationApi.registerPushToken(newToken, platform);
      } catch (err) {
        console.error('[PushToken] Failed to refresh token:', err);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('[PushToken] Registration error:', error);
  }
}
