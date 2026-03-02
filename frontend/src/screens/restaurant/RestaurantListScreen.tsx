import React, { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRestaurants, RestaurantSummary } from '../../services/restaurantService';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
      ))}
    </View>
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
      if (cursor) {
        setRestaurants(prev => [...prev, ...res.items]);
      } else {
        setRestaurants(res.items);
      }
      setNextCursor(res.next_cursor);
    } catch (e) {
      console.error('맛집 목록 조회 오류:', e);
    }
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

  const renderItem = ({ item }: { item: RestaurantSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      {item.image_urls.length > 0 ? (
        <Image source={{ uri: item.image_urls[0] }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailPlaceholderText}>사진 없음</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.locationName}>{item.location_name}</Text>
        <StarRating rating={item.rating} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>맛집</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RestaurantCreate')}
        >
          <Text style={styles.addButtonText}>등록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="지역 검색 (예: 홍대, 도쿄)"
          placeholderTextColor="#9CA3AF"
          value={locationFilter}
          onChangeText={setLocationFilter}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>등록된 맛집이 없습니다.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={styles.footer} color="#3B82F6" /> : null
          }
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchButtonText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: { fontSize: 11, color: '#9CA3AF' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  restaurantName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  locationName: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  starRow: { flexDirection: 'row' },
  starFilled: { fontSize: 14, color: '#FBBF24' },
  starEmpty: { fontSize: 14, color: '#E5E7EB' },
  loader: { marginTop: 60 },
  footer: { paddingVertical: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
