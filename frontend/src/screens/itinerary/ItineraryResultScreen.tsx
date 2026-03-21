import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

interface Activity {
  time: string;
  title: string;
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

export default function ItineraryResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const itinerary: Itinerary = route.params.itinerary;
  const days: Day[] = itinerary.content?.days ?? [];

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
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
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
                const timeColor = getTimeColor(activity.time);
                const dotColor  = getTimeDotColor(activity.time);
                return (
                  <View key={idx} style={[styles.activityCard, { borderLeftColor: timeColor }]}>
                    {/* 타임라인 dot */}
                    <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                    <View style={styles.activityCardInner}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                        {activity.estimated_cost > 0 && (
                          <View style={styles.costBadge}>
                            <Text style={styles.costBadgeText}>
                              {activity.estimated_cost.toLocaleString()}원
                            </Text>
                          </View>
                        )}
                      </View>
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
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
  activityTime: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const },
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
