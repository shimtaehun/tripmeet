import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Shadow } from '../../utils/theme';

interface Props {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  onChatPress: (userId: string, nickname: string) => void;
  index?: number;
}

export default function TravelerListItem({
  userId, nickname, profileImageUrl, bio, onChatPress, index = 0,
}: Props) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideX  = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true }),
      Animated.spring(slideX, { toValue: 0, delay: index * 70, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateX: slideX }] }}>
      <View style={styles.card}>
        {/* 프로필 사진 */}
        <View style={styles.avatarWrap}>
          <Image
            source={profileImageUrl ? { uri: profileImageUrl } : require('../../../assets/icon.png')}
            style={styles.avatar}
          />
          {/* 온라인 인디케이터 */}
          <View style={styles.onlineDot} />
        </View>

        {/* 정보 */}
        <View style={styles.info}>
          <Text style={styles.nickname}>{nickname}</Text>
          {bio ? (
            <Text style={styles.bio} numberOfLines={1}>{bio}</Text>
          ) : (
            <Text style={styles.bioEmpty}>자기소개 없음</Text>
          )}
        </View>

        {/* 채팅 버튼 */}
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => onChatPress(userId, nickname)}
          activeOpacity={1}
        >
          <LinearGradient
            colors={Gradients.coral}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatBtn}
          >
            <Ionicons name="chatbubble-outline" size={13} color="#fff" />
            <Text style={styles.chatBtnText}>채팅</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: { flex: 1 },
  nickname: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 3 },
  bio: { fontSize: 12, color: Colors.textMedium },
  bioEmpty: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...Shadow.blue,
  },
  chatBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#fff' },
});
