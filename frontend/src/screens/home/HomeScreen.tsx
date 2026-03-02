import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

const FEATURES = [
  {
    icon: '✈',
    title: 'AI 여행 일정',
    desc: '목적지·기간·예산으로\n맞춤 일정 자동 완성',
    screen: 'ItineraryForm',
    tab: null,
    accent: Colors.primary,
    bg: Colors.primaryLight,
  },
  {
    icon: '📍',
    title: '지역 매칭',
    desc: '같은 도시의\n여행자와 실시간 연결',
    screen: null,
    tab: 'Matching',
    accent: Colors.green,
    bg: Colors.greenLight,
  },
  {
    icon: '💬',
    title: '커뮤니티',
    desc: '여행 질문·후기·\n정보를 함께 공유',
    screen: null,
    tab: 'Community',
    accent: Colors.accent,
    bg: Colors.accentLight,
  },
  {
    icon: '🍜',
    title: '맛집 리뷰',
    desc: '현지 맛집 사진과\n별점 리뷰 공유',
    screen: null,
    tab: 'Restaurant',
    accent: Colors.red,
    bg: Colors.redLight,
  },
  {
    icon: '🤝',
    title: '동행 구인',
    desc: '함께 여행할\n동반자를 미리 모집',
    screen: null,
    tab: 'Companion',
    accent: Colors.amber,
    bg: Colors.amberLight,
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
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 배너 */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>TripMeet</Text>
          <Text style={styles.bannerTagline}>혼자 떠나도 함께하는 여행</Text>
        </View>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>✈ 여행중</Text>
        </View>
      </View>

      {/* 빠른 시작 힌트 */}
      <View style={styles.hint}>
        <Text style={styles.hintIcon}>💡</Text>
        <Text style={styles.hintText}>
          먼저 <Text style={styles.hintBold}>AI 여행 일정</Text>으로 계획을 세워보세요!
        </Text>
      </View>

      {/* 기능 타일 그리드 */}
      <Text style={styles.sectionTitle}>무엇을 도와드릴까요?</Text>

      <View style={styles.grid}>
        {FEATURES.map((f, i) => {
          // 마지막 항목이 홀수 번째면 전체 너비
          const isLast = i === FEATURES.length - 1;
          const isOdd = FEATURES.length % 2 !== 0;
          const fullWidth = isLast && isOdd;

          return (
            <TouchableOpacity
              key={f.title}
              style={[
                styles.tile,
                { backgroundColor: f.bg, width: fullWidth ? '100%' : CARD_WIDTH },
              ]}
              onPress={() => handlePress(f)}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIconWrap, { backgroundColor: f.accent + '22' }]}>
                <Text style={styles.tileIcon}>{f.icon}</Text>
              </View>
              <Text style={[styles.tileTitle, { color: f.accent }]}>{f.title}</Text>
              <Text style={styles.tileDesc}>{f.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 하단 안내 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>GPS를 사용하지 않습니다. 위치는 직접 입력합니다.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },

  // 배너
  banner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500' as const,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },

  // 힌트
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  hintText: {
    fontSize: 13,
    color: Colors.textMedium,
    flex: 1,
    lineHeight: 18,
  },
  hintBold: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },

  // 그리드
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  tile: {
    borderRadius: Radius.lg,
    padding: 18,
    ...Shadow.card,
  },
  tileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileIcon: {
    fontSize: 22,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  tileDesc: {
    fontSize: 12,
    color: Colors.textMedium,
    lineHeight: 18,
  },

  // 하단
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
