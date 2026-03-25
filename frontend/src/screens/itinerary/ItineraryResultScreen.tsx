import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { apiFetch } from '../../services/apiClient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

interface Activity {
  time: string;
  type?: 'sightseeing' | 'meal';
  title: string;
  restaurant_name?: string;
  description: string;
  estimated_cost: number;
}

interface Day {
  day: number;
  date_label: string;
  activities: Activity[];
}

interface Itinerary {
  id: string;
  destination: string;
  duration_days: number;
  travelers_count: number;
  budget_range: string;
  content: { days: Day[] };
  is_cached: boolean;
}

// 시간대별 borderLeft 색상 반환 (한국어 오전/오후/저녁 및 HH:MM 형식 모두 지원)
function getTimeColor(time: string): string {
  if (time.includes('오전')) return Colors.amber;
  if (time.includes('오후')) return Colors.primary;
  if (time.includes('저녁') || time.includes('밤')) return Colors.purple;
  const match = time.match(/^(\d{1,2}):/);
  if (!match) return Colors.amber;
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return Colors.amber;
  if (hour >= 12 && hour < 18) return Colors.primary;
  if (hour >= 18 && hour < 24) return Colors.purple;
  return Colors.amber;
}

function getTimeDotColor(time: string): string {
  return getTimeColor(time);
}

function isMeal(activity: Activity): boolean {
  if (activity.type === 'meal') return true;
  const t = activity.time;
  return t.includes('아침') || t.includes('점심') || t.includes('저녁') || t.includes('식사');
}

