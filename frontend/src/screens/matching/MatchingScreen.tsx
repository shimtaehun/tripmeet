import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import TravelerListItem from './TravelerListItem';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

interface Traveler {
  user_id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
  similarity_score: number;
}

function PulseRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.7, duration: 1600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.45, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
  );
}

export default function MatchingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDesktop } = useResponsive();
  const locationName: string | undefined = route.params?.locationName;

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationName) { fetchTravelers(locationName); }
    else { setLoading(false); }
  }, [locationName]);

  const fetchTravelers = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/matching/similar?location_name=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const data = await res.json();
      setTravelers(data);
    } catch (e) {
      console.error('여행자 조회 오류:', e);
      Alert.alert('오류', '여행자 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (userId: string, nickname: string) => {
    navigation.navigate('Chat', { targetUserId: userId, targetNickname: nickname });
  };

  if (!locationName) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={Gradients.matching}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, isDesktop && { paddingTop: TOP_NAV_H + 20 }]}
        >
          <View style={isDesktop ? { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' } : undefined}>
            <Text style={[styles.headerTitle, isDesktop && { fontSize: 28 }]}>매칭</Text>
          </View>
        </LinearGradient>

        <View style={styles.emptyRoot}>
          <View style={styles.radarWrap}>
            <PulseRing />
            <View style={styles.radarDot}>
              <Ionicons name="location" size={30} color={Colors.green} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>여행 중인 곳을 알려주세요</Text>
          <Text style={styles.emptyDesc}>
            주변 여행자를 발견하려면 위치를 등록해주세요{'\n'}같은 지역 여행자와 실시간으로 연결됩니다
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('LocationSelect')}
            activeOpacity={0.85}
            style={styles.registerBtnWrap}
          >
            <LinearGradient
              colors={Gradients.coral}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerBtn}
            >
              <Ionicons name="location-outline" size={17} color="#fff" />
              <Text style={styles.registerBtnText}>위치 등록하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.matching}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isDesktop && { paddingTop: TOP_NAV_H + 20 }]}
      >
        <View style={[styles.headerInner, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
          <View>
            <Text style={[styles.headerTitle, isDesktop && { fontSize: 28 }]}>매칭</Text>
            <Text style={styles.headerSub}>
              <Text style={styles.headerLocation}>{locationName}</Text> 여행자
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => navigation.navigate('LocationSelect')}
            activeOpacity={0.8}
          >
            <Text style={styles.changeBtnText}>위치 변경</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : travelers.length === 0 ? (
        <View style={styles.emptyRoot}>
          <Ionicons name="search-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitleLg}>이 지역에 여행자가 없습니다</Text>
          <Text style={styles.emptyDesc}>조금 더 기다리거나 다른 지역을 검색해보세요</Text>
          <TouchableOpacity
            onPress={() => fetchTravelers(locationName!)}
            activeOpacity={0.85}
            style={styles.refreshBtnWrap}
          >
            <LinearGradient
              colors={Gradients.coral}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.refreshBtn}
            >
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <Text style={styles.refreshBtnText}>새로고침</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={travelers}
          keyExtractor={item => item.user_id}
          renderItem={({ item, index }) => (
            <TravelerListItem
              userId={item.user_id}
              nickname={item.nickname}
              profileImageUrl={item.profile_image_url}
              bio={item.bio}
              similarityScore={item.similarity_score}
              onChatPress={handleChatPress}
              index={index}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' },
          ]}
          // 카드 간격 12px — 공간감 확보
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 18,
  },
  // 헤더 내부 row — max-width 중앙 정렬에 사용
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  headerLocation: { fontWeight: '700' as const, color: '#fff' },
  changeBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  changeBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' as const },

  // 상하 패딩 확보 — 카드 그림자가 잘리지 않도록 상단 여백 추가
  listContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },

  radarWrap: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  radarDot: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.greenLight,
    borderWidth: 2,
    borderColor: Colors.greenBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.green,
  },

  emptyRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 19, fontWeight: '700' as const, color: Colors.text,
    textAlign: 'center', marginTop: 8,
  },
  emptyTitleLg: {
    fontSize: 18, fontWeight: '700' as const, color: Colors.text,
    textAlign: 'center', marginTop: 12,
  },
  emptyDesc: {
    fontSize: 14, color: Colors.textMedium, textAlign: 'center',
    lineHeight: 22, marginBottom: 16,
  },
  registerBtnWrap: { borderRadius: Radius.full, overflow: 'hidden', ...Shadow.blue },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  registerBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#fff' },
  refreshBtnWrap: { borderRadius: Radius.full, overflow: 'hidden', ...Shadow.blue },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  refreshBtnText: { fontSize: 14, fontWeight: '700' as const, color: '#fff' },

  loader: { marginTop: 60 },
});
