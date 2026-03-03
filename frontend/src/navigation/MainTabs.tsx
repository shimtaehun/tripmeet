import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import MatchingScreen from '../screens/matching/MatchingScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CompanionScreen from '../screens/companion/CompanionScreen';
import RestaurantListScreen from '../screens/restaurant/RestaurantListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Colors } from '../utils/theme';

const Tab = createBottomTabNavigator();

function TabIcon({
  emoji, focused, label, activeColor,
}: {
  emoji: string; focused: boolean; label: string; activeColor: string;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 4 }}>
      {focused ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: activeColor + '18',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: activeColor + '30',
          }}
        >
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 20, opacity: 0.45 }}>{emoji}</Text>
      )}
    </View>
  );
}

const TAB_CONFIG = [
  { name: 'Home',       emoji: '🏠', label: '홈',     activeColor: Colors.primary, component: HomeScreen },
  { name: 'Matching',   emoji: '📍', label: '매칭',   activeColor: Colors.green,   component: MatchingScreen },
  { name: 'Community',  emoji: '💬', label: '커뮤니티', activeColor: Colors.primary, component: CommunityScreen },
  { name: 'Restaurant', emoji: '🍜', label: '맛집',   activeColor: Colors.red,     component: RestaurantListScreen },
  { name: 'Companion',  emoji: '🤝', label: '동행',   activeColor: Colors.amber,   component: CompanionScreen },
  { name: 'Profile',    emoji: '👤', label: '내 정보', activeColor: Colors.primary, component: ProfileScreen },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TAB_CONFIG.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: tab?.activeColor ?? Colors.primary,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 9.5,
            fontWeight: '600',
            marginTop: 0,
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={tab?.emoji ?? '●'}
              focused={focused}
              label={tab?.label ?? ''}
              activeColor={tab?.activeColor ?? Colors.primary}
            />
          ),
        };
      }}
    >
      {TAB_CONFIG.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{ tabBarLabel: t.label }}
        />
      ))}
    </Tab.Navigator>
  );
}
