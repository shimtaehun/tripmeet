import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  onChatPress: (userId: string, nickname: string) => void;
}

export default function TravelerListItem({
  userId,
  nickname,
  profileImageUrl,
  bio,
  onChatPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={
          profileImageUrl
            ? { uri: profileImageUrl }
            : require('../../../assets/icon.png')
        }
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.nickname}>{nickname}</Text>
        {bio ? <Text style={styles.bio} numberOfLines={1}>{bio}</Text> : null}
      </View>
      <TouchableOpacity style={styles.chatButton} onPress={() => onChatPress(userId, nickname)}>
        <Text style={styles.chatButtonText}>채팅</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  info: { flex: 1 },
  nickname: { fontSize: 15, fontWeight: '600', color: '#111827' },
  bio: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  chatButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chatButtonText: { color: '#3B82F6', fontSize: 13, fontWeight: '600' },
});
