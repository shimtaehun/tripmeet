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
});
