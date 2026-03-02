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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { compressImage } from '../../utils/imageCompressor';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
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

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      Alert.alert('완료', '프로필 사진이 변경되었습니다.');
    } catch (e) {
      Alert.alert('오류', '이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim(), bio: bio.trim() || null }),
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>프로필 사진</Text>
      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage} disabled={loading}>
        <Text style={styles.imageButtonText}>사진 변경</Text>
      </TouchableOpacity>

      <Text style={styles.label}>닉네임</Text>
      <TextInput
        style={styles.input}
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임 입력"
        maxLength={50}
      />

      <Text style={styles.label}>자기소개</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="자기소개 입력 (선택)"
        multiline
        maxLength={200}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>저장</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  bioInput: { height: 100, textAlignVertical: 'top' },
  imageButton: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageButtonText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
