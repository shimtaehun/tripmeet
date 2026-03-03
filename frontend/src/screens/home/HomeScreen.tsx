import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Radius, Shadow, Animation, Spacing } from '../../utils/theme';

const { width: W } = Dimensions.get('window');
const TILE_WIDTH = (W - Spacing.screenPad * 2 - 12) / 2;

const FEATURES = [
  {
    icon: 'location' as const,
    title: '지역 매칭',
    desc: '같은 도시 여행자와\n실시간 연결',
    screen: null,
    tab: 'Matching',
    iconBg: Colors.greenLight,
    iconColor: Colors.green,
  },
  {
    icon: 'chatbubbles' as const,
    title: '커뮤니티',
    desc: '여행 정보·질문·후기\n함께 공유',
    screen: null,
    tab: 'Community',
    iconBg: Colors.primaryLight,
    iconColor: Colors.primary,
  },
  {
    icon: 'restaurant' as const,
    title: '맛집 리뷰',
    desc: '현지 맛집 사진과\n별점 리뷰 공유',
    screen: null,
    tab: 'Restaurant',
    iconBg: Colors.redLight,
    iconColor: Colors.red,
  },
  {
    icon: 'people' as const,
    title: '동행 구인',
    desc: '함께 여행할 동반자를\n미리 모집',
    screen: null,
    tab: 'Companion',
    iconBg: Colors.amberLight,
    iconColor: Colors.amber,
  },
] as const;

function FeatureTile({
  feature,
  index,
  onPress,
}: {
  feature: typeof FEATURES[number];
  index: number;
  onPress: () => void;
}) {
  const scale      = useRef(new Animated.Value(1)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: Animation.entrance,
        delay: 80 + index * 60, useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, delay: 80 + index * 60,
        tension: 70, friction: 9, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn  = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();

  return (
    <Animated.View
      style={[
        { width: TILE_WIDTH },
        { opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityLabel={feature.title}
      >
        <View style={styles.tile}>
          <View style={[styles.tileIconWrap, { backgroundColor: feature.iconBg }]}>
            <Ionicons name={feature.icon} size={22} color={feature.iconColor} />
          </View>
          <Text style={styles.tileTitle}>{feature.title}</Text>
          <Text style={styles.tileDesc}>{feature.desc}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const bannerScale   = useRef(new Animated.Value(0.97)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bannerScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(bannerOpacity, { toValue: 1, duration: Animation.entrance, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = (feature: typeof FEATURES[number]) => {
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
      {/* 히어로 배너 */}
      <Animated.View style={{ opacity: bannerOpacity, transform: [{ scale: bannerScale }] }}>
        <LinearGradient
          colors={Gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerGlow} />
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Ionicons name="globe-outline" size={12} color="rgba(255,255,255,0.90)" />
              <Text style={styles.bannerBadgeText}>여행자 커뮤니티</Text>
            </View>
            <Text style={styles.bannerTitle}>TripMeet</Text>
            <View style={styles.accentLine} />
            <Text style={styles.bannerSub}>혼자 떠나도 함께하는 여행</Text>
          </View>
          <View style={styles.bannerWave} />
        </LinearGradient>
      </Animated.View>

      {/* AI 일정 빠른 시작 */}
      <TouchableOpacity
        style={styles.quickCard}
        onPress={() => navigation.navigate('ItineraryForm')}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={Gradients.coral}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.quickGradient}
        >
          <View style={styles.quickLeft}>
            <Text style={styles.quickOverline}>AI 추천</Text>
            <Text style={styles.quickTitle}>일정을 자동으로 만들어드려요</Text>
            <Text style={styles.quickDesc}>목적지와 기간만 알려주세요</Text>
          </View>
          <View style={styles.quickIconWrap}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 기능 그리드 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>무엇을 도와드릴까요?</Text>
      </View>

      <View style={styles.grid}>
        {FEATURES.map((f, i) => (
          <FeatureTile
            key={f.title}
            feature={f}
            index={i}
            onPress={() => handlePress(f)}
          />
        ))}
      </View>

      {/* 하단 안내 */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.footerText}>
            GPS를 사용하지 않습니다. 위치는 직접 선택합니다.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  banner: {
    paddingTop: 56,
    paddingBottom: 38,
    paddingHorizontal: Spacing.screenPad,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59,130,246,0.22)',
    top: -40,
    right: -20,
  },
  bannerContent: { zIndex: 1 },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.92)',
  },
  bannerTitle: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  accentLine: {
    width: 36,
    height: 2,
    backgroundColor: Colors.coral,
    borderRadius: 1,
    marginBottom: 10,
  },
  bannerSub: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.72)',
  },
  bannerWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  quickCard: {
    marginHorizontal: Spacing.screenPad,
    marginBottom: 4,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.coral,
  },
  quickGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  quickLeft: { flex: 1 },
  quickOverline: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.70)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 3,
  },
  quickDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 26,
    paddingBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPad,
    gap: 12,
  },

  tile: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  tileIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 5,
  },
  tileDesc: {
    fontSize: 12,
    color: Colors.textMedium,
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 24,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  footerText: {
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500' as const,
  },
});
