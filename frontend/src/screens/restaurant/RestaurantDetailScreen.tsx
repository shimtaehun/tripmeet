import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { getRestaurant, deleteRestaurant, Restaurant } from '../../services/restaurantService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
      ))}
    </View>
  );
}

export default function RestaurantDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const restaurantId: string = route.params?.restaurantId;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id ?? null);

      try {
        const data = await getRestaurant(restaurantId);
        setRestaurant(data);
      } catch (e) {
        console.error('맛집 조회 오류:', e);
        Alert.alert('오류', '맛집 정보를 불러올 수 없습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  const handleDelete = () => {
    Alert.alert('삭제', '맛집을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRestaurant(restaurantId);
            navigation.goBack();
          } catch (e) {
            console.error('맛집 삭제 오류:', e);
            Alert.alert('오류', '맛집 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!restaurant) return null;

  const isAuthor = currentUserId === restaurant.user_id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
        {isAuthor && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {restaurant.image_urls.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {restaurant.image_urls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.locationName}>{restaurant.location_name}</Text>
        <StarRating rating={restaurant.rating} />

        {restaurant.description ? (
          <Text style={styles.description}>{restaurant.description}</Text>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{restaurant.author?.nickname ?? '알 수 없음'}</Text>
          <Text style={styles.date}>{new Date(restaurant.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: { fontSize: 15, color: '#3B82F6' },
  deleteText: { fontSize: 15, color: '#EF4444' },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.65,
  },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  locationName: { fontSize: 14, color: '#6B7280', marginBottom: 10 },
  starRow: { flexDirection: 'row', marginBottom: 14 },
  starFilled: { fontSize: 20, color: '#FBBF24' },
  starEmpty: { fontSize: 20, color: '#E5E7EB' },
  description: { fontSize: 15, color: '#374151', lineHeight: 24, marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  authorName: { fontSize: 14, color: '#374151' },
  date: { fontSize: 13, color: '#9CA3AF' },
});
