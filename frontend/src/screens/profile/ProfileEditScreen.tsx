import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { compressImage } from '../../utils/imageCompressor';

export default function ProfileEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialProfile = route.params?.profile;

  const [nickname, setNickname] = useState(initialProfile?.nickname ?? '');
  const [bio, setBio] = useState(initialProfile?.bio ?? '');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (picked.canceled) return;

    setLoading(true);
    try {
      const { base64, mimeType } = await compressImage(picked.assets[0].uri);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const blob = await fetch(`data:${mimeType};base64,${base64}`).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', blob as any, 'profile.jpg');

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('업로드 실패');

      Alert.alert('완료', '프로필 사진이 변경되었습니다.');
    } catch (e) {
      console.error('이미지 업로드 오류:', e);
      Alert.alert('오류', '이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim(), bio: bio.trim() || null }),
      });
      if (!res.ok) throw new Error('저장 실패');

      navigation.goBack();
    } catch (e) {
      console.error('프로필 저장 오류:', e);
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage} disabled={loading}>
          <Text style={styles.imageButtonText}>프로필 사진 변경</Text>
        </TouchableOpacity>

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임 입력"
          placeholderTextColor="#9CA3AF"
          maxLength={50}
        />

        <Text style={styles.label}>자기소개</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="자기소개 입력 (선택)"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          maxLength={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  cancelText: { fontSize: 15, color: '#6B7280' },
  saveText: { fontSize: 15, color: '#3B82F6', fontWeight: '600' },
  body: { padding: 24 },
  imageButton: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  imageButtonText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  bioInput: { height: 100 },
});
