import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import TravelerListItem from './TravelerListItem';
import { Colors, Radius, Shadow } from '../../utils/theme';

interface Traveler {
  user_id: string;
  nickname: string;
  profile_image_url: string | null;
  bio: string | null;
}

export default function MatchingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const locationName: string | undefined = route.params?.locationName;

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationName) {
      fetchTravelers(locationName);
    } else {
      setLoading(false);
    }
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
      <View style={styles.emptyRoot}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>매칭</Text>
        </View>

        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>여행 중인 곳을 알려주세요</Text>
          <Text style={styles.emptyDesc}>
            현재 위치를 등록하면{'\n'}같은 지역 여행자와 연결됩니다
          </Text>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('LocationSelect')}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>위치 등록하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
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
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : travelers.length === 0 ? (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>이 지역에 여행자가 없습니다</Text>
          <Text style={styles.emptyDesc}>조금 더 기다려보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={travelers}
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <TravelerListItem
              userId={item.user_id}
              nickname={item.nickname}
              profileImageUrl={item.profile_image_url}
              bio={item.bio}
              onChatPress={handleChatPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMedium,
  },
  headerLocation: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  changeBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
  },

  // 리스트
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: { height: 10 },

  // 빈 상태
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...Shadow.card,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },

  loader: { marginTop: 60 },
});
