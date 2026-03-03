import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Radius, Shadow, Animation } from '../../utils/theme';

const { width: W } = Dimensions.get('window');
const TILE_WIDTH = (W - 16 * 2 - 12) / 2;

// ─── 기능 타일 데이터 ───────────────────────────────────────
const FEATURES = [
  {
    icon: '✈',
    title: 'AI 여행 일정',
    desc: '목적지·기간·예산으로\n맞춤 일정 자동 완성',
    screen: 'ItineraryForm',
    tab: null,
    gradient: Gradients.tileAI,
    accent: Colors.primary,
    glowColor: '#2563EB',
  },
  {
    icon: '📍',
    title: '지역 매칭',
    desc: '같은 도시 여행자와\n실시간 연결',
    screen: null,
    tab: 'Matching',
    gradient: Gradients.tileMatch,
    accent: Colors.green,
    glowColor: '#10B981',
  },
  {
    icon: '💬',
    title: '커뮤니티',
    desc: '여행 정보·질문·후기\n함께 공유',
    screen: null,
    tab: 'Community',
    gradient: Gradients.tileCommunity,
    accent: Colors.accent,
    glowColor: '#F97316',
  },
  {
    icon: '🍜',
    title: '맛집 리뷰',
    desc: '현지 맛집 사진과\n별점 리뷰 공유',
    screen: null,
    tab: 'Restaurant',
    gradient: Gradients.tileRestaurant,
    accent: Colors.red,
    glowColor: '#EF4444',
  },
  {
    icon: '🤝',
    title: '동행 구인',
    desc: '함께 여행할 동반자를\n미리 모집',
    screen: null,
    tab: 'Companion',
    gradient: Gradients.tileCompanion,
    accent: Colors.amber,
    glowColor: '#F59E0B',
  },
] as const;

// ─── 배너 플로팅 파티클 ─────────────────────────────────────
const BANNER_PARTICLES = [
  { emoji: '✈', right: 24, top: 28, size: 22, delay: 0 },
  { emoji: '🌍', right: 70, top: 60, size: 18, delay: 400 },
  { emoji: '⭐', right: 16, top: 72, size: 14, delay: 800 },
];

function BannerParticle({ emoji, right, top, size, delay }: typeof BANNER_PARTICLES[0]) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -10, duration: 2400, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,   duration: 2400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        right, top, fontSize: size,
        opacity: 0.7,
        transform: [{ translateY: anim }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

// ─── 기능 타일 컴포넌트 ─────────────────────────────────────
function FeatureTile({
  feature,
  index,
  onPress,
}: {
  feature: typeof FEATURES[number];
  index: number;
  onPress: () => void;
}) {
  const scale    = useRef(new Animated.Value(1)).current;
  const opacity  = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: Animation.entrance,
        delay: 100 + index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: 100 + index * 80,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn  = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start();

  const isLast  = index === FEATURES.length - 1;
  const isOdd   = FEATURES.length % 2 !== 0;
  const fullWidth = isLast && isOdd;

  return (
    <Animated.View
      style={[
        { width: fullWidth ? '100%' : TILE_WIDTH },
        { opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityLabel={feature.title}
      >
        <LinearGradient
          colors={feature.gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.tile,
            {
              shadowColor: feature.glowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 14,
              elevation: 6,
            },
          ]}
        >
          {/* 아이콘 */}
          <View style={[styles.tileIconRing, { borderColor: feature.accent + '30' }]}>
            <LinearGradient
              colors={[feature.accent + '22', feature.accent + '08']}
              style={styles.tileIconGradient}
            >
              <Text style={styles.tileIconEmoji}>{feature.icon}</Text>
            </LinearGradient>
          </View>

          <Text style={[styles.tileTitle, { color: feature.accent }]}>{feature.title}</Text>
          <Text style={styles.tileDesc}>{feature.desc}</Text>

          {/* 하단 액센트 라인 */}
          <LinearGradient
            colors={[feature.accent, feature.accent + '00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tileAccentLine}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const bannerScale = useRef(new Animated.Value(0.96)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bannerScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(bannerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = (feature: typeof FEATURES[number]) => {
    if (feature.screen) {
      navigation.navigate(feature.screen);
    } else if (feature.tab) {
      navigation.navigate('Main', { screen: feature.tab });
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 히어로 배너 ── */}
      <Animated.View style={{ opacity: bannerOpacity, transform: [{ scale: bannerScale }] }}>
        <LinearGradient
          colors={['#0F2B5B', '#1E3A8A', '#2563EB', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          {/* 빛 원형 장식 */}
          <View style={styles.bannerGlow} />

          {/* 파티클 */}
          {BANNER_PARTICLES.map((p, i) => <BannerParticle key={i} {...p} />)}

          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>🌍 여행자 커뮤니티</Text>
            </View>
            <Text style={styles.bannerTitle}>TripMeet</Text>
            <Text style={styles.bannerSub}>혼자 떠나도 함께하는 여행</Text>
          </View>

          {/* 하단 웨이브 커브 */}
          <View style={styles.bannerWave} />
        </LinearGradient>
      </Animated.View>

      {/* ── AI 일정 빠른 시작 카드 ── */}
      <View style={styles.quickCard}>
        <LinearGradient
          colors={Gradients.violet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.quickGradient}
        >
          <View style={styles.quickLeft}>
            <Text style={styles.quickLabel}>지금 바로 시작</Text>
            <Text style={styles.quickTitle}>AI가 일정을 짜줄게요</Text>
            <Text style={styles.quickDesc}>목적지와 기간만 알려주세요</Text>
          </View>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('ItineraryForm')}
            activeOpacity={0.85}
          >
            <Text style={styles.quickBtnText}>시작 →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* ── 기능 타일 ── */}
      <Text style={styles.sectionTitle}>무엇을 도와드릴까요?</Text>

      <View style={styles.grid}>
        {FEATURES.map((f, i) => (
          <FeatureTile
            key={f.title}
            feature={f}
            index={i}
            onPress={() => handlePress(f)}
          />
        ))}
      </View>

      {/* ── 하단 안내 ── */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#F0F4FF', '#E8EEFF']}
          style={styles.footerCard}
        >
          <Text style={styles.footerIcon}>🔒</Text>
          <Text style={styles.footerText}>
            GPS를 사용하지 않습니다.{'\n'}위치는 직접 선택합니다.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 48,
  },

  // 배너
  banner: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56,189,248,0.15)',
    top: -50,
    right: -30,
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
  },
  bannerTitle: {
    fontSize: 38,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.8,
    marginBottom: 6,
    textShadowColor: 'rgba(14,165,233,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  bannerSub: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.78)',
  },
  bannerWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // AI 빠른 시작 카드
  quickCard: {
    marginHorizontal: 16,
    marginTop: -2,
    marginBottom: 4,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.strong,
  },
  quickGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  quickLeft: { flex: 1 },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.70)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 3,
  },
  quickDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  quickBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 14,
  },

  // 그리드
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },

  // 타일
  tile: {
    borderRadius: Radius.lg,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  tileIconRing: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tileIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconEmoji: { fontSize: 24 },
  tileTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    marginBottom: 6,
  },
  tileDesc: {
    fontSize: 12,
    color: Colors.textMedium,
    lineHeight: 18,
  },
  tileAccentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // 하단
  footer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  footerIcon: { fontSize: 16 },
  footerText: {
    fontSize: 12,
    color: Colors.textMedium,
    lineHeight: 18,
    flex: 1,
  },
});
