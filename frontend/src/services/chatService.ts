import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebaseClient';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

/**
 * 두 userId를 정렬해 결합한 고정된 채팅방 ID를 생성한다.
 * 같은 두 사용자는 항상 동일한 채팅방을 사용한다.
 */
export function getChatRoomId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join('_');
}

/**
 * 채팅방 문서가 없으면 생성하고 채팅방 ID를 반환한다.
 */
export async function getOrCreateChatRoom(
  myUserId: string,
  targetUserId: string,
): Promise<string> {
  const roomId = getChatRoomId(myUserId, targetUserId);
  const roomRef = doc(db, 'chatRooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      participants: [myUserId, targetUserId],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
    });
  }

  return roomId;
}

/**
 * 메시지를 전송하고 채팅방의 lastMessage와 상대방 미읽음 카운트를 갱신한다.
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  text: string,
): Promise<void> {
  const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  const roomRef = doc(db, 'chatRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  const participants: string[] = roomSnap.data()?.participants ?? [];
  const recipientId = participants.find((id) => id !== senderId);

  const update: Record<string, unknown> = {
    lastMessage: text.trim(),
    lastMessageAt: serverTimestamp(),
  };
  if (recipientId) {
    update[`unreadCounts.${recipientId}`] = increment(1);
  }

  await setDoc(roomRef, update, { merge: true });
}

/**
 * 채팅방 입장 시 내 미읽음 카운트를 0으로 초기화한다.
 */
export async function markRoomAsRead(roomId: string, userId: string): Promise<void> {
  const roomRef = doc(db, 'chatRooms', roomId);
  await updateDoc(roomRef, { [`unreadCounts.${userId}`]: 0 });
}

/**
 * 채팅방 메시지를 실시간 구독한다.
 * 컴포넌트 언마운트 시 반환된 unsubscribe 함수를 호출해야 한다.
 */
export function subscribeToMessages(
  roomId: string,
  onMessages: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      senderId: doc.data().senderId,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toMillis() ?? Date.now(),
    }));
    onMessages(messages);
  });
}
