import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Animation } from '../../utils/theme';

WebBrowser.maybeCompleteAuthSession();

const { width: W, height: H } = Dimensions.get('window');

// ─── 떠다니는 여행 파티클 정의 ─────────────────────────────
const PARTICLES = [
  { emoji: '✈', top: 0.10, left: 0.08, size: 30, duration: 3200, delay: 0,    driftX: 12 },
  { emoji: '🌍', top: 0.22, left: 0.75, size: 36, duration: 3800, delay: 600,  driftX: -8 },
  { emoji: '🗺', top: 0.06, left: 0.50, size: 26, duration: 4200, delay: 1000, driftX: 10 },
  { emoji: '⛵', top: 0.38, left: 0.04, size: 24, duration: 2900, delay: 1400, driftX: 14 },
  { emoji: '☀️', top: 0.14, left: 0.82, size: 28, duration: 3500, delay: 300,  driftX: -10 },
  { emoji: '🏔', top: 0.44, left: 0.88, size: 22, duration: 4600, delay: 900,  driftX: -6 },
  { emoji: '🌊', top: 0.30, left: 0.32, size: 26, duration: 3900, delay: 1200, driftX: 8  },
  { emoji: '⭐', top: 0.04, left: 0.68, size: 20, duration: 2600, delay: 400,  driftX: -12 },
  { emoji: '🌺', top: 0.48, left: 0.18, size: 22, duration: 4100, delay: 800,  driftX: 10  },
];

// ─── 개별 파티클 컴포넌트 ─────────────────────────────────
function FloatingParticle({
  emoji, top, left, size, duration, delay, driftX,
}: (typeof PARTICLES)[0]) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 페이드인
    Animated.timing(opacity, {
      toValue: 0.85,
      duration: 900,
      delay,
      useNativeDriver: true,
    }).start();

    // 부유 루프
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: -18, duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: driftX, duration: duration * 0.75, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: duration * 1.5, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: duration * 0.75, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: duration * 1.5, useNativeDriver: true }),
        ]),
      ]),
    );

    const timer = setTimeout(() => loop.start(), delay);
    return () => { clearTimeout(timer); loop.stop(); };
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: H * top,
        left: W * left,
        fontSize: size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

// ─── 기능 소개 데이터 ──────────────────────────────────────
const FEATURES = [
  { icon: '✈', label: 'AI 맞춤 일정', desc: '목적지·기간·예산 입력으로 자동 생성' },
  { icon: '📍', label: '실시간 여행자 매칭', desc: '같은 도시 여행자와 즉시 연결' },
  { icon: '🍜', label: '맛집 & 커뮤니티', desc: '현지인이 검증한 정보 공유' },
];

// ─── 메인 컴포넌트 ─────────────────────────────────────────
export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const loginInProgress = useRef(false);

  // 카드 진입 애니메이션
  const cardTranslate = useRef(new Animated.Value(70)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;

  // 버튼 shimmer
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 카드 슬라이드업
    Animated.parallel([
      Animated.timing(cardTranslate, {
        toValue: 0, duration: Animation.entrance, delay: 400, useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, duration: Animation.entrance, delay: 400, useNativeDriver: true,
      }),
    ]).start();

    // 버튼 shimmer 루프 (2초마다)
    Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0,   useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-W * 0.7, W * 0.7],
  });

  const handleGoogleLogin = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setLoading(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');

      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;

        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) {
            const queryString = result.url.split('?')[1] ?? '';
            const params = new URLSearchParams(queryString);
            const code = params.get('code');
            if (code) {
              const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
              if (sessionError) throw sessionError;
            }
          }
        }
      }
    } catch (e) {
      console.error('구글 로그인 오류:', e);
    } finally {
      loginInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── 딥 오션 그라디언트 배경 ── */}
      <LinearGradient
        colors={Gradients.hero}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── 보조 빛 원형 글로우 ── */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* ── 떠다니는 파티클 ── */}
      {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

      {/* ── 브랜드 타이틀 (상단) ── */}
      <View style={styles.titleSection}>
        <View style={styles.logoRing}>
          <Text style={styles.logoEmoji}>✈</Text>
        </View>
        <Text style={styles.appName}>TripMeet</Text>
        <Text style={styles.tagline}>혼자 떠나도{'\n'}함께하는 여행</Text>
      </View>

      {/* ── 글래스모피즘 바텀 카드 ── */}
      <Animated.View
        style={[
          styles.cardWrap,
          { transform: [{ translateY: cardTranslate }], opacity: cardOpacity },
        ]}
      >
        <BlurView intensity={55} tint="light" style={styles.blur}>
          <View style={styles.glassInner}>

            {/* 기능 소개 */}
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']}
                  style={styles.featureIconWrap}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </LinearGradient>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 그라디언트 CTA 버튼 */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.88}
              style={styles.btnTouchable}
            >
              <LinearGradient
                colors={Gradients.sunset}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btnGradient, loading && { opacity: 0.65 }]}
              >
                {/* shimmer 레이어 */}
                <Animated.View
                  style={[
                    styles.shimmerBar,
                    { transform: [{ translateX: shimmerX }] },
                  ]}
                  pointerEvents="none"
                />

                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.btnText}>Google로 시작하기</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.terms}>
              시작하면 이용약관 및 개인정보처리방침에 동의한 것으로 간주합니다.
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F2B5B',
  },

  // 빛 원형 배경 장식
  glow1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(14,165,233,0.18)',
    top: -80,
    right: -80,
  },
  glow2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.14)',
    top: H * 0.25,
    left: -60,
  },

  // 브랜드 타이틀
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // 글로우
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 44,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 10,
    // 텍스트 글로우 효과 (iOS)
    textShadowColor: 'rgba(56,189,248,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 28,
  },

  // 글래스 카드
  cardWrap: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  blur: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  glassInner: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 44,
  },

  // 기능 행
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginVertical: 22,
  },

  // 버튼
  btnTouchable: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.glowAccent,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-20deg' }],
  },
  googleG: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#fff',
    fontStyle: 'italic',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.3,
  },

  terms: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
  },
});
