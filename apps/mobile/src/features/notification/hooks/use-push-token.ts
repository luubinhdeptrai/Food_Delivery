import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getMessaging, getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { notificationApi } from '../api';
import { useSession } from '@/src/lib/auth-client';
import { useNotificationStore } from '@/src/store/notification-store';

export function usePushToken() {
  const { data: session } = useSession();
  const setPushToken = useNotificationStore((state) => state.setPushToken);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (session) {
      registerPushToken(setPushToken)
        .then((unsub) => {
          unsubscribe = unsub;
        })
        .catch((error) => {
          console.error('[PushToken] registerPushToken failed', error);
        });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [session, setPushToken]);
}

async function registerPushToken(setPushToken: (token: string) => void) {
  try {
    // 0. Create channel (Required for Android 13+ permission prompt to show)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // 1. Request permission (Expo)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn(`[PushToken] Notification permission denied. Final status: ${finalStatus}`);
      return;
    }

    // 2. Get FCM token (Firebase)
    const messaging = getMessaging();
    let token: string;
    try {
      token = await getToken(messaging);
      setPushToken(token);
    } catch (error) {
      console.warn('[PushToken] Failed to get FCM token. Ensure Firebase is configured.', error);
      return;
    }

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    // 3. Register with backend
    await notificationApi.registerPushToken(token, platform);
    console.log('[PushToken] Registered successfully. Token:', token);

    // 4. Listen for token refresh
    const unsubscribe = onTokenRefresh(messaging, async (newToken) => {
      try {
        setPushToken(newToken);
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