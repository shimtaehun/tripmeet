import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../utils/theme';

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
    <View style={styles.card}>
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
        {bio ? (
          <Text style={styles.bio} numberOfLines={1}>{bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>자기소개 없음</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.chatBtn}
        onPress={() => onChatPress(userId, nickname)}
        activeOpacity={0.8}
      >
        <Text style={styles.chatBtnText}>💬 채팅</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 14,
    ...Shadow.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nickname: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  bio: {
    fontSize: 12,
    color: Colors.textMedium,
  },
  bioEmpty: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  chatBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  chatBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700' as const,
  },
});
