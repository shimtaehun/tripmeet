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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';

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

      navigation.replace('Matching', { locationName: locationName.trim() });
    } catch {
      Alert.alert('오류', '위치 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>현재 여행 중인 곳은?</Text>
      <Text style={styles.description}>
        GPS를 사용하지 않습니다. 직접 입력해주세요.
      </Text>

      <Text style={styles.label}>여행지 이름</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="예: 홍대, 서귀포, 도쿄"
      />

      <Text style={styles.label}>국가</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="예: 한국, 일본"
      />

      <Text style={styles.label}>지역 (선택)</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="예: 서울, 제주, 도쿄도"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>이 곳에 있어요</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  description: { fontSize: 13, color: '#9CA3AF', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  button: {
    marginTop: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
