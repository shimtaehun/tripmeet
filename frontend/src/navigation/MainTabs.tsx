import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import MatchingScreen from '../screens/matching/MatchingScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CompanionScreen from '../screens/companion/CompanionScreen';
import RestaurantListScreen from '../screens/restaurant/RestaurantListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Colors } from '../utils/theme';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: string;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  activeColor: string;
  component: React.ComponentType<any>;
}[] = [
  {
    name: 'Home',
    label: '홈',
    icon: 'home-outline',
    iconActive: 'home',
    activeColor: Colors.primary,
    component: HomeScreen,
  },
  {
    name: 'Matching',
    label: '매칭',
    icon: 'location-outline',
    iconActive: 'location',
    activeColor: Colors.green,
    component: MatchingScreen,
  },
  {
    name: 'Community',
    label: '커뮤니티',
    icon: 'chatbubbles-outline',
    iconActive: 'chatbubbles',
    activeColor: Colors.primary,
    component: CommunityScreen,
  },
  {
    name: 'Restaurant',
    label: '맛집',
    icon: 'restaurant-outline',
    iconActive: 'restaurant',
    activeColor: Colors.red,
    component: RestaurantListScreen,
  },
  {
    name: 'Companion',
    label: '동행',
    icon: 'people-outline',
    iconActive: 'people',
    activeColor: Colors.amber,
    component: CompanionScreen,
  },
  {
    name: 'Profile',
    label: '내 정보',
    icon: 'person-outline',
    iconActive: 'person',
    activeColor: Colors.primary,
    component: ProfileScreen,
  },
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
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            const iconName = focused ? (tab?.iconActive ?? tab?.icon) : tab?.icon;
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      width: 32,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: color,
                    }}
                  />
                )}
                <Ionicons name={iconName ?? 'ellipse-outline'} size={22} color={color} />
              </View>
            );
          },
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
