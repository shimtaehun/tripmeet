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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow } from '../../utils/theme';

interface UserProfile {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
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

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
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
        colors={['#0F2B5B', '#1E3A8A', '#2563EB', '#0EA5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* 배경 장식 */}
        <View style={styles.headerGlow} />

        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
          <View style={styles.avatarRing}>
            <Image
              source={
                profile?.profile_image_url
                  ? { uri: profile.profile_image_url }
                  : require('../../../assets/icon.png')
              }
              style={styles.avatar}
            />
          </View>
          {/* 온라인 배지 */}
          <LinearGradient colors={Gradients.emerald} style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>여행중</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.nickname}>{profile?.nickname ?? '닉네임 없음'}</Text>
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>자기소개를 추가해보세요 ✏️</Text>
        )}
      </LinearGradient>

      {/* 메뉴 카드 */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('ProfileEdit', { profile })}
          activeOpacity={0.7}
        >
          <LinearGradient colors={Gradients.tileAI} style={styles.menuIconWrap}>
            <Text style={styles.menuIconEmoji}>✏️</Text>
          </LinearGradient>
          <Text style={styles.menuLabel}>프로필 수정</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LinearGradient colors={[Colors.redLight, '#FFE4E6']} style={styles.menuIconWrap}>
            <Text style={styles.menuIconEmoji}>🚪</Text>
          </LinearGradient>
          <Text style={[styles.menuLabel, styles.menuLabelDestructive]}>로그아웃</Text>
          <Text style={[styles.menuArrow, { color: Colors.red }]}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>TripMeet v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(14,165,233,0.15)',
    top: -60,
    right: -40,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.50)',
    overflow: 'hidden',
    ...Shadow.strong,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 52 },
  onlineBadge: {
    marginTop: -12,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineBadgeText: { fontSize: 11, fontWeight: '700' as const, color: '#fff' },
  nickname: { fontSize: 24, fontWeight: '800' as const, color: '#fff', marginBottom: 6 },
  bio: { fontSize: 14, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 20 },
  bioEmpty: { fontSize: 13, color: 'rgba(255,255,255,0.50)', fontStyle: 'italic' },

  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: 16,
    marginTop: 20,
    overflow: 'hidden',
    ...Shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  menuLabelDestructive: { color: Colors.red },
  menuArrow: { fontSize: 22, color: Colors.textLight },
  menuDivider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 16 },

  version: { textAlign: 'center', marginTop: 32, fontSize: 12, color: Colors.textLight },
});
