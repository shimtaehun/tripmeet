import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabaseClient';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createStackNavigator();

// auth/callback 딥링크에서 code를 추출해 세션 교환
async function handleAuthCallback(url: string) {
  if (!url.includes('auth/callback')) return;
  const queryString = url.split('?')[1] ?? '';
  const params = new URLSearchParams(queryString);
  const code = params.get('code');
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
}

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 시작 시 기존 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 로그인/로그아웃 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // openAuthSessionAsync가 'cancel'을 반환해도 OS가 딥링크를 처리한 경우 대비
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthCallback(url);
    });

    // 딥링크로 앱이 시작된 경우 처리
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthCallback(url);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
