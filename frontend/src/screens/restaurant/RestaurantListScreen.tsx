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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getRestaurants, RestaurantSummary } from '../../services/restaurantService';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={13} color={i <= rating ? Colors.pink : Colors.border} />
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
  const [imageError, setImageError] = useState(false);

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
        <View style={styles.card}>
          <View style={styles.pinkAccentBar} />
          {item.image_urls.length > 0 && !imageError ? (
            <Image
              source={{ uri: item.image_urls[0] }}
              style={styles.thumbnail}
              onError={() => setImageError(true)}
              accessibilityLabel={`${item.name} 대표 사진`}
            />
          ) : (
            <LinearGradient
              colors={Gradients.food as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.thumbnail, styles.thumbnailEmpty]}
            >
              <Ionicons name="restaurant" size={28} color="#fff" />
            </LinearGradient>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMedium} />
              <Text style={styles.locationName}>{item.location_name}</Text>
            </View>
            <StarRating rating={item.rating} />
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.border} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RestaurantListScreen() {
  const navigation = useNavigation<any>();
  const { isDesktop } = useResponsive();
  const numCols = isDesktop ? 2 : 1;
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

  useFocusEffect(useCallback(() => {
    fetchRestaurants(submittedFilter);
  }, [submittedFilter, fetchRestaurants]));

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
        colors={Gradients.food as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isDesktop && { paddingTop: TOP_NAV_H + 20 }]}
      >
        <View style={[styles.headerInner, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
          <Text style={[styles.headerTitle, isDesktop && { fontSize: 28 }]}>맛집</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('RestaurantCreate')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.addBtnText}>등록</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 검색 영역 */}
      <View style={[styles.searchRow, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="지역 검색 (홍대, 도쿄...)"
          placeholderTextColor={Colors.textLight}
          value={locationFilter}
          onChangeText={setLocationFilter}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} activeOpacity={0.85}>
          <LinearGradient
            colors={Gradients.coral as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchBtn}
          >
            <Ionicons name="search" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          key={numCols}
          data={restaurants}
          keyExtractor={item => item.id}
          numColumns={numCols}
          columnWrapperStyle={numCols > 1 ? styles.columnWrapper : undefined}
          renderItem={({ item, index }) => (
            <View style={numCols > 1 ? styles.gridItem : undefined}>
              <RestaurantCard item={item} index={index} />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={[
            styles.listContent,
            isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={numCols === 1 ? () => <View style={{ height: 10 }} /> : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>등록된 맛집이 없습니다</Text>
              <Text style={styles.emptyHint}>현지 맛집을 첫 번째로 소개해보세요!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.primary} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // container는 JSX에서 root로 참조됨
  root:          { flex: 1, backgroundColor: Colors.background },
  container:     { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },

  header:      { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.screenPad },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: Colors.textOnDark, marginBottom: 4 },
  headerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  searchWrap: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    gap: 8,
    height: 40,
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
  searchBtn: { borderRadius: Radius.sm, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', height: 42 },

  listContent:   { padding: 14, paddingBottom: 48 },
  columnWrapper: { gap: 10, marginBottom: 10 },
  gridItem:      { flex: 1 },

  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.screenPad,
    borderRadius: Radius.card,
    marginBottom: 12,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pinkAccentBar: { height: 3, width: '100%' as any, backgroundColor: Colors.pink },
  cardImage: {
    width: '100%' as any,
    height: 160,
    backgroundColor: Colors.surface,
  },
  noImagePlaceholder: {
    width: '100%' as any,
    height: 100,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail:      { width: 90, height: 90, borderRadius: Radius.md, marginRight: 14 },
  thumbnailEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardBody:   { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardInfo:       { flex: 1, gap: 5 },
  nameWrap:       { flex: 1, marginRight: 8 },
  restaurantName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  starRow:        { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingNum:      { fontSize: 12, color: Colors.textMedium, marginLeft: 4, fontWeight: '600' as const },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 12, color: Colors.textMedium },
  locationName: { fontSize: 12, color: Colors.textMedium },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.pinkLight,
  },
  tagText: { fontSize: 11, color: Colors.pink, fontWeight: '600' as const },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty:      { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textMedium, marginBottom: 6 },
  emptyHint:  { fontSize: 13, color: Colors.textLight },
  emptyWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText:  { fontSize: 14, color: Colors.textMedium, marginTop: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.pink,
  },
});
