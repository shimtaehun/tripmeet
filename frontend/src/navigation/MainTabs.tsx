import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import MatchingScreen from '../screens/matching/MatchingScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CompanionScreen from '../screens/companion/CompanionScreen';
import RestaurantListScreen from '../screens/restaurant/RestaurantListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Colors } from '../utils/theme';

const Tab = createBottomTabNavigator();

function icon(emoji: string, focused: boolean) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => icon('🏠', focused),
        }}
      />
      <Tab.Screen
        name="Matching"
        component={MatchingScreen}
        options={{
          tabBarLabel: '매칭',
          tabBarIcon: ({ focused }) => icon('📍', focused),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: '커뮤니티',
          tabBarIcon: ({ focused }) => icon('💬', focused),
        }}
      />
      <Tab.Screen
        name="Restaurant"
        component={RestaurantListScreen}
        options={{
          tabBarLabel: '맛집',
          tabBarIcon: ({ focused }) => icon('🍜', focused),
        }}
      />
      <Tab.Screen
        name="Companion"
        component={CompanionScreen}
        options={{
          tabBarLabel: '동행',
          tabBarIcon: ({ focused }) => icon('🤝', focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ focused }) => icon('👤', focused),
        }}
      />
    </Tab.Navigator>
  );
}
