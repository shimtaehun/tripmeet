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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

interface LocationPreset {
  label: string;
  locationName: string;
  country: string;
  region: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  { label: '홍대', locationName: '홍대', country: '한국', region: '서울' },
  { label: '강남', locationName: '강남', country: '한국', region: '서울' },
  { label: '명동', locationName: '명동', country: '한국', region: '서울' },
  { label: '해운대', locationName: '해운대', country: '한국', region: '부산' },
  { label: '제주', locationName: '제주', country: '한국', region: '제주' },
  { label: '경주', locationName: '경주', country: '한국', region: '경북' },
  { label: '속초', locationName: '속초', country: '한국', region: '강원' },
  { label: '여수', locationName: '여수', country: '한국', region: '전남' },
  { label: '도쿄', locationName: '도쿄', country: '일본', region: '도쿄도' },
  { label: '오사카', locationName: '오사카', country: '일본', region: '오사카부' },
  { label: '방콕', locationName: '방콕', country: '태국', region: '방콕' },
  { label: '다낭', locationName: '다낭', country: '베트남', region: '다낭' },
  { label: '파리', locationName: '파리', country: '프랑스', region: '일드프랑스' },
  { label: '뉴욕', locationName: '뉴욕', country: '미국', region: '뉴욕주' },
  { label: '바르셀로나', locationName: '바르셀로나', country: '스페인', region: '카탈루냐' },
];

export default function LocationSelectScreen() {
  const navigation = useNavigation<any>();
  const [locationName, setLocationName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset: LocationPreset) => {
    setLocationName(preset.locationName);
    setCountry(preset.country);
    setRegion(preset.region);
  };

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
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.titleSection}>
        <LinearGradient
          colors={Gradients.indigo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <Ionicons name="location" size={28} color="#fff" />
        </LinearGradient>
        <Text style={styles.title}>현재 여행 중인 곳은?</Text>
        <Text style={styles.description}>
          GPS를 사용하지 않습니다.{'\n'}직접 입력해 같은 지역 여행자와 만나보세요.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>인기 여행지</Text>
        <View style={styles.presetGrid}>
          {LOCATION_PRESETS.map((preset) => {
            const isSelected = locationName === preset.locationName;
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                onPress={() => applyPreset(preset)}
                activeOpacity={0.75}
              >
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>여행지 이름 <Text style={styles.required}>*</Text></Text>
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
        style={styles.submitBtnWrap}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Gradients.indigo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.submitBtn, loading && { opacity: 0.65 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>이 곳에 있어요</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  header: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: { fontSize: 15, color: '#fff', fontWeight: '600' as const },

  titleSection: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },

  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.screenPad,
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
  required: { color: Colors.red },
  labelOptional: { fontWeight: '400' as const, color: Colors.textLight },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },

  submitBtnWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.screenPad,
    marginTop: 24,
    ...Shadow.coral,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },

  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 13,
    color: Colors.textMedium,
    fontWeight: '500' as const,
  },
  presetChipTextSelected: {
    color: '#fff',
    fontWeight: '700' as const,
  },
});
