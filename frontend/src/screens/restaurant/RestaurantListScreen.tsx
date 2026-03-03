import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getRestaurants, RestaurantSummary } from '../../services/restaurantService';
import { Colors, Gradients, Radius, Shadow } from '../../utils/theme';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: 13, color: i <= rating ? Colors.amber : Colors.border }}>★</Text>
      ))}
      <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function RestaurantCard({ item, index }: { item: RestaurantSummary; index: number }) {
  const navigation = useNavigation<any>();
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, delay: index * 60, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateY: slideY }] }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient colors={Gradients.card} style={styles.card}>
          {item.image_urls.length > 0 ? (
            <Image source={{ uri: item.image_urls[0] }} style={styles.thumbnail} />
          ) : (
            <LinearGradient colors={['#FFF1F2', '#FFE4E6']} style={[styles.thumbnail, styles.thumbnailEmpty]}>
              <Text style={{ fontSize: 30 }}>🍽</Text>
            </LinearGradient>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Text style={{ fontSize: 11 }}>📍</Text>
              <Text style={styles.locationName}>{item.location_name}</Text>
            </View>
            <StarRating rating={item.rating} />
          </View>
          {/* 오른쪽 화살표 */}
          <Text style={styles.cardArrow}>›</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RestaurantListScreen() {
  const navigation = useNavigation<any>();
  const [locationFilter, setLocationFilter] = useState('');
  const [submittedFilter, setSubmittedFilter] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRestaurants = useCallback(async (location: string, cursor?: string) => {
    try {
      const res = await getRestaurants(location || undefined, cursor);
      if (cursor) { setRestaurants(prev => [...prev, ...res.items]); }
      else { setRestaurants(res.items); }
      setNextCursor(res.next_cursor);
    } catch (e) { console.error('맛집 목록 조회 오류:', e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRestaurants(submittedFilter).finally(() => setLoading(false));
  }, [submittedFilter, fetchRestaurants]);

  const handleSearch = () => setSubmittedFilter(locationFilter.trim());

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants(submittedFilter);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchRestaurants(submittedFilter, nextCursor);
    setLoadingMore(false);
  };

  return (
    <View style={styles.root}>
      {/* 그라디언트 헤더 */}
      <LinearGradient
        colors={['#7F1D1D', '#DC2626', '#EF4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>맛집</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('RestaurantCreate')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ 등록</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 검색바 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  지역 검색 (홍대, 도쿄...)"
          placeholderTextColor={Colors.textLight}
          value={locationFilter}
          onChangeText={setLocationFilter}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} activeOpacity={0.85}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchBtn}
          >
            <Text style={styles.searchBtnText}>검색</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.red} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <RestaurantCard item={item} index={index} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.red} />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 46, marginBottom: 14 }}>🍜</Text>
              <Text style={styles.emptyTitle}>등록된 맛집이 없습니다</Text>
              <Text style={styles.emptyHint}>현지 맛집을 첫 번째로 소개해보세요!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.red} /> : null
          }
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },

  searchRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  searchBtn: { borderRadius: Radius.sm, paddingHorizontal: 16, justifyContent: 'center', height: 42 },
  searchBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' as const },

  listContent: { padding: 14, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    ...Shadow.card,
  },
  thumbnail: { width: 84, height: 84, borderRadius: Radius.md, marginRight: 14 },
  thumbnailEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 5 },
  restaurantName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationName: { fontSize: 12, color: Colors.textMedium },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  ratingNum: { fontSize: 12, color: Colors.textMedium, fontWeight: '600' as const, marginLeft: 4 },
  cardArrow: { fontSize: 24, color: Colors.textLight, paddingLeft: 8 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textMedium, marginBottom: 6 },
  emptyHint: { fontSize: 13, color: Colors.textLight },
});
