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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { db } from '../../services/firebaseClient';

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅</Text>
      {rooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>아직 채팅이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() =>
                navigation.navigate('Chat', {
                  targetUserId: getTargetUserId(item),
                  targetNickname: getTargetUserId(item),
                })
              }
            >
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{getTargetUserId(item)}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || '대화를 시작해보세요.'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  lastMessage: { fontSize: 13, color: '#9CA3AF' },
});
