import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import MatchingScreen from '../screens/matching/MatchingScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CompanionScreen from '../screens/companion/CompanionScreen';
import RestaurantListScreen from '../screens/restaurant/RestaurantListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ItineraryFormScreen from '../screens/itinerary/ItineraryFormScreen';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      // CustomTabBar가 모바일/데스크톱 분기를 처리
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // 각 탭의 lazy loading — 성능 최적화
        lazy: true,
      }}
    >
      <Tab.Screen name="Home"       component={HomeScreen}           options={{ tabBarLabel: '홈'       }} />
      <Tab.Screen name="Matching"   component={MatchingScreen}       options={{ tabBarLabel: '매칭'     }} />
      <Tab.Screen name="Community"  component={CommunityScreen}      options={{ tabBarLabel: '커뮤니티' }} />
      <Tab.Screen name="Restaurant" component={RestaurantListScreen} options={{ tabBarLabel: '맛집'     }} />
      <Tab.Screen name="Companion"  component={CompanionScreen}      options={{ tabBarLabel: '동행'     }} />
      <Tab.Screen name="Itinerary"  component={ItineraryFormScreen}  options={{ tabBarLabel: 'AI 일정'  }} />
      <Tab.Screen name="ChatList"   component={ChatListScreen}       options={{ tabBarLabel: '채팅'     }} />
      <Tab.Screen name="Profile"    component={ProfileScreen}        options={{ tabBarLabel: '내 정보'  }} />
    </Tab.Navigator>
  );
}
