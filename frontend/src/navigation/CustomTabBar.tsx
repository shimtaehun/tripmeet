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

// 탭별 아이콘/레이블 메타데이터
const TAB_META: Record<string, {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
  activeColor: string;
}> = {
  Home:       { label: '홈',      icon: 'home-outline',        iconActive: 'home',        activeColor: Colors.primary },
  Matching:   { label: '매칭',    icon: 'location-outline',    iconActive: 'location',    activeColor: Colors.green   },
  Community:  { label: '커뮤니티', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', activeColor: Colors.primary },
  Restaurant: { label: '맛집',    icon: 'restaurant-outline',  iconActive: 'restaurant',  activeColor: Colors.red     },
  Companion:  { label: '동행',    icon: 'people-outline',      iconActive: 'people',      activeColor: Colors.amber   },
  Itinerary:  { label: 'AI 일정', icon: 'sparkles-outline',    iconActive: 'sparkles',    activeColor: '#7C3AED'      },
  Profile:    { label: '내 정보', icon: 'person-outline',      iconActive: 'person',      activeColor: Colors.primary },
};

// ─── 데스크톱 전용 상단 네비게이션 바 ─────────────────────────────
function WebTopNav({ state, navigation }: Pick<BottomTabBarProps, 'state' | 'navigation'>) {
  return (
    <View style={webStyles.container}>

      {/* 로고 */}
      <TouchableOpacity
        style={webStyles.logo}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Ionicons name="airplane" size={16} color={Colors.primary} />
        <Text style={webStyles.logoText}>TripMeet</Text>
      </TouchableOpacity>

      {/* 네비게이션 탭 목록 */}
      <View style={webStyles.navItems}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            // React Navigation 표준 탭 전환 이벤트 발행
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                webStyles.navItem,
                isFocused && webStyles.navItemActive,
              ]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={meta.label}
            >
              <Text
                style={[
                  webStyles.navItemText,
                  isFocused && webStyles.navItemTextActive,
                ]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

// ─── 모바일 전용 하단 탭바 ─────────────────────────────────────────
function MobileBottomBar({ state, navigation, descriptors }: BottomTabBarProps) {
  return (
    <View style={mobileStyles.container}>
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;

        const isFocused = state.index === index;
        const color = isFocused ? meta.activeColor : Colors.tabInactive;
        const iconName = isFocused ? meta.iconActive : meta.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // descriptors에서 tabBarLabel 옵션 확인
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
                colors={Gradients.indigo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={mobileStyles.iconWrapActive}
              >
                <Ionicons name={iconName} size={20} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={mobileStyles.iconWrap}>
                <Ionicons name={iconName} size={22} color={color} />
              </View>
            )}
            <Text style={[mobileStyles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── 메인 내보내기 — 화면 너비에 따라 분기 ─────────────────────────
export default function CustomTabBar(props: BottomTabBarProps) {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return <WebTopNav state={props.state} navigation={props.navigation} />;
  }

  return <MobileBottomBar {...props} />;
}

// ─── 데스크톱 상단 네비 스타일 ───────────────────────────────────────
const webStyles = StyleSheet.create({
  // position: absolute로 화면 최상단에 고정
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_NAV_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 100,
    // 웹에서만 backdrop-filter blur 적용
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
    ...Shadow.sm,
  },

  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 40,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },

  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },

  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },

  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },

  navItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textMedium,
  },

  navItemTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});

// ─── 모바일 하단 탭바 스타일 ─────────────────────────────────────────
const mobileStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    // 상단 인디고 그라디언트 라인 효과 — borderTop 대신 box-shadow 활용
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  // 활성 탭 아이콘 — 인디고 그라디언트 배경
  iconWrapActive: {
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 2,
  },
});
