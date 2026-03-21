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
import { Colors, Radius, Shadow, Animation, Spacing } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

const HERO_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=85';

const QUICK_MENUS = [
  {
    icon: 'sparkles'    as const,
    label: 'AI 일정',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    navigate: () => ({ type: 'screen' as const, name: 'Itinerary' }),
  },
  {
    icon: 'location'    as const,
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
    icon: 'restaurant'  as const,
    label: '맛집',
    color: '#EF4444',
    bg: '#FEF2F2',
    navigate: () => ({ type: 'tab' as const, name: 'Restaurant' }),
  },
  {
    icon: 'people'      as const,
    label: '동행 구인',
    color: '#F59E0B',
    bg: '#FFFBEB',
    navigate: () => ({ type: 'tab' as const, name: 'Companion' }),
  },
] as const;

const DESTINATIONS = [
  { city: '도쿄',    country: '일본',     count: '247명', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { city: '발리',    country: '인도네시아', count: '156명', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { city: '파리',    country: '프랑스',   count: '134명', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
  { city: '뉴욕',    country: '미국',     count: '98명',  img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80' },
  { city: '교토',    country: '일본',     count: '89명',  img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80' },
  { city: '바르셀로나', country: '스페인', count: '76명',  img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
] as const;

// 근처 여행자 모의 데이터 (추후 API 교체)
const NEARBY_TRAVELERS = [
  { name: '지민', age: 25, from: '서울', location: '도쿄', emoji: '😊', color: ['#FF6B6B', '#FF8E53'] as string[] },
  { name: '준혁', age: 28, from: '부산', location: '발리', emoji: '🧳', color: ['#4FACFE', '#00F2FE'] as string[] },
  { name: '수아',  age: 23, from: '인천', location: '파리', emoji: '✈️', color: ['#43E97B', '#38F9D7'] as string[] },
];

// 커뮤니티 최신 글 모의 데이터
const COMMUNITY_POSTS = [
  { category: '여행 꿀팁', title: '도쿄 1주일 혼자 다녀온 후기 — 진짜 절약법', likes: 142, comments: 38, time: '1시간 전' },
  { category: '질문', title: '발리 우붓 vs 쿠타 — 첫 방문이면 어디가 좋을까요?', likes: 67, comments: 24, time: '3시간 전' },
];

// 동행 구인 HOT 모의 데이터
const COMPANION_POSTS = [
  { dest: '도쿄', period: '3월 15~20일', desc: '시부야·아키하바라 위주 탐방, 20대 누구든 환영', emoji: '🗼', count: 2 },
  { dest: '발리', period: '4월 1~7일',   desc: '우붓 힐링 여행, 조용한 분위기 선호하는 분',   emoji: '🌴', count: 1 },
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
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: Animation.entrance, delay: 200 + index * 60, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, delay: 200 + index * 60, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityLabel={item.label}
        style={[styles.quickItem, isDesktop && styles.quickItemDesktop]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.quickCard,
            isDesktop && styles.quickCardDesktop,
          ]}
        >
          <View style={[
            styles.quickIconWrap,
            { backgroundColor: item.bg },
            isDesktop && styles.quickIconWrapDesktop,
          ]}>
            <Ionicons name={item.icon} size={isDesktop ? 26 : 26} color={item.color} />
          </View>
          <Text style={[styles.quickLabel, isDesktop && styles.quickLabelDesktop]} numberOfLines={1}>
            {item.label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
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
  const slideX  = useRef(new Animated.Value(20)).current;
  const rating  = DEST_RATINGS[dest.city] ?? 4.5;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: Animation.entrance, delay: 300 + index * 70, useNativeDriver: true }),
      Animated.spring(slideX, { toValue: 0, delay: 300 + index * 70, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  return (
    <Animated.View style={[styles.destCardWrap, { width: cardW, opacity, transform: [{ scale }, { translateX: slideX }] }]}>
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
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={[styles.destOverlay, { height: cardH }]}
          >
            <Text style={styles.destCity}>{dest.city}</Text>
            <Text style={styles.destCountry}>{dest.country}</Text>
            <View style={styles.destBadge}>
              <View style={styles.destDot} />
              <Text style={styles.destCount}>{dest.count} 여행 중</Text>
            </View>
            <View style={styles.destRatingRow}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.destRating}>{rating.toFixed(1)}</Text>
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
  return (
    <TouchableOpacity style={styles.travelerCard} onPress={onPress} activeOpacity={0.85}>
      {/* 그라디언트 링 + 아바타 */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.travelerAvatarRing}
      >
        <LinearGradient
          colors={traveler.color}
          style={styles.travelerAvatar}
        >
          <Text style={{ fontSize: 22 }}>{traveler.emoji}</Text>
        </LinearGradient>
      </LinearGradient>
      <View style={styles.travelerInfo}>
        <Text style={styles.travelerName}>{traveler.name} · {traveler.age}세</Text>
        <Text style={styles.travelerFrom}>{traveler.from}에서</Text>
        <View style={styles.travelerStatusRow}>
          <View style={styles.travelerStatusDot} />
          <Ionicons name="location" size={10} color={Colors.green} />
          <Text style={styles.travelerStatusText}>{traveler.location} 여행 중</Text>
        </View>
      </View>
      <View style={styles.chatChip}>
        <Ionicons name="chatbubble-outline" size={13} color={Colors.primary} />
        <Text style={styles.chatChipText}>채팅</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── 커뮤니티 글 카드 ──────────────────────────────────────────────────
function PostCard({
  post, onPress,
}: {
  post: typeof COMMUNITY_POSTS[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.postCategoryWrap}>
        <Text style={styles.postCategory}>{post.category}</Text>
        <Text style={styles.postTime}>{post.time}</Text>
      </View>
      <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
      <View style={styles.postMeta}>
        <View style={styles.postMetaItem}>
          <Ionicons name="heart-outline" size={13} color={Colors.textLight} />
          <Text style={styles.postMetaText}>{post.likes}</Text>
        </View>
        <View style={styles.postMetaItem}>
          <Ionicons name="chatbubble-outline" size={13} color={Colors.textLight} />
          <Text style={styles.postMetaText}>{post.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── 동행 구인 카드 ──────────────────────────────────────────────────
function CompanionCard({
  post, onPress,
}: {
  post: typeof COMPANION_POSTS[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.companionCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.companionEmoji}>
        <Text style={{ fontSize: 22 }}>{post.emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.companionHeader}>
          <Text style={styles.companionDest}>{post.dest}</Text>
          <Text style={styles.companionPeriod}>{post.period}</Text>
        </View>
        <Text style={styles.companionDesc} numberOfLines={1}>{post.desc}</Text>
      </View>
      <View style={styles.companionCountWrap}>
        <Ionicons name="person-add-outline" size={12} color={Colors.amber} />
        <Text style={styles.companionCount}>{post.count}명 모집</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width, isDesktop } = useResponsive();
  const [displayName, setDisplayName] = useState('여행자');

  const contentW = Math.min(width, MAX_WIDTH);
  const heroH = isDesktop ? Math.min(width * 0.42, 620) : Math.round(width * 0.85);
  const destCardW = isDesktop ? Math.floor((contentW - Spacing.screenPad * 2 - 12 * 5) / 6) : 170;
  const destCardH = isDesktop ? Math.round(destCardW * 1.4) : 215;

  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroOpacity, { toValue: 1, duration: Animation.entrance, useNativeDriver: true }).start();

    // 로그인 사용자 이름 가져오기
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
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)']}
              style={[styles.heroOverlay, { paddingTop: isDesktop ? TOP_NAV_H + 60 : (Platform.OS === 'ios' ? 54 : 42) }]}
            >
              {/* 모바일 상단 로고/알림 */}
              {!isDesktop && (
                <View style={styles.heroTop}>
                  <View style={styles.logoBadge}>
                    <Ionicons name="airplane" size={14} color="#fff" />
                    <Text style={styles.logoText}>TripMeet</Text>
                  </View>
                  <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8} accessibilityLabel="알림">
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* 히어로 본문 */}
              <View style={styles.heroBody}>
                {/* 통계 배지 */}
                <View style={styles.statsBadge}>
                  <View style={styles.statsDot} />
                  <Text style={styles.statsText}>지금 1,247명 여행 중</Text>
                </View>

                <Text style={[styles.heroGreeting, isDesktop && styles.heroGreetingDesktop]}>
                  {displayName}님,{'\n'}어디로 떠나세요?
                </Text>
                <Text style={styles.heroSub}>전 세계 여행자와 함께하는 여행</Text>

                {/* 검색바 */}
                <TouchableOpacity
                  style={[styles.searchBar, isDesktop && styles.searchBarDesktop]}
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
              activeOpacity={0.88}
              accessibilityLabel="AI 여행 일정 만들기"
            >
              <LinearGradient
                colors={['#4C1D95', '#7C3AED', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.aiBanner, isDesktop && styles.aiBannerDesktop]}
              >
                <View style={styles.aiLeft}>
                  <View style={styles.aiChip}>
                    <Text style={styles.aiChipText}>AI POWERED</Text>
                  </View>
                  <Text style={[styles.aiBannerTitle, isDesktop && { fontSize: 22 }]}>
                    맞춤 일정을 자동으로
                  </Text>
                  <Text style={styles.aiBannerSub}>
                    목적지 · 기간 · 예산만 입력하세요
                  </Text>
                </View>
                <View style={styles.aiRight}>
                  <View style={[styles.aiIconCircle, isDesktop && { width: 72, height: 72, borderRadius: 36 }]}>
                    <Ionicons name="sparkles" size={isDesktop ? 34 : 26} color="#fff" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── 근처 여행자 ── */}
          <View style={styles.sectionBg}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionAccentBar, { backgroundColor: Colors.green }]} />
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
          <View>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionAccentBar, { backgroundColor: Colors.primary }]} />
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
          <View style={styles.sectionBg}>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionAccentBar, { backgroundColor: Colors.primary }]} />
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
          <View>
            <View style={styles.sectionRow}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionAccentBar, { backgroundColor: Colors.amber }]} />
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
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
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
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  // 히어로
  heroOverlay: {
    flex: 1,
    paddingHorizontal: Spacing.screenPad,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 18, fontWeight: '900' as const, color: '#fff', letterSpacing: -0.5 },
  notifBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
  },

  heroBody: { gap: 6, alignItems: 'center' },

  // 통계 배지
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statsDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80',
  },
  statsText: { fontSize: 12, fontWeight: '600' as const, color: 'rgba(255,255,255,0.9)' },

  heroGreeting: {
    fontSize: 30, fontWeight: '900' as const, color: '#fff',
    letterSpacing: -0.8, lineHeight: 38, textAlign: 'center',
  },
  heroGreetingDesktop: { fontSize: 48, lineHeight: 58 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 14, textAlign: 'center' },

  // 검색바
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.full,
    paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 10,
    width: '100%',
    ...Shadow.md,
  },
  searchBarDesktop: { maxWidth: 560 },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textLight, paddingVertical: 6 },
  searchFilterBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  // 콘텐츠 래퍼
  pageContent: {},

  // 빠른 메뉴
  quickSection: {
    backgroundColor: Colors.card,
    paddingVertical: 20,
    ...Shadow.sm,
  },
  quickSectionDesktop: {
    paddingVertical: 28,
    paddingHorizontal: Spacing.screenPad,
  },
  quickList: { paddingHorizontal: Spacing.screenPad, gap: 8 },
  quickGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickItem: { alignItems: 'center', width: 72 },
  quickItemDesktop: { width: 110 },
  quickCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    ...Shadow.card,
  },
  quickCardDesktop: {
    paddingVertical: 24,
  },
  quickIconWrap: {
    width: 52, height: 52, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  quickIconWrapDesktop: { width: 68, height: 68, borderRadius: 20 },
  quickLabel: { fontSize: 13, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' },
  quickLabelDesktop: { fontSize: 13 },

  // AI 배너
  aiBannerWrap: {
    marginHorizontal: Spacing.screenPad,
    marginTop: 24,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.blue,
  },
  aiBannerWrapDesktop: { marginTop: 32 },
  aiBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingVertical: 20,
  },
  aiBannerDesktop: { paddingVertical: 28, paddingHorizontal: 32 },
  aiLeft: { flex: 1, gap: 4 },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 2,
  },
  aiChipText: { fontSize: 10, fontWeight: '700' as const, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  aiBannerTitle: { fontSize: 19, fontWeight: '900' as const, color: '#fff', letterSpacing: -0.4 },
  aiBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.70)' },
  aiRight: { paddingLeft: 12 },
  aiIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // 섹션 공통
  sectionBg: {
    backgroundColor: Colors.surface,
    marginTop: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPad, paddingTop: 28, paddingBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  sectionMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  sectionMore: { fontSize: 13, fontWeight: '600' as const, color: Colors.primary },

  // 근처 여행자
  travelerList: { paddingHorizontal: Spacing.screenPad, gap: 10, paddingBottom: 24 },
  travelerListDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  travelerAvatarRing: {
    width: 60, height: 60, borderRadius: 30,
    padding: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  travelerAvatar: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  travelerInfo: { flex: 1, gap: 2 },
  travelerName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  travelerFrom: { fontSize: 12, color: Colors.textLight },
  travelerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  travelerStatusDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green,
  },
  travelerStatusText: { fontSize: 11, fontWeight: '600' as const, color: Colors.green },
  chatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chatChipText: { fontSize: 12, fontWeight: '600' as const, color: Colors.primary },

  // 인기 여행지
  destList: { paddingHorizontal: Spacing.screenPad, gap: 12 },
  destGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPad,
    gap: 12,
  },
  destCardWrap: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card },
  destOverlay: { borderRadius: Radius.xl, padding: 14, justifyContent: 'flex-end' },
  destCity: { fontSize: 18, fontWeight: '900' as const, color: '#fff', letterSpacing: -0.4, lineHeight: 22 },
  destCountry: { fontSize: 11, color: 'rgba(255,255,255,0.70)', marginBottom: 8, fontWeight: '500' as const },
  destBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  destDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  destCount: { fontSize: 10, color: '#fff', fontWeight: '600' as const },
  destRatingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4,
  },
  destRating: { fontSize: 11, color: '#fff', fontWeight: '700' as const },

  // 커뮤니티 글
  postList: { paddingHorizontal: Spacing.screenPad, gap: 10, paddingBottom: 24 },
  postListDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  postCategoryWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postCategory: {
    fontSize: 11, fontWeight: '700' as const, color: Colors.primary,
    backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  postTime: { fontSize: 11, color: Colors.textLight },
  postTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, lineHeight: 20 },
  postMeta: { flexDirection: 'row', gap: 12 },
  postMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postMetaText: { fontSize: 12, color: Colors.textLight },

  // 동행 구인
  companionList: { paddingHorizontal: Spacing.screenPad, gap: 10, paddingBottom: 28 },
  companionListDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  companionEmoji: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.amberLight,
    alignItems: 'center', justifyContent: 'center',
  },
  companionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  companionDest: { fontSize: 14, fontWeight: '800' as const, color: Colors.text },
  companionPeriod: { fontSize: 11, color: Colors.textLight },
  companionDesc: { fontSize: 12, color: Colors.textMedium },
  companionCountWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.amberLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  companionCount: { fontSize: 11, fontWeight: '600' as const, color: Colors.amber },

  // 안전 안내
  safetyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.screenPad, paddingTop: 24, paddingBottom: 8,
  },
  safetyText: { fontSize: 11, color: Colors.textLight },
});
