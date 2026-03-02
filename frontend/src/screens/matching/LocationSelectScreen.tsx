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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Radius, Shadow } from '../../utils/theme';

export default function LocationSelectScreen() {
  const navigation = useNavigation<any>();
  const [locationName, setLocationName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!locationName.trim() || !country.trim()) {
      Alert.alert('여행지와 국가를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/locations/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_name: locationName.trim(),
          country: country.trim(),
          region: region.trim() || null,
        }),
      });

      if (!res.ok) throw new Error();

      navigation.navigate('Main', {
        screen: 'Matching',
        params: { locationName: locationName.trim() },
      });
    } catch {
      Alert.alert('오류', '위치 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      {/* 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.titleIcon}>📍</Text>
        <Text style={styles.title}>현재 여행 중인 곳은?</Text>
        <Text style={styles.description}>
          GPS를 사용하지 않습니다.{'\n'}직접 입력해 같은 지역 여행자와 만나보세요.
        </Text>
      </View>

      {/* 입력 폼 카드 */}
      <View style={styles.formCard}>
        <Text style={styles.label}>여행지 이름 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={locationName}
          onChangeText={setLocationName}
          placeholder="예: 홍대, 서귀포, 도쿄"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>국가 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholder="예: 한국, 일본"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>지역 <Text style={styles.labelOptional}>(선택)</Text></Text>
        <TextInput
          style={styles.input}
          value={region}
          onChangeText={setRegion}
          placeholder="예: 서울, 제주, 도쿄도"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>이 곳에 있어요</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 48,
  },

  // 헤더
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },

  // 타이틀
  titleSection: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  titleIcon: {
    fontSize: 40,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },

  // 폼 카드
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: 16,
    padding: 20,
    ...Shadow.card,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMedium,
    marginBottom: 6,
    marginTop: 16,
  },
  required: {
    color: Colors.red,
  },
  labelOptional: {
    fontWeight: '400' as const,
    color: Colors.textLight,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },

  // 버튼
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.card,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