export default function ItineraryResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [itinerary, setItinerary] = useState<Itinerary>(route.params.itinerary);
  const days: Day[] = itinerary.content?.days ?? [];

  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [revising, setRevising] = useState(false);

  const handleRevise = async () => {
    if (!revisionText.trim()) {
      Alert.alert('수정 요청 내용을 입력해주세요.');
      return;
    }
    setRevising(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await apiFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/itineraries/${itinerary.id}/revise`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ revision_request: revisionText.trim() }),
        },
      );

      if (!res.ok) {
        let detail = '일정 수정에 실패했습니다.';
        try { const b = await res.json(); if (b.detail) detail = b.detail; } catch {}
        throw new Error(detail);
      }

      const updated = await res.json();
      setItinerary((prev) => ({
        ...prev,
        content: updated.content,
        is_cached: false,
      }));
      setRevisionModalVisible(false);
      setRevisionText('');
      Alert.alert('수정 및 저장 완료', 'AI가 일정을 수정하고 저장 기록에 반영했습니다.');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setRevising(false);
    }
  };

  const handleShare = async () => {
    try {
      const text = [
        `[TripMeet] ${itinerary.destination} ${itinerary.duration_days}일 일정`,
        `인원: ${itinerary.travelers_count}명 / 예산: ${itinerary.budget_range}`,
        '',
        ...days.flatMap((day) => [
          `--- ${day.date_label} ---`,
          ...day.activities.map(
            (a) => `${a.time} | ${a.title}: ${a.description} (${a.estimated_cost.toLocaleString()}원)`,
          ),
        ]),
      ].join('\n');

      await Share.share({ message: text });
    } catch {
      Alert.alert('공유에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled
      nestedScrollEnabled
    >
      <LinearGradient
        colors={Gradients.ai}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Ionicons name="sparkles" size={18} color={Colors.coral} />
          <Text style={styles.headerBadge}>AI 생성 일정</Text>
          {itinerary.is_cached && (
            <View style={styles.cacheBadge}>
              <Text style={styles.cacheBadgeText}>캐시</Text>
            </View>
          )}
        </View>
        <Text style={styles.destination}>{itinerary.destination}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaPillText}>{itinerary.duration_days}일</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaPillText}>{itinerary.travelers_count}명</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="wallet-outline" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaPillText}>{itinerary.budget_range}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.dayList}>
        {days.map((day) => (
          <View key={day.day} style={styles.dayBlock}>
            {/* Day 헤더 — LinearGradient 전체 너비 */}
            <LinearGradient
              colors={Gradients.coral}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dayLabelRow}
            >
              <Text style={styles.dayNumText}>Day {day.day}</Text>
              <Text style={styles.dayLabel}>{day.date_label}</Text>
            </LinearGradient>

            {/* 활동 카드 목록 */}
            <View style={styles.activitiesWrap}>
              {day.activities.map((activity, idx) => {
                const meal = isMeal(activity);
                const timeColor = meal ? Colors.green : getTimeColor(activity.time);
                const dotColor  = timeColor;
                return (
                  <View key={idx} style={[styles.activityCard, { borderLeftColor: timeColor }]}>
                    <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                    <View style={styles.activityCardInner}>
                      <View style={styles.activityHeader}>
                        <View style={styles.timeRow}>
                          <Ionicons
                            name={meal ? 'restaurant-outline' : 'compass-outline'}
                            size={12}
                            color={timeColor}
                          />
                          <Text style={[styles.activityTime, { color: timeColor }]}>{activity.time}</Text>
                        </View>
                        {activity.estimated_cost > 0 && (
                          <View style={[styles.costBadge, meal && styles.mealCostBadge]}>
                            <Text style={[styles.costBadgeText, meal && styles.mealCostBadgeText]}>
                              {activity.estimated_cost.toLocaleString()}원
                            </Text>
                          </View>
                        )}
                      </View>
                      {meal && activity.restaurant_name ? (
                        <View style={styles.restaurantRow}>
                          <Ionicons name="storefront-outline" size={13} color={Colors.green} />
                          <Text style={styles.restaurantName}>{activity.restaurant_name}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDesc}>{activity.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomBtns}>
        {/* AI 수정 요청 버튼 */}
        <TouchableOpacity
          style={styles.reviseWrap}
          onPress={() => setRevisionModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.ai}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reviseBtn}
          >
            <Ionicons name="sparkles" size={18} color="#FCD34D" />
            <Text style={styles.reviseBtnText}>AI에게 수정 요청</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.savedBtn}
          onPress={() => navigation.navigate('MyItineraries')}
          activeOpacity={0.85}
        >
          <Ionicons name="bookmark" size={16} color={Colors.primary} />
          <Text style={styles.savedBtnText}>저장된 일정 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareWrap}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.coral}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareBtn}
          >
            <Ionicons name="share-social-outline" size={18} color="#fff" />
            <Text style={styles.shareBtnText}>SNS 공유하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* 수정 요청 모달 */}
    <Modal
      visible={revisionModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setRevisionModalVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => !revising && setRevisionModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <LinearGradient
            colors={Gradients.ai}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Ionicons name="sparkles" size={20} color="#FCD34D" />
            <Text style={styles.modalTitle}>AI에게 수정 요청</Text>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.modalDesc}>
              마음에 안 드는 부분을 구체적으로 알려주세요.{'\n'}AI가 해당 내용을 반영해 일정을 다시 짜드립니다.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={revisionText}
              onChangeText={setRevisionText}
              placeholder={'예: 2일차 저녁을 스시로 바꿔줘\n3일차 오후 활동을 쇼핑으로 변경해줘\n전체적으로 이동 거리를 줄여줘'}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!revising}
            />

            <TouchableOpacity
              onPress={handleRevise}
              disabled={revising || !revisionText.trim()}
              activeOpacity={0.85}
              style={styles.modalSubmitWrap}
            >
              <LinearGradient
                colors={Gradients.ai}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.modalSubmitBtn, (revising || !revisionText.trim()) && { opacity: 0.55 }]}
              >
                {revising ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.modalSubmitText}>AI가 수정 중...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FCD34D" />
                    <Text style={styles.modalSubmitText}>수정 요청하기</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRevisionModalVisible(false)}
              disabled={revising}
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  root: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  header: {
    paddingTop: 52,
    paddingBottom: 32,
    paddingHorizontal: Spacing.screenPad,
    gap: 6,
  },
  backBtn: { marginBottom: 8, alignSelf: 'flex-start' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  headerBadge: { fontSize: 12, fontWeight: '600' as const, color: Colors.coral },
  cacheBadge: {
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cacheBadgeText: { fontSize: 10, color: 'rgba(255,255,255,0.70)' },
  destination: { fontSize: 28, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.5 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaPillText: { fontSize: 12, color: 'rgba(255,255,255,0.90)', fontWeight: '600' as const },

  dayList: { padding: Spacing.screenPad, gap: 14, paddingBottom: 0 },

  dayBlock: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 0,
    marginBottom: 0,
  },
  dayNumText: { fontSize: 20, fontWeight: '900' as const, color: '#fff' },
  dayLabel: { fontSize: 13, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)' },

  activitiesWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    position: 'relative',
    paddingLeft: 24,
    ...Shadow.xs,
  },
  timelineDot: {
    position: 'absolute',
    left: -5,
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  activityCardInner: { gap: 4 },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activityTime: { fontSize: 11, fontWeight: '700' as const },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  restaurantName: { fontSize: 13, fontWeight: '700' as const, color: Colors.green },
  mealCostBadge: { backgroundColor: Colors.greenLight },
  mealCostBadgeText: { color: Colors.green },
  costBadge: {
    backgroundColor: Colors.amberLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  costBadgeText: { fontSize: 11, color: Colors.amber, fontWeight: '600' as const },
  activityTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  activityDesc: { fontSize: 13, color: Colors.textMedium, lineHeight: 19 },

  bottomBtns: {
    margin: Spacing.screenPad,
    marginTop: 20,
    gap: 12,
  },

  // AI 수정 요청 버튼
  reviseWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.primary,
  },
  reviseBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 15,
  },
  reviseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' as const },

  // 수정 모달
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(30,27,75,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 20,
    paddingBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' as const, color: '#fff' },
  modalBody: { padding: Spacing.screenPad, gap: 14 },
  modalDesc: { fontSize: 13, color: Colors.textMedium, lineHeight: 20 },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  modalSubmitWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.primary,
  },
  modalSubmitBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
  },
  modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
  modalCancelBtn: {
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  modalCancelText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' as const },
  savedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    paddingVertical: 13,
    backgroundColor: Colors.primaryLight,
  },
  savedBtnText: { fontSize: 15, fontWeight: '600' as const, color: Colors.primary },
  shareWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.coral,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
});
