import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Shadow, Animation, Spacing } from '../../utils/theme';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.round(H * 0.46);
const DEST_CARD_W = 148;
const DEST_CARD_H = 200;

// ─── 이미지 URLs (Unsplash) ───────────────────────────────────
const HERO_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

const QUICK_MENUS = [
  {
    icon: 'sparkles' as const,
    label: 'AI 일정',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    navigate: () => ({ type: 'screen' as const, name: 'ItineraryForm' }),
  },
  {
    icon: 'location' as const,
    label: '여행자 매칭',
    color: '#10B981',
    bg: '#ECFDF5',
    navigate: () => ({ type: 'tab' as const, name: 'Matching' }),
  },
  {
    icon: 'chatbubbles' as const,
    label: '커뮤니티',
    color: '#3B82F6',
    bg: '#EFF6FF',
    navigate: () => ({ type: 'tab' as const, name: 'Community' }),
  },
  {
    icon: 'restaurant' as const,
    label: '맛집',
    color: '#EF4444',
    bg: '#FEF2F2',
    navigate: () => ({ type: 'tab' as const, name: 'Restaurant' }),
  },
  {
    icon: 'people' as const,
    label: '동행 구인',
    color: '#F59E0B',
    bg: '#FFFBEB',
    navigate: () => ({ type: 'tab' as const, name: 'Companion' }),
  },
] as const;

const DESTINATIONS = [
  {
    city: '도쿄',
    country: '일본',
    count: '247명 여행 중',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
  },
  {
    city: '발리',
    country: '인도네시아',
    count: '156명 여행 중',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
  },
  {
    city: '파리',
    country: '프랑스',
    count: '134명 여행 중',
    img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
  },
  {
    city: '뉴욕',
    country: '미국',
    count: '98명 여행 중',
    img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
  },
  {
    city: '교토',
    country: '일본',
    count: '89명 여행 중',
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
  },
  {
    city: '바르셀로나',
    country: '스페인',
    count: '76명 여행 중',
    img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80',
  },
] as const;

