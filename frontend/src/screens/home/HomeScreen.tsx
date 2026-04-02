import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Animation, Spacing, Typography } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

const HERO_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=85';

const QUICK_MENUS = [
  {
    icon: 'sparkles'    as const,
    label: 'AI 일정',
    gradient: ['#4C1D95', '#8B5CF6'] as string[],
    navigate: () => ({ type: 'screen' as const, name: 'Itinerary' }),
  },
  {
    icon: 'location'    as const,
    label: '여행자 매칭',
    gradient: ['#065F46', '#10B981'] as string[],
    navigate: () => ({ type: 'tab' as const, name: 'Matching' }),
  },
  {
    icon: 'chatbubbles' as const,
    label: '커뮤니티',
    gradient: ['#1E40AF', '#60A5FA'] as string[],
    navigate: () => ({ type: 'tab' as const, name: 'Community' }),
  },
  {
    icon: 'restaurant'  as const,
    label: '맛집',
    gradient: ['#9D174D', '#EC4899'] as string[],
    navigate: () => ({ type: 'tab' as const, name: 'Restaurant' }),
  },
  {
    icon: 'people'      as const,
    label: '동행 구인',
    gradient: ['#92400E', '#F59E0B'] as string[],
    navigate: () => ({ type: 'tab' as const, name: 'Companion' }),
  },
] as const;

const DESTINATIONS = [
  { city: '도쿄',       country: '일본',      count: '247명', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { city: '발리',       country: '인도네시아', count: '156명', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { city: '파리',       country: '프랑스',    count: '134명', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
  { city: '뉴욕',       country: '미국',      count: '98명',  img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80' },
  { city: '교토',       country: '일본',      count: '89명',  img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80' },
  { city: '바르셀로나',  country: '스페인',    count: '76명',  img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
] as const;

const NEARBY_TRAVELERS = [
  { name: '지민', age: 25, from: '서울', location: '도쿄', emoji: '😊', color: ['#F97316', '#FB923C'] as string[] },
  { name: '준혁', age: 28, from: '부산', location: '발리', emoji: '🧳', color: ['#6366F1', '#818CF8'] as string[] },
  { name: '수아',  age: 23, from: '인천', location: '파리', emoji: '✈️', color: ['#10B981', '#34D399'] as string[] },
];

const COMMUNITY_POSTS = [
  { category: '여행 꿀팁', title: '도쿄 1주일 혼자 다녀온 후기 — 진짜 절약법', likes: 142, comments: 38, time: '1시간 전', accent: '#6366F1' },
  { category: '질문',     title: '발리 우붓 vs 쿠타 — 첫 방문이면 어디가 좋을까요?', likes: 67, comments: 24, time: '3시간 전', accent: '#EC4899' },
];

const COMPANION_POSTS = [
  { dest: '도쿄', period: '3월 15~20일', desc: '시부야·아키하바라 위주 탐방, 20대 누구든 환영', emoji: '🗼', count: 2, gradient: ['#4338CA', '#6366F1'] as string[] },
  { dest: '발리', period: '4월 1~7일',   desc: '우붓 힐링 여행, 조용한 분위기 선호하는 분',   emoji: '🌴', count: 1, gradient: ['#065F46', '#10B981'] as string[] },
];

// ─── 빠른 메뉴 아이템 ─────────────────────────────────────────────────
function QuickMenuItem({
  item, index, isDesktop, onPress,
}: {
  item: typeof QUICK_MENUS[number];
  index: number;
  isDesktop: boolean;
  onPress: () => void;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const slideY     = useRef(new Animated.Value(20)).current;
  const hoverScale = useRef(new Animated.Value(1)).current;
  const hoverY     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: Animation.entrance, delay: 200 + index * 60, useNativeDriver: true }),
      Animated.spring(slideY,  { toValue: 0, delay: 200 + index * 60, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleMouseEnter = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.10, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: -5,   useNativeDriver: true, tension: 280 }),
    ]).start();
  };
  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: 0, useNativeDriver: true, tension: 280 }),
    ]).start();
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
      <Animated.View
        style={{ transform: [{ scale: hoverScale }, { translateY: hoverY }] }}
        {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          accessibilityLabel={item.label}
          style={[styles.quickItem, isDesktop && styles.quickItemDesktop]}
        >
          <LinearGradient
            colors={item.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.quickIconWrap, isDesktop && styles.quickIconWrapDesktop]}
          >
            <Ionicons name={item.icon} size={isDesktop ? 26 : 24} color="#fff" />
          </LinearGradient>
          <Text style={[styles.quickLabel, isDesktop && styles.quickLabelDesktop]} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── 인기 여행지 카드 ──────────────────────────────────────────────────
