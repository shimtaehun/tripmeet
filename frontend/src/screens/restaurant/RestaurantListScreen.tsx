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
import { Colors, Radius, Shadow } from '../../utils/theme';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
      ))}
      <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
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
      activeOpacity={0.75}
    >
      {item.image_urls.length > 0 ? (
        <Image source={{ uri: item.image_urls[0] }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailEmpty]}>
          <Text style={styles.thumbnailEmptyIcon}>🍽</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationName}>{item.location_name}</Text>
        </View>
        <StarRating rating={item.rating} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>맛집</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('RestaurantCreate')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ 등록</Text>
        </TouchableOpacity>
      </View>

      {/* 검색바 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="지역 검색 (예: 홍대, 도쿄)"
          placeholderTextColor={Colors.textLight}
          value={locationFilter}
          onChangeText={setLocationFilter}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍜</Text>
              <Text style={styles.emptyText}>등록된 맛집이 없습니다.</Text>
              <Text style={styles.emptyHint}>첫 번째 맛집을 등록해보세요!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={styles.footerLoader} color={Colors.primary} /> : null
          }
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

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addBtn: {
    backgroundColor: Colors.red,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700' as const,
  },

  // 검색
  searchRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700' as const,
  },

  // 리스트
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: { height: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 12,
    ...Shadow.card,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    marginRight: 14,
  },
  thumbnailEmpty: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmptyIcon: { fontSize: 28 },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationIcon: { fontSize: 11 },
  locationName: {
    fontSize: 13,
    color: Colors.textMedium,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  starFilled: {
    fontSize: 14,
    color: Colors.amber,
  },
  starEmpty: {
    fontSize: 14,
    color: Colors.border,
  },
  ratingNum: {
    fontSize: 12,
    color: Colors.textMedium,
    fontWeight: '600' as const,
    marginLeft: 4,
  },

  loader: { marginTop: 60 },
  footerLoader: { paddingVertical: 16 },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textMedium,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
