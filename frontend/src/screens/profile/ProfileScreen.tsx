import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Spacing, Typography } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

interface UserProfile {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const avatarScale = useRef(new Animated.Value(0.85)).current;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('프로필 조회 실패');

      const data = await res.json();
      setProfile(data);

      // 아바타 팝인 애니메이션
      Animated.spring(avatarScale, {
        toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
      }).start();
    } catch (e) {
      console.error('프로필 조회 오류:', e);
      Alert.alert('오류', '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const handleLogout = async () => {
    // 웹에서는 Alert.alert의 다중 버튼 onPress가 동작하지 않으므로
    // window.confirm으로 대체하고, 네이티브는 Alert.alert를 유지한다.
    const confirmed = await new Promise<boolean>((resolve) => {
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        resolve(window.confirm('로그아웃하시겠습니까?'));
      } else {
        Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
          { text: '취소', style: 'cancel', onPress: () => resolve(false) },
          { text: '로그아웃', style: 'destructive', onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange가 session=null로 변경하면 RootNavigator가 자동으로 LoginScreen으로 이동
    } catch (e) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 그라디언트 프로필 헤더 */}
      <LinearGradient
        colors={Gradients.profile}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isDesktop && { paddingTop: TOP_NAV_H + 40 }]}
      >
        <View style={styles.headerGlow} />

        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
          <View style={[styles.avatarRing, isDesktop && { width: 140, height: 140, borderRadius: 70 }]}>
            <Image
              source={
                profile?.profile_image_url
                  ? { uri: profile.profile_image_url }
                  : require('../../../assets/icon.png')
              }
              style={styles.avatar}
              accessibilityLabel={`${profile?.nickname ?? '사용자'} 프로필 사진`}
            />
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>활동중</Text>
          </View>
        </Animated.View>

        <Text style={[styles.nickname, isDesktop && { fontSize: 30 }]}>
          {profile?.nickname ?? '닉네임 없음'}
        </Text>
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>자기소개를 추가해보세요</Text>
        )}

        {/* 통계 row */}
        <View style={styles.statsRow}>
          <View style={styles.statsPill}>
            <Text style={styles.statsPillText}>게시글 0개</Text>
          </View>
          <View style={styles.statsPill}>
            <Text style={styles.statsPillText}>동행 0개</Text>
          </View>
          <View style={styles.statsPill}>
            <Text style={styles.statsPillText}>팔로워 0명</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 계정 섹션 */}
      <View style={[styles.sectionWrap, isDesktop && { maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
        <Text style={styles.sectionLabel}>계정 설정</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('ProfileEdit', { profile })}
            activeOpacity={0.7}
          >
            <LinearGradient colors={Gradients.profile} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuIconWrap}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuLabel}>프로필 수정</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('MyActivity')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={Gradients.community} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuIconWrap}>
              <Ionicons name="document-text-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuLabel}>내 활동 내역</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={[styles.sectionWrap, isDesktop && { maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
        <Text style={styles.sectionLabel}>앱 정보</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('공지사항', '준비 중입니다.')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={Gradients.companion} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuIconWrap}>
              <Ionicons name="megaphone-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuLabel}>공지사항</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('이용약관', '준비 중입니다.')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={Gradients.indigo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuIconWrap}>
              <Ionicons name="document-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuLabel}>이용약관</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#DC2626', '#EF4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuIconWrap}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={[styles.menuLabel, styles.menuLabelDestructive]}>로그아웃</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.version}>TripMeet v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // 루트 레이아웃
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: { paddingBottom: 48 },

  // 프로필 헤더 (LinearGradient 위에 overlay되는 카드 영역)
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59,130,246,0.10)',
    top: -60,
    right: -40,
  },

  // 아바타
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: Radius.full,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.50)',
    overflow: 'hidden',
    ...Shadow.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
  },

  // 온라인 배지
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -12,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },

  // 닉네임·소개
  nickname: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 20,
  },
  bioEmpty: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    fontStyle: 'italic' as const,
  },

  // 통계 pills (배지/태그)
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statsPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statsPillText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },

  // 섹션
  sectionWrap: {
    marginHorizontal: Spacing.screenPad,
    marginTop: 20,
  },
  sectionLabel: {
    ...Typography.h3,
    marginBottom: 8,
    marginLeft: 4,
  },

  // 메뉴 카드
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 0,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  menuLabelDestructive: { color: Colors.red },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 16,
  },

  // 버전 텍스트
  version: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 12,
    color: Colors.textLight,
  },
});
