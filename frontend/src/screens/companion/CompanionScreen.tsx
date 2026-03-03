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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCompanions, CompanionSummary } from '../../services/companionService';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

type StatusFilter = 'all' | 'open' | 'closed';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: '전체',  value: 'all'    },
  { label: '모집중', value: 'open'   },
  { label: '마감',  value: 'closed' },
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

  const renderItem = ({ item }: { item: CompanionSummary }) => {
    const isOpen = item.status === 'open';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <View style={styles.destinationRow}>
            <Ionicons name="airplane" size={14} color={Colors.amber} />
            <Text style={styles.destination}>{item.destination}</Text>
          </View>
          <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            <Text style={[styles.statusBadgeText, isOpen ? styles.badgeOpenText : styles.badgeClosedText]}>
              {isOpen ? '모집중' : '마감'}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textMedium} />
          <Text style={styles.dateRange}>{item.travel_start_date} ~ {item.travel_end_date}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardBottom}>
          <Ionicons name="people-outline" size={13} color={Colors.textLight} />
          <Text style={styles.participants}>최대 {item.max_participants}명</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.companion}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>동행 구인</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CompanionCreate')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.addBtnText}>등록</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabBar}>
        {STATUS_TABS.map(tab => {
          const active = statusFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setStatusFilter(tab.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={companions}
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
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '500' as const, color: Colors.textMedium },
  tabTextActive: { color: '#fff', fontWeight: '700' as const },

  listContent: { padding: 14, paddingBottom: 32 },
  separator: { height: 10 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeOpen: { backgroundColor: Colors.greenLight },
  badgeClosed: { backgroundColor: Colors.surface },
  statusBadgeText: { fontSize: 11, fontWeight: '700' as const },
  badgeOpenText: { color: Colors.green },
  badgeClosedText: { color: Colors.textMedium },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  dateRange: { fontSize: 13, color: Colors.textMedium },
  description: {
    fontSize: 14,
    color: Colors.textMedium,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  participants: { fontSize: 12, color: Colors.textLight, fontWeight: '500' as const },

  loader: { marginTop: 60 },
  footerLoader: { paddingVertical: 16 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textMedium },
  emptyHint: { fontSize: 13, color: Colors.textLight },
});