// ─── 빠른 메뉴 아이템 ─────────────────────────────────────────
function QuickMenuItem({
  item,
  index,
  onPress,
}: {
  item: typeof QUICK_MENUS[number];
  index: number;
  onPress: () => void;
}) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const slideY   = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Animation.entrance,
        delay: 200 + index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        delay: 200 + index * 60,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityLabel={item.label}
        style={styles.quickItem}
      >
        <View style={[styles.quickIconWrap, { backgroundColor: item.bg }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Text style={styles.quickLabel} numberOfLines={1}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 인기 여행지 카드 ─────────────────────────────────────────
function DestCard({
  dest,
  index,
  onPress,
}: {
  dest: typeof DESTINATIONS[number];
  index: number;
  onPress: () => void;
}) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideX  = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Animation.entrance,
        delay: 300 + index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(slideX, {
        toValue: 0,
        delay: 300 + index * 70,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn  = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

  return (
    <Animated.View
      style={[
        styles.destCardWrap,
        { opacity, transform: [{ scale }, { translateX: slideX }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityLabel={`${dest.city} 여행 — ${dest.count}`}
      >
        <ImageBackground
          source={{ uri: dest.img }}
          style={styles.destCard}
          imageStyle={styles.destCardImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={styles.destOverlay}
          >
            <Text style={styles.destCity}>{dest.city}</Text>
            <Text style={styles.destCountry}>{dest.country}</Text>
            <View style={styles.destBadge}>
              <View style={styles.destDot} />
              <Text style={styles.destCount}>{dest.count}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroOpacity, {
      toValue: 1,
      duration: Animation.entrance,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleQuickPress = (item: typeof QUICK_MENUS[number]) => {
    const target = item.navigate();
    if (target.type === 'screen') {
      navigation.navigate(target.name);
    } else {
      navigation.navigate('Main', { screen: target.name });
    }
  };

  const handleDestPress = (city: string) => {
    navigation.navigate('Main', { screen: 'Matching' });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >

        {/* ── 히어로 섹션 ── */}
        <Animated.View style={{ opacity: heroOpacity }}>
          <ImageBackground
            source={{ uri: HERO_IMG }}
            style={styles.hero}
            resizeMode="cover"
            accessibilityLabel="여행 배경 이미지"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.55)']}
              style={styles.heroOverlay}
            >
              {/* 상단 로고 영역 */}
              <View style={styles.heroTop}>
                <View style={styles.logoBadge}>
                  <Ionicons name="airplane" size={14} color="#fff" />
                  <Text style={styles.logoText}>TripMeet</Text>
                </View>
                <TouchableOpacity
                  style={styles.notifBtn}
                  activeOpacity={0.8}
                  accessibilityLabel="알림"
                >
                  <Ionicons name="notifications-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* 히어로 텍스트 */}
              <View style={styles.heroBody}>
                <Text style={styles.heroGreeting}>어디로 떠나세요?</Text>
                <Text style={styles.heroSub}>전 세계 여행자와 함께하는 여행</Text>

                {/* 검색바 */}
                <TouchableOpacity
                  style={styles.searchBar}
                  onPress={() => navigation.navigate('LocationSelect')}
                  activeOpacity={0.9}
                  accessibilityLabel="여행지 검색"
                >
                  <Ionicons name="search-outline" size={18} color={Colors.textLight} />
                  <Text style={styles.searchPlaceholder}>도시를 검색하세요</Text>
                  <View style={styles.searchFilterBtn}>
                    <Ionicons name="options-outline" size={16} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* ── 빠른 메뉴 ── */}
        <View style={styles.quickSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            decelerationRate="fast"
          >
            {QUICK_MENUS.map((item, i) => (
              <QuickMenuItem
                key={item.label}
                item={item}
                index={i}
                onPress={() => handleQuickPress(item)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── AI 일정 배너 ── */}
        <View style={styles.aiBannerWrap}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ItineraryForm')}
            activeOpacity={0.88}
            accessibilityLabel="AI 여행 일정 만들기"
          >
            <LinearGradient
              colors={['#4C1D95', '#7C3AED', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiBanner}
            >
              <View style={styles.aiLeft}>
                <View style={styles.aiChip}>
                  <Text style={styles.aiChipText}>AI POWERED</Text>
                </View>
                <Text style={styles.aiBannerTitle}>맞춤 일정을 자동으로</Text>
                <Text style={styles.aiBannerSub}>목적지 · 기간 · 예산만 입력하세요</Text>
              </View>
              <View style={styles.aiRight}>
                <View style={styles.aiIconCircle}>
                  <Ionicons name="sparkles" size={26} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── 인기 여행지 ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>지금 핫한 여행지</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
            accessibilityLabel="여행지 전체 보기"
          >
            <Text style={styles.sectionMore}>전체 보기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destList}
          decelerationRate="fast"
          snapToInterval={DEST_CARD_W + 12}
          snapToAlignment="start"
        >
          {DESTINATIONS.map((dest, i) => (
            <DestCard
              key={dest.city}
              dest={dest}
              index={i}
              onPress={() => handleDestPress(dest.city)}
            />
          ))}
        </ScrollView>

        {/* ── GPS 안전 안내 ── */}
        <View style={styles.safetyRow}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={styles.safetyText}>
            위치 정보 직접 입력 방식 · GPS 미사용 · 개인정보 보호
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  // 히어로
  hero: {
    width: W,
    height: HERO_H,
  },
  heroOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingHorizontal: Spacing.screenPad,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
  },
  heroBody: {
    gap: 6,
  },
  heroGreeting: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400' as const,
    marginBottom: 14,
  },

  // 검색바
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.full,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 10,
    ...Shadow.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
    paddingVertical: 6,
  },
  searchFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 빠른 메뉴
  quickSection: {
    backgroundColor: Colors.card,
    paddingVertical: 20,
    ...Shadow.sm,
  },
  quickList: {
    paddingHorizontal: Spacing.screenPad,
    gap: 8,
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
    width: 68,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },

  // AI 배너
  aiBannerWrap: {
    marginHorizontal: Spacing.screenPad,
    marginTop: 20,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.blue,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  aiLeft: { flex: 1, gap: 4 },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 2,
  },
  aiChipText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  aiBannerTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.3,
  },
  aiBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  aiRight: {
    paddingLeft: 12,
  },
  aiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 섹션 헤더
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 28,
    paddingBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionMore: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },

  // 여행지 카드
  destList: {
    paddingHorizontal: Spacing.screenPad,
    gap: 12,
  },
  destCardWrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  destCard: {
    width: DEST_CARD_W,
    height: DEST_CARD_H,
  },
  destCardImage: {
    borderRadius: Radius.xl,
  },
  destOverlay: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: 14,
    justifyContent: 'flex-end',
  },
  destCity: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  destCountry: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  destBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  destDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  destCount: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600' as const,
  },

  // 안전 안내
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 20,
  },
  safetyText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '400' as const,
  },
});
