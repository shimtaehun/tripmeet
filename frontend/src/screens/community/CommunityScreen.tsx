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
import { Colors, Radius, Shadow } from '../../utils/theme';

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  question: { bg: Colors.primaryLight, text: Colors.primary },
  review: { bg: Colors.greenLight, text: Colors.green },
  info: { bg: Colors.accentLight, text: Colors.accent },
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

  const renderItem = ({ item }: { item: PostSummary }) => {
    const catStyle = CATEGORY_COLORS[item.category] ?? { bg: Colors.surface, text: Colors.textMedium };
    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.postMeta}>
          <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.catBadgeText, { color: catStyle.text }]}>
              {CATEGORY_LABELS[item.category]}
            </Text>
          </View>
          <Text style={styles.viewCount}>조회 {item.view_count}</Text>
        </View>
        <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => navigation.navigate('PostCreate')}
          activeOpacity={0.85}
        >
          <Text style={styles.writeBtnText}>+ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 탭 */}
      <View style={styles.tabBar}>
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleCategorySelect(cat.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={posts}
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
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>아직 게시글이 없습니다.</Text>
              <Text style={styles.emptyHint}>첫 번째 글을 작성해보세요!</Text>
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
  writeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  writeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700' as const,
  },

  // 탭
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMedium,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700' as const,
  },

  // 리스트
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 16,
    ...Shadow.card,
  },
  separator: {
    height: 10,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  viewCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  postDate: {
    fontSize: 12,
    color: Colors.textLight,
  },

  // 기타
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
