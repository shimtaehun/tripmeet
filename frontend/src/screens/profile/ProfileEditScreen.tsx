import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { compressImage } from '../../utils/imageCompressor';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../../utils/theme';

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
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 사진 변경 버튼 */}
        <TouchableOpacity
          style={styles.imageBtn}
          onPress={handlePickImage}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color={Colors.primary} />
          <Text style={styles.imageBtnText}>프로필 사진 변경</Text>
        </TouchableOpacity>

        {/* 닉네임 */}
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임 입력"
          placeholderTextColor={Colors.textLight}
          maxLength={50}
        />

        {/* 자기소개 */}
        <Text style={styles.label}>자기소개 <Text style={styles.labelOptional}>(선택)</Text></Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="여행 스타일, 관심사 등을 적어보세요"
          placeholderTextColor={Colors.textLight}
          multiline
          textAlignVertical="top"
          maxLength={200}
        />
        <Text style={styles.charCount}>{bio.length} / 200</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.textMedium,
  },
  saveText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700' as const,
  },

  // 바디
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  imageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginBottom: 24,
    ...Shadow.card,
  },
  imageBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700' as const,
  },

  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMedium,
    marginBottom: 6,
    marginTop: 16,
  },
  labelOptional: {
    fontWeight: '400' as const,
    color: Colors.textLight,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  bioInput: {
    height: 110,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
});
