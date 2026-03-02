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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { createRestaurant } from '../../services/restaurantService';
import { compressImage } from '../../utils/imageCompressor';

const MAX_IMAGES = 5;

function StarSelector({ rating, onSelect }: { rating: number; onSelect: (r: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onSelect(i)}>
          <Text style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RestaurantCreateScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('알림', `이미지는 최대 ${MAX_IMAGES}장까지 선택할 수 있습니다.`);
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });

    if (result.canceled) return;

    const selected = result.assets.slice(0, remaining).map(a => ({ uri: a.uri }));
    setImages(prev => [...prev, ...selected]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '가게 이름을 입력해주세요.');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('알림', '위치를 입력해주세요.');
      return;
    }
    if (rating === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 이미지 압축 (context.md 원칙 4: 500KB 이하)
      const compressedImages = await Promise.all(
        images.map(async (img, index) => {
          const compressed = await compressImage(img.uri);
          return {
            uri: compressed.uri,
            type: compressed.mimeType,
            name: `photo_${index}.jpg`,
          };
        }),
      );

      await createRestaurant({
        name: name.trim(),
        location_name: locationName.trim(),
        description: description.trim() || undefined,
        rating,
        images: compressedImages,
      });

      navigation.goBack();
    } catch (e) {
      console.error('맛집 등록 오류:', e);
      Alert.alert('오류', '맛집 등록에 실패했습니다.');
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
        <Text style={styles.headerTitle}>맛집 등록</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.submitText}>등록</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>가게 이름 *</Text>
        <TextInput
          style={styles.input}
          placeholder="가게 이름을 입력하세요"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          maxLength={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>위치 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 홍대, 도쿄 시부야"
          placeholderTextColor="#9CA3AF"
          value={locationName}
          onChangeText={setLocationName}
          maxLength={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>설명</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="맛집 설명을 입력하세요"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>별점 *</Text>
        <StarSelector rating={rating} onSelect={setRating} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>사진 ({images.length}/{MAX_IMAGES})</Text>
        <View style={styles.imageRow}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.imageThumbnail} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
              <Text style={styles.addImageIcon}>+</Text>
              <Text style={styles.addImageText}>사진 추가</Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  descriptionInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    paddingVertical: 4,
  },
  starRow: { flexDirection: 'row', gap: 6 },
  starFilled: { fontSize: 32, color: '#FBBF24' },
  starEmpty: { fontSize: 32, color: '#E5E7EB' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageWrapper: { position: 'relative' },
  imageThumbnail: { width: 80, height: 80, borderRadius: 8 },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  addImageIcon: { fontSize: 22, color: '#9CA3AF' },
  addImageText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});
