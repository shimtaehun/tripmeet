import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { db } from '../../services/firebaseClient';
import { Colors, Radius, Shadow, Spacing } from '../../utils/theme';

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: number;
}

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setMyUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!myUserId) return;

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', myUserId),
      orderBy('lastMessageAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ChatRoom[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        participants: doc.data().participants,
        lastMessage: doc.data().lastMessage ?? '',
        lastMessageAt: doc.data().lastMessageAt?.toMillis() ?? 0,
      }));
      setRooms(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myUserId]);

  const getTargetUserId = (room: ChatRoom) =>
    room.participants.find((id) => id !== myUserId) ?? '';

  if (loading) {
    return (
      <View style={styles.loaderRoot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>채팅</Text>
      </LinearGradient>

      {rooms.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>아직 채팅이 없습니다.</Text>
          <Text style={styles.emptyHint}>매칭 탭에서 여행자와 채팅을 시작해보세요.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.divider, marginLeft: 72 }} />}
          renderItem={({ item }) => {
            const targetId = getTargetUserId(item);
            return (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() =>
                  navigation.navigate('Chat', {
                    targetUserId: targetId,
                    targetNickname: targetId,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrap}>
                  <Ionicons name="person" size={22} color={Colors.primary} />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{targetId}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || '대화를 시작해보세요.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={Colors.border} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loaderRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff' },

  listContent: { paddingTop: 8 },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    gap: 14,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginBottom: 3 },
  lastMessage: { fontSize: 13, color: Colors.textLight },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600' as const, color: Colors.textMedium },
  emptyHint: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
});
