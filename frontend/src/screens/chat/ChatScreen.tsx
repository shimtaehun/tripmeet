import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import {
  getOrCreateChatRoom,
  sendMessage,
  subscribeToMessages,
  ChatMessage,
} from '../../services/chatService';
import { Colors, Radius, Spacing } from '../../utils/theme';

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { targetUserId, targetNickname } = route.params;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const userId = session.user.id;
      setMyUserId(userId);
      const id = await getOrCreateChatRoom(userId, targetUserId);
      setRoomId(id);
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleSend = async () => {
    if (!inputText.trim() || !roomId || !myUserId) return;
    const text = inputText.trim();
    setInputText('');
    try {
      await sendMessage(roomId, myUserId, text);
    } catch (e) {
      console.error('메시지 전송 오류:', e);
      setInputText(text);
      Alert.alert('오류', '메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === myUserId;
    return (
      <View style={[styles.messageRow, isMine ? styles.myRow : styles.theirRow]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={isMine ? styles.myText : styles.theirText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{targetNickname}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지 입력"
          placeholderTextColor={Colors.textLight}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },

  messageList: { padding: 16, gap: 8 },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.xs,
  },
  theirBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  myText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  theirText: { color: Colors.text, fontSize: 15, lineHeight: 22 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: Colors.primaryBorder },
});
