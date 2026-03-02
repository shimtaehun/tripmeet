import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { getPost, deletePost, Post } from '../../services/postService';

const CATEGORY_LABELS: Record<string, string> = {
  question: '질문',
  review: '후기',
  info: '정보',
};

export default function PostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const postId: string = route.params?.postId;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id ?? null);

      try {
        const data = await getPost(postId);
        setPost(data);
      } catch (e) {
        console.error('게시글 조회 오류:', e);
        Alert.alert('오류', '게시글을 불러올 수 없습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]);

  const handleDelete = () => {
    Alert.alert('삭제', '게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId);
            navigation.goBack();
          } catch (e) {
            console.error('게시글 삭제 오류:', e);
            Alert.alert('오류', '게시글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!post) return null;

  const isAuthor = currentUserId === post.user_id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
        {isAuthor && (
          <View style={styles.authorActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PostCreate', { post })}
              style={styles.editButton}
            >
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.meta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[post.category]}</Text>
          </View>
          <Text style={styles.viewCount}>조회 {post.view_count}</Text>
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{post.author?.nickname ?? '알 수 없음'}</Text>
          <Text style={styles.date}>{new Date(post.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.body}>{post.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: { fontSize: 15, color: '#3B82F6' },
  authorActions: { flexDirection: 'row', gap: 16 },
  editButton: {},
  editText: { fontSize: 15, color: '#6B7280' },
  deleteText: { fontSize: 15, color: '#EF4444' },
  content: { padding: 16 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 12, color: '#6B7280' },
  viewCount: { fontSize: 12, color: '#9CA3AF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  authorName: { fontSize: 14, color: '#374151' },
  date: { fontSize: 13, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  body: { fontSize: 15, color: '#374151', lineHeight: 24 },
});
