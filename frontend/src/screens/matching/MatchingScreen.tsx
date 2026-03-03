import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import TravelerListItem from './TravelerListItem';
import { Colors, Gradients, Radius, Shadow } from '../../utils/theme';

interface Traveler {
  user_id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
}

function PulseRing() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 1400, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0,  useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

export default function MatchingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const locationName: string | undefined = route.params?.locationName;

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationName) { fetchTravelers(locationName); }
    else { setLoading(false); }
  }, [locationName]);

  const fetchTravelers = async (name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/locations/?location_name=${encodeURIComponent(name)}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    const data = await res.json();
    setTravelers(data);
    setLoading(false);
  };

  const handleChatPress = (userId: string, nickname: string) => {
    navigation.navigate('Chat', { targetUserId: userId, targetNickname: nickname });
  };

  if (!locationName) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#1E3A8A', '#2563EB', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>매칭</Text>
        </LinearGradient>

        <View style={styles.emptyRoot}>
          {/* 펄스 레이더 효과 */}
          <View style={styles.radarWrap}>
            <PulseRing />
            <View style={styles.radarDot}>
              <Text style={styles.radarEmoji}>📍</Text>
            </View>
          </View>

          <Text style={styles.emptyTitle}>여행 중인 곳을 알려주세요</Text>
          <Text style={styles.emptyDesc}>
            위치를 등록하면{'\n'}같은 지역 여행자와 실시간으로 연결됩니다
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('LocationSelect')}
            activeOpacity={0.85}
            style={styles.registerBtnWrap}
          >
            <LinearGradient
              colors={Gradients.sunset}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerBtn}
            >
              <Text style={styles.registerBtnText}>📍 위치 등록하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#1E3A8A', '#2563EB', '#0EA5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>매칭</Text>
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
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : travelers.length === 0 ? (
        <View style={styles.emptyRoot}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>이 지역에 여행자가 없습니다</Text>
          <Text style={styles.emptyDesc}>조금 더 기다려보세요!</Text>
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
              onChatPress={handleChatPress}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 18,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.78)' },
  headerLocation: { fontWeight: '700' as const, color: '#fff' },
  changeBtn: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  changeBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' as const },

  listContent: { padding: 14, paddingBottom: 32 },

  // 레이더 펄스
  radarWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  radarDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow,
  },
  radarEmoji: { fontSize: 28 },

  emptyRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 50, marginBottom: 16 },
  emptyTitle: {
    fontSize: 19, fontWeight: '700' as const, color: Colors.text,
    marginBottom: 8, textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14, color: Colors.textMedium, textAlign: 'center',
    lineHeight: 22, marginBottom: 30,
  },
  registerBtnWrap: { borderRadius: Radius.md, overflow: 'hidden', ...Shadow.glowAccent },
  registerBtn: { paddingHorizontal: 32, paddingVertical: 15 },
  registerBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#fff' },

  loader: { marginTop: 60 },
});