const DEST_RATINGS: Record<string, number> = {
  '도쿄': 4.8, '발리': 4.7, '파리': 4.6, '뉴욕': 4.5, '교토': 4.7, '바르셀로나': 4.6,
};

function DestCard({
  dest, index, cardW, cardH, onPress,
}: {
  dest: typeof DESTINATIONS[number];
  index: number;
  cardW: number;
  cardH: number;
  onPress: () => void;
}) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideX  = useRef(new Animated.Value(24)).current;
  const hoverY  = useRef(new Animated.Value(0)).current;
  const rating  = DEST_RATINGS[dest.city] ?? 4.5;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: Animation.entrance, delay: 300 + index * 70, useNativeDriver: true }),
      Animated.spring(slideX,  { toValue: 0, delay: 300 + index * 70, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();
  const handleMouseEnter = () => {
    if (Platform.OS !== 'web') return;
    Animated.spring(hoverY, { toValue: -7, useNativeDriver: true, tension: 280 }).start();
  };
  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    Animated.spring(hoverY, { toValue: 0, useNativeDriver: true, tension: 280 }).start();
  };

  return (
    <Animated.View
      style={[styles.destCardWrap, { width: cardW, opacity, transform: [{ scale }, { translateX: slideX }, { translateY: hoverY }] }]}
      {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityLabel={`${dest.city} 여행 — ${dest.count} 여행 중`}
      >
        <ImageBackground
          source={{ uri: dest.img }}
          style={{ width: cardW, height: cardH }}
          imageStyle={{ borderRadius: Radius.xl }}
          resizeMode="cover"
          accessibilityLabel={`${dest.city} 배경 이미지`}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.78)']}
            style={[styles.destOverlay, { height: cardH }]}
          >
            <View style={styles.destRatingRow}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.destRating}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.destCity}>{dest.city}</Text>
            <Text style={styles.destCountry}>{dest.country}</Text>
            <View style={styles.destBadge}>
              <View style={styles.destDot} />
              <Text style={styles.destCount}>{dest.count} 여행 중</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 근처 여행자 카드 ──────────────────────────────────────────────────
