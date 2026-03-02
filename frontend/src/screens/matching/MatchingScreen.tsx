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
      <View style={styles.empty}>
        <Text style={styles.emptyText}>현재 여행 중인 곳을 등록해주세요.</Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('LocationSelect')}
        >
          <Text style={styles.registerButtonText}>위치 등록하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.locationText}>{locationName} 여행자</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LocationSelect')}>
          <Text style={styles.changeText}>위치 변경</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      ) : travelers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>이 지역에 다른 여행자가 없습니다.</Text>
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
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  changeText: { fontSize: 13, color: '#3B82F6' },
  list: { padding: 16 },
  loader: { marginTop: 60 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  registerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  registerButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
