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

export default function ItineraryFormScreen() {
  const navigation = useNavigation<any>();
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [travelersCount, setTravelersCount] = useState('1');
  const [budgetWon, setBudgetWon] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!destination.trim() || !durationDays || !budgetWon) {
      Alert.alert('여행지, 기간, 예산을 모두 입력해주세요.');
      return;
    }

    const days = parseInt(durationDays, 10);
    const travelers = parseInt(travelersCount, 10);
    const budget = parseInt(budgetWon.replace(/,/g, ''), 10);

    if (isNaN(days) || days < 1 || isNaN(budget) || budget < 1) {
      Alert.alert('기간과 예산은 숫자로 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/itineraries/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          duration_days: days,
          travelers_count: travelers,
          budget_won: budget,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      navigation.navigate('ItineraryResult', { itinerary: data });
    } catch {
      Alert.alert('오류', '일정 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>AI 여행 일정 만들기</Text>
      <Text style={styles.description}>조건을 입력하면 AI가 완성된 일정을 만들어드려요.</Text>

      <Text style={styles.label}>여행지</Text>
      <TextInput
        style={styles.input}
        value={destination}
        onChangeText={setDestination}
        placeholder="예: 제주도, 오사카, 방콕"
      />

      <Text style={styles.label}>여행 기간 (일)</Text>
      <TextInput
        style={styles.input}
        value={durationDays}
        onChangeText={setDurationDays}
        placeholder="예: 3"
        keyboardType="numeric"
        maxLength={2}
      />

      <Text style={styles.label}>인원 수</Text>
      <TextInput
        style={styles.input}
        value={travelersCount}
        onChangeText={setTravelersCount}
        placeholder="예: 1"
        keyboardType="numeric"
        maxLength={2}
      />

      <Text style={styles.label}>예산 (원)</Text>
      <TextInput
        style={styles.input}
        value={budgetWon}
        onChangeText={setBudgetWon}
        placeholder="예: 300000"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.loadingText}>일정 생성 중...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>일정 만들기</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 24, marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
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
    marginTop: 36,
    marginBottom: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#fff', fontSize: 15 },
});
