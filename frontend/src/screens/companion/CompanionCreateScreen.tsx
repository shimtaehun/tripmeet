import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createCompanion, updateCompanion, getCompanion } from '../../services/companionService';
import { Colors, Radius, Spacing } from '../../utils/theme';

export default function CompanionCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editCompanionId: string | undefined = route.params?.companionId;
  const isEditMode = !!editCompanionId;

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!editCompanionId) return;
    getCompanion(editCompanionId).then(data => {
      setDestination(data.destination);
      setStartDate(data.travel_start_date);
      setEndDate(data.travel_end_date);
      setDescription(data.description);
      setMaxParticipants(String(data.max_participants));
    }).catch(() => {
      Alert.alert('오류', '동행 정보를 불러올 수 없습니다.');
      navigation.goBack();
    });
  }, [editCompanionId]);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!destination.trim()) {
      setErrorMsg('여행지를 입력해주세요.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim())) {
      setErrorMsg('날짜 형식을 YYYY-MM-DD로 입력해주세요.');
      return;
    }
    if (startDate > endDate) {
      setErrorMsg('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('동행 조건을 입력해주세요.');
      return;
    }
    const max = parseInt(maxParticipants, 10);
    if (isNaN(max) || max < 2 || max > 10) {
      setErrorMsg('모집 인원은 2~10명 사이로 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateCompanion(editCompanionId!, {
          destination: destination.trim(),
          travel_start_date: startDate.trim(),
          travel_end_date: endDate.trim(),
          description: description.trim(),
          max_participants: max,
        });
      } else {
        await createCompanion({
          destination: destination.trim(),
          travel_start_date: startDate.trim(),
          travel_end_date: endDate.trim(),
          description: description.trim(),
          max_participants: max,
        });
      }
      navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Companion' } }] });
    } catch (e: any) {
      console.error('동행 구인 저장 오류:', e);
      setErrorMsg(e?.message ?? (isEditMode ? '동행 구인 수정에 실패했습니다.' : '동행 구인 등록에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSideBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={22} color={Colors.textMedium} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '동행 구인 수정' : '동행 구인 등록'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.headerSideBtn}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.submitText}>{isEditMode ? '수정' : '등록'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행지 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="예: 도쿄, 방콕, 제주도"
          placeholderTextColor={Colors.textLight}
          value={destination}
          onChangeText={setDestination}
          maxLength={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행 시작일 <Text style={styles.required}>*</Text> <Text style={styles.labelHint}>(YYYY-MM-DD)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="예: 2026-05-01"
          placeholderTextColor={Colors.textLight}
          value={startDate}
          onChangeText={setStartDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>여행 종료일 <Text style={styles.required}>*</Text> <Text style={styles.labelHint}>(YYYY-MM-DD)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="예: 2026-05-07"
          placeholderTextColor={Colors.textLight}
          value={endDate}
          onChangeText={setEndDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>최대 모집 인원 <Text style={styles.required}>*</Text> <Text style={styles.labelHint}>(2~10명)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="예: 3"
          placeholderTextColor={Colors.textLight}
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          maxLength={2}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>동행 조건 및 설명 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="동행 조건, 일정 계획, 원하는 동반자 스타일 등을 자유롭게 작성해주세요."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSideBtn: { width: 44, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  submitText: { fontSize: 15, color: Colors.primary, fontWeight: '700' as const },

  section: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.screenPad,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 8,
  },
  label: { fontSize: 13, fontWeight: '600' as const, color: Colors.textMedium, marginBottom: 10 },
  required: { color: Colors.red },
  labelHint: { fontWeight: '400' as const, color: Colors.textLight },

  input: {
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  descriptionInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 160,
    paddingVertical: 4,
    lineHeight: 24,
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { fontSize: 13, color: '#DC2626' },
});
