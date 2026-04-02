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
import { apiFetch } from '../../services/apiClient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

export default function ItineraryFormScreen() {
  const navigation = useNavigation<any>();
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [travelersCount, setTravelersCount] = useState('1');
  const [budgetWon, setBudgetWon] = useState('');
  const [customRequests, setCustomRequests] = useState('');

  const handleDurationChange = (text: string) => {
    setDurationDays(text.replace(/[^0-9]/g, ''));
  };

  const handleTravelersChange = (text: string) => {
    setTravelersCount(text.replace(/[^0-9]/g, '') || '1');
  };

  const handleBudgetChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') { setBudgetWon(''); return; }
    setBudgetWon(Number(digits).toLocaleString('ko-KR'));
  };
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

      const res = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/itineraries/`, {
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
          custom_requests: customRequests.trim() || null,
        }),
      });

      if (!res.ok) {
        let detail = '일정 생성에 실패했습니다.';
        try {
          const body = await res.json();
          if (body.detail) detail = body.detail;
        } catch {}
        throw new Error(detail);
      }

      const data = await res.json();
      navigation.navigate('ItineraryResult', { itinerary: data });
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '일정 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={Gradients.ai as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.heroIconWrap}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>AI 여행 일정 만들기</Text>
        <Text style={styles.heroSubtitle}>AI가 최적의 동선을 설계합니다</Text>
        <Text style={styles.heroDesc}>조건을 입력하면 AI가 완성된 일정을 만들어드려요.</Text>
      </LinearGradient>

      <View style={styles.formCard}>
        {/* 여행지 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>여행지 <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, focusedField === 'destination' && styles.inputWrapFocused]}>
            <Ionicons name="globe-outline" size={18} color={focusedField === 'destination' ? Colors.primary : Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="예: 제주도, 오사카, 방콕"
              placeholderTextColor={Colors.textLight}
              onFocus={() => setFocusedField('destination')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* 여행 기간 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>여행 기간 <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, focusedField === 'duration' && styles.inputWrapFocused]}>
            <Ionicons name="calendar-outline" size={18} color={focusedField === 'duration' ? Colors.primary : Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={durationDays}
              onChangeText={handleDurationChange}
              placeholder="예: 3 (일)"
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
              maxLength={2}
              onFocus={() => setFocusedField('duration')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* 인원 수 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>인원 수</Text>
          <View style={[styles.inputWrap, focusedField === 'travelers' && styles.inputWrapFocused]}>
            <Ionicons name="people-outline" size={18} color={focusedField === 'travelers' ? Colors.primary : Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={travelersCount}
              onChangeText={handleTravelersChange}
              placeholder="예: 1 (명)"
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
              maxLength={2}
              onFocus={() => setFocusedField('travelers')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* 예산 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>예산 <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, focusedField === 'budget' && styles.inputWrapFocused]}>
            <Ionicons name="wallet-outline" size={18} color={focusedField === 'budget' ? Colors.primary : Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={budgetWon}
              onChangeText={handleBudgetChange}
              placeholder="예: 300,000 (원)"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
              onFocus={() => setFocusedField('budget')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* 추가 요구사항 */}
        <View style={[styles.fieldGroup, { borderBottomWidth: 0 }]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>추가 요구사항</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>선택</Text>
            </View>
          </View>
          <Text style={styles.fieldHint}>
            식사, 활동, 스타일 등 원하는 사항을 자유롭게 입력하면 AI가 반영합니다
          </Text>
          <View style={[styles.inputWrap, styles.textareaWrap, focusedField === 'custom' && styles.inputWrapFocused]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={customRequests}
              onChangeText={setCustomRequests}
              placeholder={'예: 아침은 현지 라멘집, 저녁은 이자카야\n미술관보다는 시장 구경을 선호해요\n걸어다니기 좋은 코스로 짜주세요'}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setFocusedField('custom')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {customRequests.trim().length > 0 && (
            <View style={styles.customHintRow}>
              <Ionicons name="information-circle" size={13} color={Colors.purple} />
              <Text style={styles.customHintText}>추가 요구사항이 있으면 캐시를 사용하지 않고 새로 생성합니다</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.btnWrap}
        onPress={handleGenerate}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Gradients.coral as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btn, loading && { opacity: 0.65 }]}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.btnText}>일정 생성 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.btnText}>일정 만들기</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('MyItineraries')}
        activeOpacity={0.8}
      >
        <Ionicons name="bookmark-outline" size={16} color={Colors.purple} />
        <Text style={styles.historyBtnText}>저장된 일정 보기</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.purple} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  heroBanner: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: Spacing.screenPad,
    gap: 10,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff', textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.80)', textAlign: 'center', fontWeight: '500' as const },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.60)', textAlign: 'center', lineHeight: 20 },

  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.screenPad,
    marginTop: 20,
    overflow: 'hidden',
    ...Shadow.card,
  },
  fieldGroup: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: 12, fontWeight: '700' as const, color: Colors.textMedium, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  required: { color: Colors.red },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingLeft: 14,
    paddingRight: 12,
    minHeight: 48,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryLight,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 10,
  },

  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  optionalBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionalText: { fontSize: 10, fontWeight: '600' as const, color: Colors.textLight },
  fieldHint: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 10,
  },
  textareaWrap: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 110,
  },
  textarea: {
    paddingVertical: 0,
    minHeight: 88,
    lineHeight: 22,
  },
  customHintRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  customHintText: {
    fontSize: 11,
    color: Colors.purple,
    fontWeight: '500' as const,
  },

  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: Spacing.screenPad,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.purpleBorder,
    backgroundColor: Colors.purpleLight,
  },
  historyBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.purple,
  },

  btnWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.screenPad,
    marginTop: 24,
    ...Shadow.coral,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
});
