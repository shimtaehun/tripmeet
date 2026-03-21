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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { getRestaurant, deleteRestaurant, Restaurant } from '../../services/restaurantService';
import { Colors, Radius, Shadow, Spacing } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={18} color={i <= rating ? Colors.amber : Colors.border} />
      ))}
      <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
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
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

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
            navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Restaurant' } }] });
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!restaurant) return null;

  const isAuthor = currentUserId === restaurant.user_id;

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        {isAuthor && (
          <View style={styles.authorActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('RestaurantEdit', { restaurantId: restaurant.id })}
              style={styles.actionBtn}
            >
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
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
        <View style={styles.nameRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMedium} />
          <Text style={styles.locationName}>{restaurant.location_name}</Text>
        </View>

        <StarRating rating={restaurant.rating} />

        {restaurant.description ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.description}>{restaurant.description}</Text>
          </>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.authorRow}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle-outline" size={15} color={Colors.textMedium} />
            <Text style={styles.authorName}>{restaurant.author?.nickname ?? '알 수 없음'}</Text>
          </View>
          <Text style={styles.date}>{new Date(restaurant.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  authorActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  editText: { fontSize: 14, color: Colors.textMedium, fontWeight: '600' as const },
  deleteText: { fontSize: 14, color: Colors.red, fontWeight: '600' as const },

  image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.65 },

  content: {
    backgroundColor: Colors.card,
    margin: Spacing.screenPad,
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadow.card,
  },
  nameRow: { marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  locationName: { fontSize: 13, color: Colors.textMedium },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 14 },
  ratingNum: { fontSize: 13, color: Colors.textMedium, fontWeight: '600' as const, marginLeft: 6 },
  description: { fontSize: 15, color: Colors.text, lineHeight: 26 },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 16 },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' as const },
  date: { fontSize: 12, color: Colors.textLight },
});
