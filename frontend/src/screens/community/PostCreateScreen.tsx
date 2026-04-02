import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPost, updatePost, Post } from '../../services/postService';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

const CATEGORIES = [
  { label: '질문', value: 'question', color: Colors.primary },
  { label: '후기', value: 'review',   color: Colors.green   },
  { label: '정보', value: 'info',     color: Colors.amber   },
];

export default function PostCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editPost: Post | undefined = route.params?.post;
  const isEditMode = !!editPost;

  const [category, setCategory] = useState(editPost?.category ?? 'question');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updatePost(editPost.id, title.trim(), content.trim());
      } else {
        await createPost(category, title.trim(), content.trim());
      }
      navigation.goBack();
    } catch (e: any) {
      console.error('게시글 저장 오류:', e);
      setErrorMsg(e?.message ?? (isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={Gradients.community as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSideBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.90)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '게시글 수정' : '글쓰기'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.headerSideBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.submitBtn}>
              <Text style={styles.submitText}>{isEditMode ? '수정' : '등록'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {!isEditMode && (
        <View style={styles.section}>
          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => {
              const active = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    active && { borderColor: cat.color, backgroundColor: cat.color + '14' },
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.categoryButtonText, active && { color: cat.color, fontWeight: '700' as const }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor={Colors.textLight}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>내용</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요"
          placeholderTextColor={Colors.textLight}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={5000}
        />
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerSideBtn: { width: 44, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: '#fff' },
  submitBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  submitText: { fontSize: 14, color: '#fff', fontWeight: '700' as const },

  section: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.screenPad,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 8,
  },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textMedium, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },

  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryButtonText: { fontSize: 14, color: Colors.textMedium },

  titleInput: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  contentInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 200,
    paddingVertical: 4,
    lineHeight: 24,
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { fontSize: 13, color: '#DC2626' },
});
