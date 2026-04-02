import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getCompanions, CompanionSummary } from '../../services/companionService';
import { Colors, Gradients, Radius, Shadow, Spacing, Typography } from '../../utils/theme';
import { useResponsive, MAX_WIDTH, TOP_NAV_H } from '../../utils/responsive';

type StatusFilter = 'all' | 'open' | 'closed';

function CompanionCard({ item, index }: { item: CompanionSummary; index: number }) {
  const navigation = useNavigation<any>();
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, delay: index * 55, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start();

  const isOpen = item.status === 'open';
  const createdDate = new Date(item.created_at).toLocaleDateString('ko-KR');

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateY: slideY }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.accentBar, { backgroundColor: isOpen ? Colors.green : Colors.red }]} />
        <View style={styles.cardInner}>
          <View style={styles.cardTop}>
            <View style={styles.destinationRow}>
              <Ionicons name="airplane" size={13} color={Colors.amber} />
              <Text style={styles.destination}>{item.destination}</Text>
            </View>
            <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
              <Text style={[styles.statusBadgeText, isOpen ? styles.badgeOpenText : styles.badgeClosedText]}>
                {isOpen ? '모집중' : '마감'}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textLight} />
            <Text style={styles.dateRange}>{item.travel_start_date} ~ {item.travel_end_date}</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardBottom}>
            <Ionicons name="people-outline" size={12} color={Colors.textLight} />
            <Text style={styles.participants}>최대 {item.max_participants}명</Text>
            <View style={styles.dot} />
            <Text style={styles.createdAt}>{createdDate}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={15} color={Colors.border} style={styles.chevron} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: '전체',  value: 'all'    },
  { label: '모집중', value: 'open'   },
  { label: '마감',  value: 'closed' },
];

export default function CompanionScreen() {
  const navigation = useNavigation<any>();
  const { isDesktop } = useResponsive();
  const numCols = isDesktop ? 2 : 1;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [companions, setCompanions] = useState<CompanionSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCompanions = useCallback(async (filter: StatusFilter, cursor?: string) => {
    try {
      const statusParam = filter === 'all' ? undefined : filter;
      const res = await getCompanions(statusParam, cursor);
      if (cursor) {
        setCompanions(prev => [...prev, ...res.items]);
      } else {
        setCompanions(res.items);
      }
      setNextCursor(res.next_cursor);
    } catch (e) {
      console.error('동행 구인 목록 조회 오류:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCompanions(statusFilter).finally(() => setLoading(false));
    }, [statusFilter, fetchCompanions])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompanions(statusFilter);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchCompanions(statusFilter, nextCursor);
    setLoadingMore(false);
  };

  return (
    <View style={styles.root}>
      {/* 그라디언트 헤더 */}
      <LinearGradient
        colors={Gradients.companion as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isDesktop && { paddingTop: TOP_NAV_H + 20 }]}
      >
        <View style={[styles.headerInner, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
          <Text style={[styles.headerTitle, isDesktop && { fontSize: 28 }]}>동행 구인</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CompanionCreate')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.addBtnText}>등록</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 상태 필터 탭 */}
      <View style={[styles.tabBarWrap, isDesktop && styles.tabBarWrapDesktop]}>
        <View style={[styles.tabBar, isDesktop && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={styles.tab}
                onPress={() => setStatusFilter(tab.value)}
                activeOpacity={0.7}
              >
                {active ? (
                  <LinearGradient
                    colors={Gradients.companion as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGradient}
                  >
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          key={numCols}
          data={companions}
          keyExtractor={item => item.id}
          numColumns={numCols}
          columnWrapperStyle={numCols > 1 ? styles.columnWrapper : undefined}
          renderItem={({ item, index }) => (
            <View style={numCols > 1 ? styles.gridItem : undefined}>
              <CompanionCard item={item} index={index} />
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
          ItemSeparatorComponent={numCols === 1 ? () => <View style={styles.separator} /> : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>등록된 동행 구인이 없습니다.</Text>
              <Text style={styles.emptyHint}>함께 여행할 동반자를 모집해보세요!</Text>
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
  container:     { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },

  header:      { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.screenPad },
  headerTitle: { ...Typography.display, color: Colors.textOnDark, marginBottom: 4 },
  headerSub:   { ...Typography.body, color: 'rgba(255,255,255,0.65)' },
  newBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
  },
  newBtnText: { fontSize: 13, fontWeight: '600' as const, color: '#fff' },

  filterWrap: { paddingHorizontal: Spacing.screenPad, paddingVertical: Spacing.md },
  filterRow:  { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.amber,
    backgroundColor: Colors.amberLight,
  },
  filterText:       { fontSize: 13, fontWeight: '500' as const, color: Colors.textMedium },
  filterTextActive: { fontWeight: '700' as const, color: Colors.amber },

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
  accentBar: { height: 3, width: '100%' as any },
  cardInner: { padding: 16 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  destinationRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  destination:     { ...Typography.h3 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeOpen:           { backgroundColor: Colors.greenLight },
  badgeClosed:         { backgroundColor: Colors.redLight },
  statusBadgeText:     { fontSize: 11, fontWeight: '700' as const },
  badgeOpenText:       { color: Colors.green },
  badgeClosedText:     { color: Colors.red },
  period:              { ...Typography.caption, marginBottom: 6 },
  desc:                { ...Typography.bodyMd, lineHeight: 20, marginBottom: 12 },
  cardFooter:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author:              { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: { ...Typography.caption, color: Colors.textMedium, fontWeight: '600' as const },
  date:       { ...Typography.caption },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { ...Typography.body, marginTop: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },

  root:         { flex: 1, backgroundColor: Colors.background },
  dateRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dateRange:    { ...Typography.caption, color: Colors.textMedium },
  description:  { ...Typography.bodyMd, lineHeight: 20, marginBottom: 12 },
  cardBottom:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  participants: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:          { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  createdAt:    { ...Typography.caption },
  chevron:      { marginLeft: 4 },
  loader:       { marginVertical: 24 },
  listContent:  { paddingBottom: 32 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyTitle:   { ...Typography.h4, marginBottom: 8, textAlign: 'center' as const },
  emptyHint:    { ...Typography.bodyMd, textAlign: 'center' as const },
  tabBarWrap:        { paddingHorizontal: Spacing.screenPad, paddingBottom: Spacing.md },
  tabBarWrapDesktop: { paddingHorizontal: Spacing.screenPad, paddingBottom: Spacing.md },
  tabBar:       { flexDirection: 'row', gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tabGradient:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full },
  tabText:       { fontSize: 13, fontWeight: '500' as const, color: Colors.textMedium },
  tabTextActive: { fontWeight: '700' as const, color: '#fff' },
  headerInner:   { flex: 1 },
  addBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  addBtnText:    { fontSize: 13, fontWeight: '600' as const, color: '#fff' },
  footerLoader:  { marginVertical: 16 },
  separator:     { height: 0 },
  columnWrapper: { paddingHorizontal: Spacing.screenPad, gap: 12 },
  gridItem:      { flex: 1 },
});