function TravelerCard({
  traveler, onPress,
}: {
  traveler: typeof NEARBY_TRAVELERS[number];
  onPress: () => void;
}) {
  const hoverScale = useRef(new Animated.Value(1)).current;
  const hoverY     = useRef(new Animated.Value(0)).current;
  const handleMouseEnter = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.02, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: -3,   useNativeDriver: true, tension: 280 }),
    ]).start();
  };
  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: 0, useNativeDriver: true, tension: 280 }),
    ]).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: hoverScale }, { translateY: hoverY }] }}
      {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <TouchableOpacity style={styles.travelerCard} onPress={onPress} activeOpacity={0.88}>
        <LinearGradient
          colors={traveler.color as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.travelerAvatar}
        >
          <Text style={{ fontSize: 22 }}>{traveler.emoji}</Text>
        </LinearGradient>
        <View style={styles.travelerInfo}>
          <Text style={styles.travelerName}>{traveler.name} · {traveler.age}세</Text>
          <Text style={styles.travelerFrom}>{traveler.from}에서</Text>
          <View style={styles.travelerStatusRow}>
            <View style={styles.travelerStatusDot} />
            <Text style={styles.travelerStatusText}>{traveler.location} 여행 중</Text>
          </View>
        </View>
        <LinearGradient
          colors={traveler.color as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatChip}
        >
          <Ionicons name="chatbubble-outline" size={12} color="#fff" />
          <Text style={styles.chatChipText}>채팅</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 커뮤니티 글 카드 ──────────────────────────────────────────────────
function PostCard({
  post, onPress,
}: {
  post: typeof COMMUNITY_POSTS[number];
  onPress: () => void;
}) {
  const hoverScale = useRef(new Animated.Value(1)).current;
  const hoverY     = useRef(new Animated.Value(0)).current;
  const handleMouseEnter = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.02, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: -3,   useNativeDriver: true, tension: 280 }),
    ]).start();
  };
  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: 0, useNativeDriver: true, tension: 280 }),
    ]).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: hoverScale }, { translateY: hoverY }], flex: 1 }}
      {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <TouchableOpacity style={[styles.postCard, { flex: 1 }]} onPress={onPress} activeOpacity={0.88}>
        <View style={[styles.postAccentBar, { backgroundColor: post.accent }]} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.postCategoryWrap}>
            <View style={[styles.postCategoryBadge, { backgroundColor: post.accent + '18' }]}>
              <Text style={[styles.postCategory, { color: post.accent }]}>{post.category}</Text>
            </View>
            <Text style={styles.postTime}>{post.time}</Text>
          </View>
          <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
          <View style={styles.postMeta}>
            <View style={styles.postMetaItem}>
              <Ionicons name="heart" size={13} color={Colors.pink} />
              <Text style={styles.postMetaText}>{post.likes}</Text>
            </View>
            <View style={styles.postMetaItem}>
              <Ionicons name="chatbubble" size={13} color={Colors.primary} />
              <Text style={styles.postMetaText}>{post.comments}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 동행 구인 카드 ──────────────────────────────────────────────────
