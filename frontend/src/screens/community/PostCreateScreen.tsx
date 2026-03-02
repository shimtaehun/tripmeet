import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPost, updatePost, Post } from '../../services/postService';

const CATEGORIES = [
  { label: '질문', value: 'question' },
  { label: '후기', value: 'review' },
  { label: '정보', value: 'info' },
];

export default function PostCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // 수정 모드일 경우 기존 게시글 데이터가 params로 전달됨
  const editPost: Post | undefined = route.params?.post;
  const isEditMode = !!editPost;

  const [category, setCategory] = useState(editPost?.category ?? 'question');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
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
    } catch (e) {
      console.error('게시글 저장 오류:', e);
      Alert.alert('오류', isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '게시글 수정' : '글쓰기'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.submitText}>{isEditMode ? '수정' : '등록'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {!isEditMode && (
        <View style={styles.section}>
          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryButton, category === cat.value && styles.categoryButtonActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={[styles.categoryButtonText, category === cat.value && styles.categoryButtonTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요"
          placeholderTextColor="#9CA3AF"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  cancelText: { fontSize: 15, color: '#6B7280' },
  submitText: { fontSize: 15, color: '#3B82F6', fontWeight: '600' },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  categoryButtonText: { fontSize: 14, color: '#6B7280' },
  categoryButtonTextActive: { color: '#3B82F6', fontWeight: '600' },
  titleInput: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  contentInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 200,
    paddingVertical: 4,
  },
});
