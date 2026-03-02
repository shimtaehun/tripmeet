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
import { useRoute } from '@react-navigation/native';

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.destination}>{itinerary.destination}</Text>
        <Text style={styles.meta}>
          {itinerary.duration_days}일 / {itinerary.travelers_count}명 / {itinerary.budget_range}
        </Text>
        {itinerary.is_cached && (
          <Text style={styles.cachedBadge}>캐시된 결과</Text>
        )}
      </View>

      {days.map((day) => (
        <View key={day.day} style={styles.dayBlock}>
          <Text style={styles.dayLabel}>{day.date_label}</Text>
          {day.activities.map((activity, idx) => (
            <View key={idx} style={styles.activityItem}>
              <Text style={styles.activityTime}>{activity.time}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                {activity.estimated_cost > 0 && (
                  <Text style={styles.activityCost}>
                    약 {activity.estimated_cost.toLocaleString()}원
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>SNS 공유하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 20,
    backgroundColor: '#EFF6FF',
    marginBottom: 8,
  },
  destination: { fontSize: 24, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 6 },
  meta: { fontSize: 14, color: '#3B82F6' },
  cachedBadge: {
    marginTop: 6,
    fontSize: 11,
    color: '#9CA3AF',
  },
  dayBlock: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dayLabel: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  activityTime: {
    width: 36,
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    paddingTop: 2,
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  activityDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  activityCost: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  shareButton: {
    margin: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
