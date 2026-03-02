import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabaseClient';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

WebBrowser.maybeCompleteAuthSession();

const FEATURES = [
  { icon: '✈', label: 'AI 맞춤 일정', desc: '목적지·기간·예산만 입력하면 완성' },
  { icon: '🤝', label: '현지 여행자 매칭', desc: '같은 도시의 여행자와 실시간 연결' },
  { icon: '🗺', label: '동행 & 맛집 공유', desc: '커뮤니티가 직접 검증한 정보' },
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  // state 업데이트 지연으로 인한 중복 호출 방지
  const loginInProgress = useRef(false);

  const handleGoogleLogin = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setLoading(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');

      if (Platform.OS === 'web') {
        // 웹: signInWithOAuth가 브라우저를 직접 리디렉션하므로 추가 처리 불필요
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
      } else {
        // 네이티브: WebBrowser로 인앱 브라우저 열고 PKCE 코드 교환
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });

        if (error) throw error;

        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

          if (result.type === 'success' && result.url) {
            // PKCE 플로우: Supabase가 콜백 URL에 code 파라미터를 붙여 반환
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

      {/* 상단 히어로 영역 */}
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>✈</Text>
        </View>
        <Text style={styles.appName}>TripMeet</Text>
        <Text style={styles.heroTagline}>혼자 떠나도 함께하는 여행</Text>
        <Text style={styles.heroSub}>
          같은 도시를 여행 중인 사람과 연결되는{'\n'}여행자 커뮤니티
        </Text>
      </View>

      {/* 기능 소개 카드 */}
      <View style={styles.card}>
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>{f.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* Google 로그인 버튼 */}
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          시작하면 서비스 이용약관 및 개인정보처리방침에 동의한 것으로 간주합니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  // 히어로
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 34,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // 하단 카드
  card: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    ...Shadow.strong,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.textMedium,
  },

  // Google 버튼
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    marginTop: 24,
    gap: 10,
    ...Shadow.card,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  termsText: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
