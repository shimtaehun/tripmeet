import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createCompanion } from '../../services/companionService';

export default function CompanionCreateScreen() {
  const navigation = useNavigation<any>();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!destination.trim()) {
      Alert.alert('알림', '여행지를 입력해주세요.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim())) {
      Alert.alert('알림', '날짜 형식을 YYYY-MM-DD로 입력해주세요.');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('알림', '시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('알림', '동행 조건을 입력해주세요.');
      return;
    }
    const max = parseInt(maxParticipants, 10);
    if (isNaN(max) || max < 2 || max > 10) {
      Alert.alert('알림', '모집 인원은 2~10명 사이로 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await createCompanion({
        destination: destination.trim(),
        travel_start_date: startDate.trim(),
        travel_end_date: endDate.trim(),
        description: description.trim(),
        max_participants: max,
      });
      navigation.goBack();
    } catch (e) {
      console.error('동행 구인 등록 오류:', e);
      Alert.alert('오류', '동행 구인 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>동행 구인 등록</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.submitText}>등록</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행지 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 도쿄, 방콕, 제주도"
          placeholderTextColor="#9CA3AF"
          value={destination}
          onChangeText={setDestination}
          maxLength={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행 시작일 * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 2026-05-01"
          placeholderTextColor="#9CA3AF"
          value={startDate}
          onChangeText={setStartDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행 종료일 * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 2026-05-07"
          placeholderTextColor="#9CA3AF"
          value={endDate}
          onChangeText={setEndDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>최대 모집 인원 * (2~10명)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 3"
          placeholderTextColor="#9CA3AF"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          maxLength={2}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>동행 조건 및 설명 *</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="동행 조건, 일정 계획, 원하는 동반자 스타일 등을 자유롭게 작성해주세요."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
      </View>
    </ScrollView>
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
  submitText: { fontSize: 15, color: '#3B82F6', fontWeight: '600' },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  descriptionInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 160,
    paddingVertical: 4,
  },
});
