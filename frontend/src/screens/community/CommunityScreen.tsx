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
import { getPosts, PostSummary } from '../../services/postService';

const CATEGORIES = [
  { label: '전체', value: undefined },
  { label: '질문', value: 'question' },
  { label: '후기', value: 'review' },
  { label: '정보', value: 'info' },
];

const CATEGORY_LABELS: Record<string, string> = {
  question: '질문',
  review: '후기',
  info: '정보',
};

export default function CommunityScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (category: string | undefined, cursor?: string) => {
    try {
      const res = await getPosts(category, cursor);
      if (cursor) {
        setPosts(prev => [...prev, ...res.items]);
      } else {
        setPosts(res.items);
      }
      setNextCursor(res.next_cursor);
    } catch (e) {
      console.error('게시글 목록 조회 오류:', e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(selectedCategory).finally(() => setLoading(false));
  }, [selectedCategory, fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(selectedCategory);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchPosts(selectedCategory, nextCursor);
    setLoadingMore(false);
  };

  const handleCategorySelect = (value: string | undefined) => {
    if (value === selectedCategory) return;
    setSelectedCategory(value);
  };

  const renderItem = ({ item }: { item: PostSummary }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <View style={styles.postHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[item.category]}</Text>
        </View>
        <Text style={styles.viewCount}>조회 {item.view_count}</Text>
      </View>
      <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={() => navigation.navigate('PostCreate')}
        >
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.tab, selectedCategory === cat.value && styles.tabActive]}
            onPress={() => handleCategorySelect(cat.value)}
          >
            <Text style={[styles.tabText, selectedCategory === cat.value && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>게시글이 없습니다.</Text>
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
  writeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  writeButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabActive: { backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 14, color: '#6B7280' },
  tabTextActive: { color: '#3B82F6', fontWeight: '600' },
  postItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 12, color: '#6B7280' },
  viewCount: { fontSize: 12, color: '#9CA3AF' },
  postTitle: { fontSize: 15, color: '#111827', marginBottom: 6 },
  postDate: { fontSize: 12, color: '#9CA3AF' },
  loader: { marginTop: 60 },
  footer: { paddingVertical: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
