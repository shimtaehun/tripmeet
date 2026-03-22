import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { getPost, deletePost, Post } from '../../services/postService';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

const CAT_META: Record<string, { label: string; bg: string; text: string }> = {
  question: { label: '질문', bg: Colors.primaryLight, text: Colors.primary },
  review:   { label: '후기', bg: Colors.greenLight,   text: Colors.green   },
  info:     { label: '정보', bg: Colors.amberLight,   text: Colors.amber   },
};

function goBackOrCommunity(navigation: any) {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate('Main', { screen: 'Community' });
  }
}

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
          { text: '확인', onPress: () => goBackOrCommunity(navigation) },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]);

  const handleDelete = () => {
    const execute = async () => {
      try {
        await deletePost(postId);
        goBackOrCommunity(navigation);
      } catch (e: any) {
        console.error('게시글 삭제 오류:', e);
        Alert.alert('삭제 실패', e?.message ?? '게시글 삭제에 실패했습니다.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('게시글을 삭제하시겠습니까?')) {
        execute();
      }
    } else {
      Alert.alert('삭제', '게시글을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: execute },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!post) return null;

  const isAuthor = currentUserId === post.user_id;
  const meta = CAT_META[post.category] ?? { label: post.category, bg: Colors.surface, text: Colors.textMedium };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={Gradients.community}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => goBackOrCommunity(navigation)}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.backBtnCircle}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {isAuthor && (
          <View style={styles.authorActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PostCreate', { post })}
              style={styles.actionBtn}
            >
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.meta}>
          <LinearGradient
            colors={
              post.category === 'review' ? [Colors.green, '#34D399'] :
              post.category === 'info'   ? [Colors.amber, '#FCD34D'] :
              Gradients.indigo
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryBadgeTextWhite}>{meta.label}</Text>
          </LinearGradient>
          <View style={styles.viewRow}>
            <Ionicons name="eye-outline" size={12} color={Colors.textLight} />
            <Text style={styles.viewCount}>{post.view_count}</Text>
          </View>
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.textMedium} />
            <Text style={styles.authorName}>{post.author?.nickname ?? '알 수 없음'}</Text>
          </View>
          <Text style={styles.date}>{new Date(post.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.body}>{post.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backBtnCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  editText: { fontSize: 14, color: 'rgba(255,255,255,0.90)', fontWeight: '600' as const },
  deleteText: { fontSize: 14, color: '#FCA5A5', fontWeight: '600' as const },

  content: {
    backgroundColor: Colors.card,
    margin: Spacing.screenPad,
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadow.card,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '700' as const },
  categoryBadgeTextWhite: { fontSize: 12, fontWeight: '700' as const, color: '#fff' },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewCount: { fontSize: 12, color: Colors.textLight },

  title: { fontSize: 20, fontWeight: '800' as const, color: Colors.text, marginBottom: 14, lineHeight: 28 },

  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' as const },
  date: { fontSize: 12, color: Colors.textLight },

  divider: { height: 1, backgroundColor: Colors.divider, marginBottom: 18 },
  body: { fontSize: 15, color: Colors.text, lineHeight: 26 },
});
