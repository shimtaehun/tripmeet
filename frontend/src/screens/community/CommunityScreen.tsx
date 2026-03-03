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
import { useNavigation } from '@react-navigation/native';
import { getPosts, PostSummary } from '../../services/postService';
import { Colors, Gradients, Radius, Shadow, Animation, Spacing } from '../../utils/theme';

const CATEGORIES = [
  { label: '전체',  value: undefined,    color: Colors.primary },
  { label: '질문',  value: 'question',   color: Colors.primary },
  { label: '후기',  value: 'review',     color: Colors.green   },
  { label: '정보',  value: 'info',       color: Colors.amber   },
];

const CAT_META: Record<string, { label: string; bg: string; text: string }> = {
  question: { label: '질문', bg: Colors.primaryLight, text: Colors.primary },
  review:   { label: '후기', bg: Colors.greenLight,   text: Colors.green   },
  info:     { label: '정보', bg: Colors.amberLight,   text: Colors.amber   },
};

function PostCard({ item, index }: { item: PostSummary; index: number }) {
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

  const meta = CAT_META[item.category] ?? { label: item.category, bg: Colors.surface, text: Colors.textMedium };

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateY: slideY }] }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={styles.postCard}>
          <View style={[styles.catBar, { backgroundColor: meta.text }]} />

          <View style={styles.postBody}>
            <View style={styles.postTop}>
              <View style={[styles.catBadge, { backgroundColor: meta.bg }]}>
                <Text style={[styles.catBadgeText, { color: meta.text }]}>{meta.label}</Text>
              </View>
              <View style={styles.viewRow}>
                <Ionicons name="eye-outline" size={11} color={Colors.textLight} />
                <Text style={styles.viewCount}>{item.view_count}</Text>
              </View>
            </View>
            <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
          </View>

          <Ionicons name="chevron-forward" size={16} color={Colors.border} style={{ alignSelf: 'center' }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
      if (cursor) { setPosts(prev => [...prev, ...res.items]); }
      else { setPosts(res.items); }
      setNextCursor(res.next_cursor);
    } catch (e) { console.error('게시글 목록 조회 오류:', e); }
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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.community}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => navigation.navigate('PostCreate')}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={14} color="#fff" />
          <Text style={styles.writeBtnText}>글쓰기</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabBar}>
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={String(cat.value)}
              onPress={() => { if (cat.value !== selectedCategory) setSelectedCategory(cat.value); }}
              activeOpacity={0.75}
              style={[styles.tab, active && { backgroundColor: cat.color }]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{cat.label}</Text>
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
          renderItem={({ item, index }) => <PostCard item={item} index={index} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>아직 게시글이 없습니다</Text>
              <Text style={styles.emptyHint}>첫 번째 글을 작성해보세요!</Text>
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
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  writeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },

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
  tabText: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' as const },
  tabTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' as const },

  listContent: { padding: 14, paddingBottom: 32 },

  postCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  catBar: { width: 4 },
  postBody: { flex: 1, padding: 14 },
  postTop: {
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
  catBadgeText: { fontSize: 11, fontWeight: '700' as const },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewCount: { fontSize: 11, color: Colors.textLight },
  postTitle: {
    fontSize: 15, fontWeight: '600' as const, color: Colors.text,
    lineHeight: 22, marginBottom: 8,
  },
  postDate: { fontSize: 11, color: Colors.textLight },

  loader: { marginTop: 60 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textMedium },
  emptyHint: { fontSize: 13, color: Colors.textLight },
});
