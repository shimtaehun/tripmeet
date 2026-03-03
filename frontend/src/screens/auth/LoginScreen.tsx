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
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Animation, Spacing } from '../../utils/theme';

WebBrowser.maybeCompleteAuthSession();

const { width: W } = Dimensions.get('window');

const FEATURES = [
  { icon: 'sparkles' as const,    label: 'AI 맞춤 일정',      desc: '목적지·기간·예산으로 자동 완성' },
  { icon: 'location' as const,    label: '실시간 여행자 매칭', desc: '같은 도시 여행자와 즉시 연결' },
  { icon: 'restaurant' as const,  label: '맛집 & 커뮤니티',   desc: '현지인이 검증한 정보 공유' },
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const loginInProgress = useRef(false);

  const cardTranslate = useRef(new Animated.Value(60)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.8)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1, tension: 70, friction: 8, useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1, duration: Animation.entrance, useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 0, duration: Animation.entrance, delay: 200, useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, duration: Animation.entrance, delay: 200, useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

      {/* 배경 광원 */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* 브랜드 영역 */}
      <Animated.View
        style={[styles.titleSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <View style={styles.logoRing}>
          <Ionicons name="airplane" size={32} color={Colors.coral} />
        </View>
        <Text style={styles.appName}>TripMeet</Text>
        <View style={styles.accentLine} />
        <Text style={styles.tagline}>혼자 떠나도{'\n'}함께하는 여행</Text>
      </Animated.View>

      {/* 바텀 카드 */}
      <Animated.View
        style={[
          styles.cardWrap,
          { transform: [{ translateY: cardTranslate }], opacity: cardOpacity },
        ]}
      >
        <View style={styles.card}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}
            >
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.88}
            style={[styles.btn, loading && styles.btnDisabled]}
          >
            <LinearGradient
              colors={Gradients.coral}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59,130,246,0.20)',
    top: -60,
    right: -60,
  },
  glow2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,107,53,0.08)',
    top: '30%',
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
    borderColor: 'rgba(255,107,53,0.45)',
    backgroundColor: 'rgba(255,107,53,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 46,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 10,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.coral,
    borderRadius: 1,
    marginBottom: 14,
    opacity: 0.85,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
    lineHeight: 26,
  },

  cardWrap: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.screenPad,
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
    borderBottomColor: Colors.border,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textLight,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 22,
  },

  btn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.coral,
  },
  btnDisabled: { opacity: 0.65 },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
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
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
  },
});