function CompanionCard({
  post, onPress,
}: {
  post: typeof COMPANION_POSTS[number];
  onPress: () => void;
}) {
  const hoverScale = useRef(new Animated.Value(1)).current;
  const hoverY     = useRef(new Animated.Value(0)).current;
  const handleMouseEnter = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.02, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: -3,   useNativeDriver: true, tension: 280 }),
    ]).start();
  };
  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true, tension: 280 }),
      Animated.spring(hoverY,     { toValue: 0, useNativeDriver: true, tension: 280 }),
    ]).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: hoverScale }, { translateY: hoverY }], flex: 1 }}
      {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <TouchableOpacity style={[styles.companionCard, { flex: 1 }]} onPress={onPress} activeOpacity={0.88}>
        <LinearGradient
          colors={post.gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.companionEmojiWrap}
        >
          <Text style={{ fontSize: 24 }}>{post.emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.companionHeader}>
            <Text style={styles.companionDest}>{post.dest}</Text>
            <View style={styles.companionPeriodBadge}>
              <Text style={styles.companionPeriod}>{post.period}</Text>
            </View>
          </View>
          <Text style={styles.companionDesc} numberOfLines={1}>{post.desc}</Text>
        </View>
        <View style={styles.companionCountWrap}>
          <Text style={styles.companionCount}>{post.count}명</Text>
          <Text style={styles.companionCountSub}>모집 중</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width, isDesktop } = useResponsive();
  const [displayName, setDisplayName] = useState('여행자');

  const contentW   = Math.min(width, MAX_WIDTH);
  const heroH      = isDesktop ? Math.min(width * 0.42, 620) : Math.round(width * 0.85);
  const destCardW  = isDesktop ? Math.floor((contentW - Spacing.screenPad * 2 - 12 * 5) / 6) : 170;
  const destCardH  = isDesktop ? Math.round(destCardW * 1.4) : 215;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const dotPulse    = useRef(new Animated.Value(1)).current;
  const aiFloat     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroOpacity, { toValue: 1, duration: Animation.entrance, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.8, duration: 800, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(aiFloat, { toValue: -6, duration: 1400, useNativeDriver: true }),
        Animated.timing(aiFloat, { toValue: 0,  duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '여행자';
      setDisplayName(name);
    });
  }, []);

  const handleQuickPress = (item: typeof QUICK_MENUS[number]) => {
    const target = item.navigate();
    if (target.type === 'screen') {
      navigation.navigate(target.name);
    } else {
      navigation.navigate('Main', { screen: target.name });
    }
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
            style={{ width: '100%', height: heroH }}
            resizeMode="cover"
            accessibilityLabel="여행 배경 이미지"
          >
            <LinearGradient
              colors={['rgba(30,27,75,0.2)', 'rgba(30,27,75,0.75)']}
              style={[styles.heroOverlay, { paddingTop: isDesktop ? TOP_NAV_H + 60 : (Platform.OS === 'ios' ? 54 : 42) }]}
            >
              {!isDesktop && (
                <View style={styles.heroTop}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoBadge}
                  >
                    <Ionicons name="airplane" size={14} color="#fff" />
                    <Text style={styles.logoText}>TripMeet</Text>
                  </LinearGradient>
                  <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8} accessibilityLabel="알림">
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.heroBody}>
                <View style={styles.statsBadge}>
                  <Animated.View style={[styles.statsDot, { transform: [{ scale: dotPulse }] }]} />
                  <Text style={styles.statsText}>지금 1,247명 여행 중</Text>
                </View>

                <Text style={[styles.heroGreeting, isDesktop && styles.heroGreetingDesktop]}>
                  {displayName}님,{'\n'}어디로 떠나세요?
                </Text>
                <Text style={styles.heroSub}>전 세계 여행자와 함께하는 여행</Text>

                <TouchableOpacity
                  style={[styles.searchBar, isDesktop && styles.searchBarDesktop]}
                  onPress={() => navigation.navigate('LocationSelect')}
                  activeOpacity={0.92}
                  accessibilityLabel="여행지 검색"
                >
                  <View style={styles.searchIconWrap}>
                    <Ionicons name="search" size={16} color="#fff" />
                  </View>
                  <Text style={styles.searchPlaceholder}>어디로 떠나고 싶으세요?</Text>
                  <View style={styles.searchFilterBtn}>
                    <Ionicons name="options" size={16} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* ── 이하 콘텐츠 ── */}
        <View style={[styles.pageContent, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>

          {/* ── 빠른 메뉴 ── */}
          <View style={[styles.quickSection, isDesktop && styles.quickSectionDesktop]}>
            {isDesktop ? (
              <View style={styles.quickGridDesktop}>
                {QUICK_MENUS.map((item, i) => (
                  <QuickMenuItem key={item.label} item={item} index={i} isDesktop onPress={() => handleQuickPress(item)} />
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickList}
                decelerationRate="fast"
              >
                {QUICK_MENUS.map((item, i) => (
                  <QuickMenuItem key={item.label} item={item} index={i} isDesktop={false} onPress={() => handleQuickPress(item)} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* ── AI 일정 배너 ── */}
          <View style={[styles.aiBannerWrap, isDesktop && styles.aiBannerWrapDesktop]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Itinerary')}
              activeOpacity={0.90}
              accessibilityLabel="AI 여행 일정 만들기"
            >
              <LinearGradient
                colors={['#312E81', '#4338CA', '#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.aiBanner, isDesktop && styles.aiBannerDesktop]}
              >
                <View style={styles.aiBannerDecor1} />
                <View style={styles.aiBannerDecor2} />
                <View style={styles.aiLeft}>
                  <View style={styles.aiChip}>
                    <Ionicons name="flash" size={10} color="#FCD34D" />
                    <Text style={styles.aiChipText}>AI POWERED</Text>
                  </View>
                  <Text style={[styles.aiBannerTitle, isDesktop && { fontSize: 22 }]}>
                    맞춤 일정을 자동으로
                  </Text>
                  <Text style={styles.aiBannerSub}>
                    목적지 · 기간 · 예산만 입력하세요
                  </Text>
                  <View style={styles.aiBannerCta}>
                    <Text style={styles.aiBannerCtaText}>지금 만들기</Text>
                    <Ionicons name="arrow-forward" size={13} color="#fff" />
                  </View>
                </View>
                <Animated.View style={[styles.aiIconCircle, isDesktop && { width: 80, height: 80, borderRadius: 40 }, { transform: [{ translateY: aiFloat }] }]}>
                  <Ionicons name="sparkles" size={isDesktop ? 36 : 28} color="#FCD34D" />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── 근처 여행자 ── */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <LinearGradient colors={['#10B981', '#34D399']} style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, isDesktop && { fontSize: 22 }]}>지금 만날 수 있는 여행자</Text>
                </View>
                <Text style={styles.sectionSub}>같은 여행지의 혼자 여행자</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
                accessibilityLabel="여행자 전체 보기"
                style={styles.sectionMoreRow}
              >
                <Text style={styles.sectionMore}>더보기</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.travelerList, isDesktop && styles.travelerListDesktop]}>
              {NEARBY_TRAVELERS.map((t) => (
                <TravelerCard
                  key={t.name}
                  traveler={t}
                  onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
                />
              ))}
            </View>
          </View>

          {/* ── 인기 여행지 ── */}
          <View style={styles.sectionWrapAlt}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, isDesktop && { fontSize: 22 }]}>지금 핫한 여행지</Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
                accessibilityLabel="여행지 전체 보기"
                style={styles.sectionMoreRow}
              >
                <Text style={styles.sectionMore}>더보기</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {isDesktop ? (
              <View style={styles.destGridDesktop}>
                {DESTINATIONS.map((dest, i) => (
                  <DestCard
                    key={dest.city} dest={dest} index={i}
                    cardW={destCardW} cardH={destCardH}
                    onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
                  />
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.destList}
                decelerationRate="fast"
                snapToInterval={destCardW + 12}
                snapToAlignment="start"
              >
                {DESTINATIONS.map((dest, i) => (
                  <DestCard
                    key={dest.city} dest={dest} index={i}
                    cardW={destCardW} cardH={destCardH}
                    onPress={() => navigation.navigate('Main', { screen: 'Matching' })}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* ── 커뮤니티 최신 글 ── */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <LinearGradient colors={['#EC4899', '#F9A8D4']} style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, isDesktop && { fontSize: 22 }]}>커뮤니티 인기 글</Text>
                </View>
                <Text style={styles.sectionSub}>여행자들의 생생한 이야기</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Main', { screen: 'Community' })}
                accessibilityLabel="커뮤니티 전체 보기"
                style={styles.sectionMoreRow}
              >
                <Text style={styles.sectionMore}>더보기</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.postList, isDesktop && styles.postListDesktop]}>
              {COMMUNITY_POSTS.map((post) => (
                <PostCard
                  key={post.title}
                  post={post}
                  onPress={() => navigation.navigate('Main', { screen: 'Community' })}
                />
              ))}
            </View>
          </View>

          {/* ── 동행 구인 HOT ── */}
          <View style={styles.sectionWrapAlt}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <LinearGradient colors={['#F59E0B', '#FCD34D']} style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, isDesktop && { fontSize: 22 }]}>동행 구인 HOT</Text>
                </View>
                <Text style={styles.sectionSub}>같이 여행할 사람을 찾고 있어요</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Main', { screen: 'Companion' })}
                accessibilityLabel="동행 구인 전체 보기"
                style={styles.sectionMoreRow}
              >
                <Text style={styles.sectionMore}>더보기</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.companionList, isDesktop && styles.companionListDesktop]}>
              {COMPANION_POSTS.map((post) => (
                <CompanionCard
                  key={post.dest}
                  post={post}
                  onPress={() => navigation.navigate('Main', { screen: 'Companion' })}
                />
              ))}
            </View>
          </View>

          {/* ── 안전 안내 ── */}
          <View style={styles.safetyRow}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.safetyIcon}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </LinearGradient>
            <Text style={styles.safetyText}>
              위치 정보 직접 입력 방식 · GPS 미사용 · 개인정보 보호
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.background },
  scrollContent:     { paddingBottom: 32 },

  heroWrap:          { position: 'relative' },
  heroImg:           { height: 340 },
  heroOverlay:       { ...StyleSheet.absoluteFillObject },
  heroContent:       { paddingHorizontal: Spacing.screenPad, paddingBottom: Spacing.lg },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: 14,
  },
  heroBadgeDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  heroBadgeText: { ...Typography.caption, color: 'rgba(255,255,255,0.90)', fontWeight: '600' as const },
  heroTitle:     { ...Typography.display, color: '#FFFFFF', marginBottom: 8 },
  heroSub:       { ...Typography.body, color: 'rgba(255,255,255,0.65)', marginBottom: 24 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadow.primary,
  },
  heroBtnText:   { ...Typography.buttonMd, color: Colors.primary },

  section:       { paddingHorizontal: Spacing.screenPad, paddingTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle:  { ...Typography.h3 },
  seeAll:        { ...Typography.caption, color: Colors.primary, fontWeight: '600' as const },

  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  quickMenuItem: {
    width: '18%',
    alignItems: 'center',
    gap: 6,
  },
  quickMenuIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  quickMenuLabel: { ...Typography.caption, color: Colors.textMedium, textAlign: 'center', fontWeight: '600' as const },

  destinationsRow: { paddingLeft: Spacing.screenPad, flexDirection: 'row', gap: 12 },
  destCard: {
    width: 160,
    height: 200,
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadow.card,
  },
  destImg:      { width: '100%', height: '100%' },
  destOverlay:  { ...StyleSheet.absoluteFillObject },
  destInfo:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  destCity:     { fontSize: 16, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.3, marginBottom: 2 },
  destCountry:  { fontSize: 11, color: 'rgba(255,255,255,0.70)', marginBottom: 6 },
  destCountText: { fontSize: 10, color: '#fff', fontWeight: '600' as const },
  destCount:     { fontSize: 11, color: '#fff', fontWeight: '600' as const },

  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 14,
    marginBottom: 10,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  travelerAvatar:    { width: 48, height: 48, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  travelerEmoji:     { fontSize: 22 },
  travelerName:      { ...Typography.h4, marginBottom: 2 },
  travelerFrom:      { ...Typography.caption },
  travelerBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  travelerBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const },

  postCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBar:      { width: 3, alignSelf: 'stretch', borderRadius: 2, minHeight: 60 },
  postInner:   { flex: 1 },
  postCat:     { ...Typography.label, marginBottom: 5 },
  postTitle:   { ...Typography.h4, lineHeight: 22, marginBottom: 8 },
  postMeta:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  postMetaText:{ ...Typography.caption },

  companionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  companionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionEmoji:    { fontSize: 20 },
  companionInfo:     { flex: 1 },
  companionDest:     { ...Typography.h4, marginBottom: 3 },
  companionPeriod:   { ...Typography.caption, marginBottom: 5 },
  companionDesc:     { ...Typography.bodyMd, lineHeight: 20 },
  companionCountText: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const },
  companionCount:     { fontSize: 16, fontWeight: '800' as const, color: Colors.primary },

  // ── 루트 / 스크롤 ──
  root:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { paddingBottom: 40 },

  // ── 히어로 내부 ──
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPad,
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  logoText:  { fontSize: 15, fontWeight: '700' as const, color: '#fff', letterSpacing: -0.3 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.screenPad,
    paddingBottom: Spacing.lg,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: 14,
  },
  statsDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  statsText: { fontSize: 12, color: 'rgba(255,255,255,0.90)', fontWeight: '600' as const },
  heroGreeting: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 8,
  },
  heroGreetingDesktop: { fontSize: 42, lineHeight: 52 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginTop: 18,
  },
  searchBarDesktop: { maxWidth: 520, paddingVertical: 14 },
  searchIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  searchFilterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 페이지 콘텐츠 ──
  pageContent: { paddingTop: 6 },

  // ── 빠른 메뉴 (신규) ──
  quickSection:        { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.screenPad },
  quickSectionDesktop: { paddingVertical: 28 },
  quickGridDesktop:    { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  quickList:           { paddingHorizontal: Spacing.screenPad, gap: 16 },
  quickItem:           { alignItems: 'center', gap: 6 },
  quickItemDesktop:    { width: 80, alignItems: 'center', gap: 6 },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  quickIconWrapDesktop: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  quickLabel:        { ...Typography.caption, color: Colors.textMedium, textAlign: 'center' as const, fontWeight: '600' as const },
  quickLabelDesktop: { fontSize: 13, color: Colors.textMedium, textAlign: 'center' as const, fontWeight: '600' as const },

  // ── AI 배너 ──
  aiBannerWrap:        { paddingHorizontal: Spacing.screenPad, marginBottom: Spacing.lg },
  aiBannerWrapDesktop: { paddingHorizontal: 0 },
  aiBanner: {
    borderRadius: Radius.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.primary,
  },
  aiBannerDesktop: { padding: 28, borderRadius: Radius.xl },
  aiBannerDecor1: {
    position: 'absolute',
    top: -30,
    right: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  aiBannerDecor2: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  aiLeft:      { flex: 1, gap: 6 },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  aiChipText:       { fontSize: 10, fontWeight: '800' as const, color: '#FCD34D', letterSpacing: 0.8 },
  aiBannerTitle:    { fontSize: 18, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.4 },
  aiBannerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  aiBannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  aiBannerCtaText:  { fontSize: 13, fontWeight: '700' as const, color: '#fff' },
  aiIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 섹션 공통 ──
  sectionWrap: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: Spacing.lg,
    paddingBottom: 4,
  },
  sectionWrapAlt: {
    paddingTop: Spacing.lg,
    paddingBottom: 4,
    backgroundColor: Colors.background,
  },
  sectionRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, paddingHorizontal: Spacing.screenPad },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccentBar: { width: 3, height: 20, borderRadius: 2 },
  sectionSub:      { ...Typography.caption },
  sectionMoreRow:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  sectionMore:     { fontSize: 12, color: Colors.primary, fontWeight: '600' as const },

  // ── 근처 여행자 ──
  travelerList:        { gap: 0 },
  travelerListDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  travelerInfo:        { flex: 1 },
  travelerStatusRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  travelerStatusDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green },
  travelerStatusText:  { fontSize: 11, color: Colors.textLight },
  chatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chatChipText: { fontSize: 11, fontWeight: '700' as const, color: '#fff' },

  // ── 인기 여행지 ──
  destCardWrap: {
    width: 160,
    height: 200,
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadow.card,
  },
  destList:        { paddingHorizontal: Spacing.screenPad, gap: 12 },
  destGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: Spacing.screenPad },
  destRatingRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  destRating:      { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' as const },
  destBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  destDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' },

  // ── 커뮤니티 글 ──
  postList:        { gap: 10 },
  postListDesktop: { flexDirection: 'row', gap: 12 },
  postAccentBar:   { width: 3, alignSelf: 'stretch', borderRadius: 2, minHeight: 60 },
  postCategoryWrap:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postCategoryBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  postCategory: { fontSize: 11, fontWeight: '700' as const },
  postTime:     { fontSize: 11, color: Colors.textLight },
  postMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // ── 동행 구인 ──
  companionList:        { gap: 10, paddingHorizontal: Spacing.screenPad },
  companionListDesktop: { flexDirection: 'row', gap: 12 },
  companionEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  companionHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  companionPeriodBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  companionCountWrap: { alignItems: 'center', gap: 2 },
  companionCountSub:  { fontSize: 10, color: Colors.textLight },

  // ── 안전 안내 ──
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.screenPad,
    paddingVertical: Spacing.md,
    marginTop: 8,
  },
  safetyIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyText: { ...Typography.caption, flex: 1 },
});
