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
  markRoomAsRead,
  ChatMessage,
} from '../../services/chatService';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Spacing } from '../../utils/theme';

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
      markRoomAsRead(id, userId).catch(() => {});
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
        {isMine ? (
          <LinearGradient
            colors={Gradients.indigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.myBubble]}
          >
            <Text style={styles.myText}>{item.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.theirBubble]}>
            <Text style={styles.theirText}>{item.text}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={Gradients.chat}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.backBtnCircle}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{targetNickname}</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

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
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
          style={styles.sendButtonWrap}
        >
          <LinearGradient
            colors={inputText.trim() ? Gradients.indigo : [Colors.primaryBorder, Colors.primaryBorder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </LinearGradient>
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
  },
  backBtn: { width: 36, alignItems: 'center' },
  backBtnCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: '#fff' },

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
  sendButtonWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
