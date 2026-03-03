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
import { useRoute } from '@react-navigation/native';
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

export default function ItineraryResultScreen() {
  const route = useRoute<any>();
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
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.primaryDeep, Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
        <Text style={styles.meta}>
          {itinerary.duration_days}일 · {itinerary.travelers_count}명 · {itinerary.budget_range}
        </Text>
      </LinearGradient>

      <View style={styles.dayList}>
        {days.map((day) => (
          <View key={day.day} style={styles.dayBlock}>
            <View style={styles.dayLabelRow}>
              <View style={styles.dayNumBadge}>
                <Text style={styles.dayNumText}>Day {day.day}</Text>
              </View>
              <Text style={styles.dayLabel}>{day.date_label}</Text>
            </View>

            {day.activities.map((activity, idx) => (
              <View key={idx} style={styles.activityItem}>
                <View style={styles.timelineCol}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  {idx < day.activities.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDesc}>{activity.description}</Text>
                  {activity.estimated_cost > 0 && (
                    <View style={styles.costRow}>
                      <Ionicons name="wallet-outline" size={11} color={Colors.textLight} />
                      <Text style={styles.activityCost}>약 {activity.estimated_cost.toLocaleString()}원</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: 52,
    paddingBottom: 32,
    paddingHorizontal: Spacing.screenPad,
    gap: 6,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  headerBadge: { fontSize: 12, fontWeight: '600' as const, color: Colors.coral },
  cacheBadge: {
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cacheBadgeText: { fontSize: 10, color: 'rgba(255,255,255,0.70)' },
  destination: { fontSize: 28, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.5 },
  meta: { fontSize: 14, color: 'rgba(255,255,255,0.70)' },

  dayList: { padding: Spacing.screenPad, gap: 14, paddingBottom: 0 },

  dayBlock: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayNumBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dayNumText: { fontSize: 11, fontWeight: '700' as const, color: '#fff' },
  dayLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },

  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 14,
  },
  timelineCol: { width: 38, alignItems: 'center', paddingTop: 2 },
  activityTime: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const, textAlign: 'center' },
  timelineLine: { width: 1, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 3 },
  activityDesc: { fontSize: 13, color: Colors.textMedium, lineHeight: 19, marginBottom: 4 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  activityCost: { fontSize: 12, color: Colors.textLight },

  shareWrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    margin: Spacing.screenPad,
    marginTop: 20,
    marginBottom: 40,
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
