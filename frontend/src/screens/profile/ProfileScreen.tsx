import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

interface UserProfile {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
}

const MENU_ITEMS = [
  { label: '프로필 수정', icon: '✏️', action: 'edit' },
  { label: '로그아웃', icon: '🚪', action: 'logout', destructive: true },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error('프로필 조회 실패');

      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error('프로필 조회 오류:', e);
      Alert.alert('오류', '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 프로필 수정 후 돌아왔을 때 자동 갱신
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 프로필 헤더 */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              profile?.profile_image_url
                ? { uri: profile.profile_image_url }
                : require('../../../assets/icon.png')
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.nickname}>{profile?.nickname ?? '닉네임 없음'}</Text>
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>자기소개를 추가해보세요</Text>
        )}
      </View>

      {/* 메뉴 카드 */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('ProfileEdit', { profile })}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuLabel}>프로필 수정</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuLabel, styles.menuLabelDestructive]}>로그아웃</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.appVersion}>TripMeet v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 48,
  },

  // 헤더
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: Colors.primaryLight,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  nickname: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  bioEmpty: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },

  // 메뉴 카드
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: 16,
    marginTop: 20,
    ...Shadow.card,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  menuLabelDestructive: {
    color: Colors.red,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 18,
  },

  appVersion: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 12,
    color: Colors.textLight,
  },
});
