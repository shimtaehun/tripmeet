import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * 앱 시작 시 호출한다.
 * 푸시 알림 권한을 요청하고, 허용된 경우 Expo 푸시 토큰을 백엔드에 저장한다.
 * 웹 환경에서는 아무 작업도 하지 않는다.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await apiFetch(`${API_URL}/users/me/push-token`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ push_token: pushToken }),
    });
  } catch (e) {
    console.error('푸시 토큰 등록 오류:', e);
  }
}
