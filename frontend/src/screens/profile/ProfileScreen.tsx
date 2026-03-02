import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={
          profile?.profile_image_url
            ? { uri: profile.profile_image_url }
            : require('../../../assets/icon.png')
        }
        style={styles.avatar}
      />
      <Text style={styles.nickname}>{profile?.nickname ?? '닉네임 없음'}</Text>
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit', { profile })}
      >
        <Text style={styles.editButtonText}>프로필 수정</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 60,
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  editButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  editButtonText: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },
  logoutButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#9CA3AF', fontSize: 14 },
});
