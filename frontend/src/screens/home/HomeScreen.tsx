import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FEATURES = [
  {
    title: 'AI 여행 일정',
    description: '여행지·일수·예산 입력으로\n맞춤 일정을 자동 생성',
    screen: 'ItineraryForm',
    tab: null,
    color: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    title: '지역 매칭',
    description: '현재 여행지에서\n같은 지역 여행자와 연결',
    screen: null,
    tab: 'Matching',
    color: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  {
    title: '커뮤니티',
    description: '질문·후기·정보를\n여행자들과 공유',
    screen: null,
    tab: 'Community',
    color: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  {
    title: '맛집 리뷰',
    description: '현지 맛집 사진과\n별점 리뷰 공유',
    screen: null,
    tab: 'Restaurant',
    color: '#FEF2F2',
    borderColor: '#FECACA',
  },
  {
    title: '동행 구인',
    description: '함께 여행할 동반자를\n미리 모집',
    screen: null,
    tab: 'Companion',
    color: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const handlePress = (feature: typeof FEATURES[0]) => {
    if (feature.screen) {
      navigation.navigate(feature.screen);
    } else if (feature.tab) {
      navigation.navigate('Main', { screen: feature.tab });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TripMeet</Text>
        <Text style={styles.headerSubtitle}>여행자를 위한 커뮤니티</Text>
      </View>

      <Text style={styles.sectionTitle}>무엇을 도와드릴까요?</Text>

      {FEATURES.map(feature => (
        <TouchableOpacity
          key={feature.title}
          style={[styles.card, { backgroundColor: feature.color, borderColor: feature.borderColor }]}
          onPress={() => handlePress(feature)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>{feature.title}</Text>
          <Text style={styles.cardDesc}>{feature.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    paddingVertical: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});
