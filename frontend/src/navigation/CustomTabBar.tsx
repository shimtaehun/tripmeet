import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadow } from '../utils/theme';
import { useResponsive, TOP_NAV_H } from '../utils/responsive';

const TAB_META: Record<string, {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
  gradient: string[];
}> = {
  Home:       { label: '홈',       icon: 'home-outline',        iconActive: 'home',        gradient: Gradients.primary   },
  Matching:   { label: '매칭',     icon: 'location-outline',    iconActive: 'location',    gradient: Gradients.matching  },
  Community:  { label: '커뮤니티',  icon: 'chatbubbles-outline', iconActive: 'chatbubbles', gradient: Gradients.community },
  Restaurant: { label: '맛집',     icon: 'restaurant-outline',  iconActive: 'restaurant',  gradient: Gradients.food      },
  Companion:  { label: '동행',     icon: 'people-outline',      iconActive: 'people',      gradient: Gradients.companion },
  Itinerary:  { label: 'AI 일정',  icon: 'sparkles-outline',    iconActive: 'sparkles',    gradient: Gradients.ai        },
  ChatList:   { label: '채팅',     icon: 'chatbubble-outline',  iconActive: 'chatbubble',  gradient: Gradients.chat      },
  Profile:    { label: '내 정보',  icon: 'person-outline',      iconActive: 'person',      gradient: Gradients.profile   },
};

function WebTopNav({ state, navigation }: Pick<BottomTabBarProps, 'state' | 'navigation'>) {
  return (
    <View style={webStyles.container}>
      <TouchableOpacity
        style={webStyles.logo}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={webStyles.logoIcon}
        >
          <Ionicons name="airplane" size={13} color="#fff" />
        </LinearGradient>
        <Text style={webStyles.logoText}>TripMeet</Text>
      </TouchableOpacity>

      <View style={webStyles.navItems}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[webStyles.navItem, isFocused && webStyles.navItemActive]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={meta.label}
            >
              <Text style={[webStyles.navItemText, isFocused && webStyles.navItemTextActive]}>
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MobileBottomBar({ state, navigation, descriptors }: BottomTabBarProps) {
  return (
    <View style={mobileStyles.wrapper}>
      <View style={mobileStyles.container}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const options = descriptors[route.key]?.options;
          const label = (options?.tabBarLabel as string | undefined) ?? meta.label;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={mobileStyles.tab}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              {isFocused ? (
                <LinearGradient
                  colors={meta.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={mobileStyles.iconWrapActive}
                >
                  <Ionicons name={meta.iconActive} size={18} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={mobileStyles.iconWrap}>
                  <Ionicons name={meta.icon} size={20} color={Colors.tabInactive} />
                </View>
              )}
              <Text style={[mobileStyles.label, { color: isFocused ? Colors.primary : Colors.tabInactive }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CustomTabBar(props: BottomTabBarProps) {
  const { isDesktop } = useResponsive();
  if (isDesktop) return <WebTopNav state={props.state} navigation={props.navigation} />;
  return <MobileBottomBar {...props} />;
}

const webStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_NAV_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(250,250,248,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,232,230,0.80)',
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any : {}),
    ...Shadow.sm,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 40,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  navItemTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});

const mobileStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...Shadow.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  iconWrapActive: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '600' as const,
  },
});
