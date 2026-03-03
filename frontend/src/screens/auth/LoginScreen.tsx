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
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Animation } from '../../utils/theme';

WebBrowser.maybeCompleteAuthSession();

const { width: W, height: H } = Dimensions.get('window');

// 떠다니는 파티클 정의
const PARTICLES = [
  { emoji: '✈', top: 0.10, left: 0.08, size: 28, duration: 3200, delay: 0,    driftX: 12 },
  { emoji: '🌍', top: 0.22, left: 0.75, size: 34, duration: 3800, delay: 600,  driftX: -8 },
  { emoji: '🗺', top: 0.06, left: 0.50, size: 24, duration: 4200, delay: 1000, driftX: 10 },
  { emoji: '⛵', top: 0.38, left: 0.04, size: 22, duration: 2900, delay: 1400, driftX: 14 },
  { emoji: '☀️', top: 0.14, left: 0.82, size: 26, duration: 3500, delay: 300,  driftX: -10 },
  { emoji: '🏔', top: 0.44, left: 0.88, size: 20, duration: 4600, delay: 900,  driftX: -6 },
  { emoji: '🌊', top: 0.30, left: 0.32, size: 24, duration: 3900, delay: 1200, driftX: 8  },
  { emoji: '⭐', top: 0.04, left: 0.68, size: 18, duration: 2600, delay: 400,  driftX: -12 },
];

function FloatingParticle({
  emoji, top, left, size, duration, delay, driftX,
}: (typeof PARTICLES)[0]) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0.6,
      duration: 900,
      delay,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: -16, duration, useNativeDriver: true }),
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

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });

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

const FEATURES = [
  { icon: 'sparkles' as const,          label: 'AI 맞춤 일정',        desc: '목적지·기간·예산으로 자동 완성' },
  { icon: 'location' as const,          label: '실시간 여행자 매칭',   desc: '같은 도시 여행자와 즉시 연결' },
  { icon: 'restaurant' as const,        label: '맛집 & 커뮤니티',      desc: '현지인이 검증한 정보 공유' },
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const loginInProgress = useRef(false);

  const cardTranslate = useRef(new Animated.Value(60)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;
  const shimmer       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardTranslate, {
        toValue: 0, duration: Animation.entrance, delay: 400, useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, duration: Animation.entrance, delay: 400, useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(shimmer, { toValue: 1, duration: 650, useNativeDriver: true }),
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

      <LinearGradient
        colors={Gradients.hero}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 광원 효과 */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* 파티클 */}
      {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

      {/* 브랜드 타이틀 */}
      <View style={styles.titleSection}>
        <View style={styles.logoRing}>
          <Text style={styles.logoEmoji}>✈</Text>
        </View>
        <Text style={styles.appName}>TripMeet</Text>
        <View style={styles.goldLine} />
        <Text style={styles.tagline}>혼자 떠나도{'\n'}함께하는 여행</Text>
      </View>

      {/* 글래스모피즘 바텀 카드 */}
      <Animated.View
        style={[
          styles.cardWrap,
          { transform: [{ translateY: cardTranslate }], opacity: cardOpacity },
        ]}
      >
        <BlurView intensity={50} tint="light" style={styles.blur}>
          <View style={styles.glassInner}>

            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}
              >
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={20} color={Colors.gold} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            {/* 골드 CTA 버튼 */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.88}
              style={styles.btnTouchable}
            >
              <LinearGradient
                colors={Gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btnGradient, loading && { opacity: 0.65 }]}
              >
                <Animated.View
                  style={[styles.shimmerBar, { transform: [{ translateX: shimmerX }] }]}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primaryDeep,
  },

  glow1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(44,82,130,0.22)',
    top: -80,
    right: -70,
  },
  glow2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(201,169,110,0.10)',
    top: H * 0.28,
    left: -50,
  },

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
    borderWidth: 1.5,
    borderColor: 'rgba(201,169,110,0.50)',
    backgroundColor: 'rgba(201,169,110,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: 46,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 10,
    textShadowColor: 'rgba(201,169,110,0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  goldLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 1,
    marginBottom: 14,
    opacity: 0.8,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 26,
  },

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
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 44,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.35)',
    backgroundColor: 'rgba(201,169,110,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 22,
  },

  btnTouchable: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.glowGold,
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
    width: 70,
    backgroundColor: 'rgba(255,255,255,0.22)',
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
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
  },
});
