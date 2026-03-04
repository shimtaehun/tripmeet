import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabaseClient';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import LandingScreen from '../screens/landing/LandingScreen';
import PostCreateScreen from '../screens/community/PostCreateScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import RestaurantCreateScreen from '../screens/restaurant/RestaurantCreateScreen';
import RestaurantDetailScreen from '../screens/restaurant/RestaurantDetailScreen';
import CompanionCreateScreen from '../screens/companion/CompanionCreateScreen';
import CompanionDetailScreen from '../screens/companion/CompanionDetailScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import ItineraryFormScreen from '../screens/itinerary/ItineraryFormScreen';
import ItineraryResultScreen from '../screens/itinerary/ItineraryResultScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import LocationSelectScreen from '../screens/matching/LocationSelectScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Main: {
        path: '',
        screens: {
          Home: '',
          Matching: 'matching',
          Community: 'community',
          Restaurant: 'restaurant',
          Companion: 'companion',
          Profile: 'profile',
        },
      },
      PostCreate: 'post/create',
      PostDetail: 'post/:postId',
      RestaurantCreate: 'restaurant/create',
      RestaurantDetail: 'restaurant/:restaurantId',
      CompanionCreate: 'companion/create',
      CompanionDetail: 'companion/:companionId',
      ProfileEdit: 'profile/edit',
      ItineraryForm: 'itinerary/form',
      ItineraryResult: 'itinerary/result',
      Chat: 'chat',
      LocationSelect: 'location/select',
    },
  },
};

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
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // onAuthStateChange는 구독 즉시 INITIAL_SESSION 이벤트를 발생시키므로
    // getSession()을 별도로 호출하지 않아도 초기 세션을 받을 수 있다.
    // getSession()과 병렬로 쓰면 레이스 컨디션이 발생할 수 있어 단독으로 사용한다. (Supabase v2 권장 패턴)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
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

  // 세션 없고 랜딩을 아직 안 지나친 경우: 랜딩 페이지 표시
  if (!session && showLanding) {
    return <LandingScreen onStart={() => setShowLanding(false)} />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="PostCreate" component={PostCreateScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="RestaurantCreate" component={RestaurantCreateScreen} />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <Stack.Screen name="CompanionCreate" component={CompanionCreateScreen} />
            <Stack.Screen name="CompanionDetail" component={CompanionDetailScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="ItineraryForm" component={ItineraryFormScreen} />
            <Stack.Screen name="ItineraryResult" component={ItineraryResultScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
