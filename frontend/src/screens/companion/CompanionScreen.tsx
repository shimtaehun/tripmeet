import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCompanions, CompanionSummary } from '../../services/companionService';

type StatusFilter = 'all' | 'open' | 'closed';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '모집중', value: 'open' },
  { label: '마감', value: 'closed' },
];

export default function CompanionScreen() {
  const navigation = useNavigation<any>();
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

  useEffect(() => {
    setLoading(true);
    fetchCompanions(statusFilter).finally(() => setLoading(false));
  }, [statusFilter, fetchCompanions]);

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

  const renderItem = ({ item }: { item: CompanionSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.destination}>{item.destination}</Text>
        <View style={[styles.statusBadge, item.status === 'open' ? styles.badgeOpen : styles.badgeClosed]}>
          <Text style={[styles.statusBadgeText, item.status === 'open' ? styles.badgeOpenText : styles.badgeClosedText]}>
            {item.status === 'open' ? '모집중' : '마감'}
          </Text>
        </View>
      </View>
      <Text style={styles.dateRange}>
        {item.travel_start_date} ~ {item.travel_end_date}
      </Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.participants}>최대 {item.max_participants}명</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>동행 구인</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CompanionCreate')}
        >
          <Text style={styles.addButtonText}>등록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {STATUS_TABS.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, statusFilter === tab.value && styles.tabActive]}
            onPress={() => setStatusFilter(tab.value)}
          >
            <Text style={[styles.tabText, statusFilter === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={companions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>등록된 동행 구인이 없습니다.</Text>
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 13, color: '#6B7280' },
  tabTextActive: { color: '#3B82F6', fontWeight: '600' },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  destination: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeOpen: { backgroundColor: '#D1FAE5' },
  badgeClosed: { backgroundColor: '#F3F4F6' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  badgeOpenText: { color: '#065F46' },
  badgeClosedText: { color: '#6B7280' },
  dateRange: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  description: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  participants: { fontSize: 12, color: '#9CA3AF' },
  loader: { marginTop: 60 },
  footer: { paddingVertical: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
