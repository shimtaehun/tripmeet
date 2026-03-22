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
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

interface Props {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  similarityScore?: number;
  onChatPress: (userId: string, nickname: string) => void;
  index?: number;
}

function getSimilarityColor(score: number): string {
  if (score >= 0.8) return '#22C55E';
  if (score >= 0.6) return '#3B82F6';
  if (score >= 0.4) return '#F59E0B';
  return '#94A3B8';
}

export default function TravelerListItem({
  userId, nickname, profileImageUrl, bio, similarityScore, onChatPress, index = 0,
}: Props) {
  // 프레스 시 scale 0.97 스프링 애니메이션
  const scale = useRef(new Animated.Value(1)).current;
  // 입장 시 opacity 0→1
  const opacity = useRef(new Animated.Value(0)).current;
  // 입장 시 아래에서 위로 슬라이드 (모바일 피드 패턴)
  const slideY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    // index 기반 stagger: 카드가 순차적으로 올라오는 효과
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        delay: index * 80,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 터치 다운: 카드가 살짝 눌리는 느낌
  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

  // 터치 업: 원래 크기로 복귀
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity, transform: [{ scale }, { translateY: slideY }] },
      ]}
    >
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onChatPress(userId, nickname)}
        activeOpacity={1}
        accessibilityLabel={`${nickname}에게 채팅하기`}
      >
        <View style={styles.card}>

          {/* 아바타 — 그라디언트 링으로 프리미엄 느낌 */}
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={Gradients.matching}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <Image
                source={
                  profileImageUrl
                    ? { uri: profileImageUrl }
                    : require('../../../assets/icon.png')
                }
                style={styles.avatar}
              />
            </LinearGradient>
            {/* 온라인 상태 인디케이터 — 흰 테두리로 배경과 구분 */}
            <View style={styles.onlineDot} />
          </View>

          {/* 사용자 정보 */}
          <View style={styles.info}>
            <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>

            {bio ? (
              <Text style={styles.bio} numberOfLines={2}>{bio}</Text>
            ) : (
              <Text style={styles.bioEmpty}>소개 없음</Text>
            )}

            {/* 여행 중 상태 배지 */}
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>여행 중</Text>
              </View>
              {similarityScore != null && similarityScore > 0 && (
                <View style={[styles.similarityBadge, { backgroundColor: getSimilarityColor(similarityScore) + '18' }]}>
                  <Text style={[styles.similarityText, { color: getSimilarityColor(similarityScore) }]}>
                    {Math.round(similarityScore * 100)}% 일치
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* CTA 버튼 — 매칭 그린 그라디언트 */}
          <LinearGradient
            colors={Gradients.matching}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatBtn}
          >
            <Ionicons name="chatbubble" size={13} color="#fff" />
            <Text style={styles.chatBtnText}>채팅</Text>
          </LinearGradient>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 애니메이션 래퍼 — 그림자가 잘리지 않도록 overflow 설정 제거
  wrap: {},

  // 카드 본체 — 순백 배경으로 오프화이트 앱 배경과 대비
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },

  // 아바타 래퍼 — 그라디언트 링 + 온라인 인디케이터를 겹침
  avatarWrap: {
    position: 'relative',
  },

  // 그라디언트 링: padding 4px로 아바타를 감쌈
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 실제 프로필 이미지 — 링 안쪽에 맞게 크기 조정
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.surface,
  },

  // 온라인 초록 점 — 링 바깥 하단 우측에 배치
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green,
    // 카드 배경색과 동일한 테두리로 분리된 느낌 연출
    borderWidth: 2.5,
    borderColor: Colors.card,
  },

  // 정보 영역 — flex: 1로 버튼 제외 공간 차지
  info: {
    flex: 1,
    gap: 3,
  },

  // 닉네임 — 강한 weight + 타이트한 자간
  nickname: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.2,
    marginBottom: 1,
  },

  // 소개글 — 2줄 까지만 표시
  bio: {
    fontSize: 13,
    color: Colors.textMedium,
    lineHeight: 20,
  },

  // 소개 없음 상태 — 이탤릭체로 미입력 구분
  bioEmpty: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },

  // 상태 + 유사도 배지 행
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },

  // 여행 중 배지 — 녹색 점 + 텍스트
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.green,
  },

  // 유사도 배지
  similarityBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  similarityText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },

  // 채팅 버튼 — 그라디언트 + 블루 글로우 그림자
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadow.blue,
  },

  chatBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
