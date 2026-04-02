import React, { useState, useEffect } from 'react';
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
// Alert은 ImagePicker 권한 거부 안내용으로만 유지
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createRestaurant, updateRestaurant, getRestaurant } from '../../services/restaurantService';
import { compressImage } from '../../utils/imageCompressor';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

const MAX_IMAGES = 5;

function StarSelector({ rating, onSelect }: { rating: number; onSelect: (r: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onSelect(i)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={32} color={i <= rating ? Colors.amber : Colors.border} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RestaurantCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editRestaurantId: string | undefined = route.params?.restaurantId;
  const isEditMode = !!editRestaurantId;

  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!editRestaurantId) return;
    getRestaurant(editRestaurantId).then(data => {
      setName(data.name);
      setLocationName(data.location_name);
      setDescription(data.description ?? '');
      setRating(data.rating);
    }).catch(() => {
      Alert.alert('오류', '맛집 정보를 불러올 수 없습니다.');
      navigation.goBack();
    });
  }, [editRestaurantId]);

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
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('가게 이름을 입력해주세요.');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('위치를 입력해주세요.');
      return;
    }
    if (rating === 0) {
      setErrorMsg('별점을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateRestaurant(editRestaurantId!, {
          name: name.trim(),
          location_name: locationName.trim(),
          description: description.trim() || undefined,
          rating,
        });
      } else {
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
      }
      navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Restaurant' } }] });
    } catch (e: any) {
      console.error('맛집 저장 오류:', e);
      setErrorMsg(e?.message ?? (isEditMode ? '맛집 수정에 실패했습니다.' : '맛집 등록에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={Gradients.food as [string, string, ...string[]]}
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
        <Text style={styles.headerTitle}>{isEditMode ? '맛집 수정' : '맛집 등록'}</Text>
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

      <View style={styles.section}>
        <Text style={styles.label}>가게 이름 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="가게 이름을 입력하세요"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>위치 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="예: 홍대, 도쿄 시부야"
          placeholderTextColor={Colors.textLight}
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
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>별점 <Text style={styles.required}>*</Text></Text>
        <StarSelector rating={rating} onSelect={setRating} />
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {!isEditMode && <View style={[styles.section, { borderBottomWidth: 0 }]}>
        <Text style={styles.label}>사진 ({images.length}/{MAX_IMAGES})</Text>
        <View style={styles.imageRow}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.imageThumbnail} accessibilityLabel={`선택된 사진 ${index + 1}`} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
              <Ionicons name="camera-outline" size={22} color={Colors.textLight} />
              <Text style={styles.addImageText}>추가</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>}
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
  required: { color: Colors.red },

  input: {
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  descriptionInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
    paddingVertical: 4,
    lineHeight: 24,
  },

  starRow: { flexDirection: 'row', gap: 8 },

  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageWrapper: { position: 'relative' },
  imageThumbnail: { width: 80, height: 80, borderRadius: Radius.md },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 4,
  },
  addImageText: { fontSize: 11, color: Colors.textLight },
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
