import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      <Text style={styles.nickname}>{profile?.nickname}</Text>
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
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
  },
  editButtonText: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },
  logoutButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#9CA3AF', fontSize: 14 },
});
