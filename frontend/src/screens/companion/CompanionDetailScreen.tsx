import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import {
  getCompanion,
  closeCompanion,
  applyCompanion,
  updateApplicationStatus,
  CompanionDetail,
  ApplicationInfo,
} from '../../services/companionService';

export default function CompanionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const companionId: string = route.params?.companionId;

  const [companion, setCompanion] = useState<CompanionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyInput, setShowApplyInput] = useState(false);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user.id ?? null);

    try {
      const data = await getCompanion(companionId);
      setCompanion(data);
    } catch (e) {
      console.error('동행 구인 조회 오류:', e);
      Alert.alert('오류', '동행 구인 정보를 불러올 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companionId]);

  const handleClose = () => {
    Alert.alert('마감', '동행 구인을 마감하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '마감',
        style: 'destructive',
        onPress: async () => {
          try {
            await closeCompanion(companionId);
            await loadData();
          } catch (e) {
            console.error('마감 오류:', e);
            Alert.alert('오류', '마감 처리에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyCompanion(companionId, applyMessage.trim() || undefined);
      Alert.alert('완료', '동행 신청이 완료되었습니다.');
      setShowApplyInput(false);
      setApplyMessage('');
    } catch (e: any) {
      console.error('동행 신청 오류:', e);
      Alert.alert('오류', e.message ?? '동행 신청에 실패했습니다.');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateStatus = async (app: ApplicationInfo, newStatus: 'accepted' | 'rejected') => {
    const label = newStatus === 'accepted' ? '수락' : '거절';
    Alert.alert(label, `이 신청을 ${label}하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: label,
        onPress: async () => {
          try {
            await updateApplicationStatus(companionId, app.id, newStatus);
            await loadData();
          } catch (e) {
            console.error('신청 상태 변경 오류:', e);
            Alert.alert('오류', '상태 변경에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!companion) return null;

  const isAuthor = currentUserId === companion.user_id;
  const isOpen = companion.status === 'open';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
        {isAuthor && isOpen && (
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeText}>마감</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.destination}>{companion.destination}</Text>
          <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            <Text style={[styles.statusBadgeText, isOpen ? styles.badgeOpenText : styles.badgeClosedText]}>
              {isOpen ? '모집중' : '마감'}
            </Text>
          </View>
        </View>

        <Text style={styles.dateRange}>
          {companion.travel_start_date} ~ {companion.travel_end_date}
        </Text>
        <Text style={styles.participants}>최대 {companion.max_participants}명 모집</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>{companion.description}</Text>

        <View style={styles.divider} />

        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{companion.author?.nickname ?? '알 수 없음'}</Text>
          <Text style={styles.date}>{new Date(companion.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>
      </View>

      {/* 신청 영역 (비작성자 + 모집중) */}
      {!isAuthor && isOpen && (
        <View style={styles.applySection}>
          {showApplyInput ? (
            <>
              <TextInput
                style={styles.applyInput}
                placeholder="신청 메시지를 입력하세요 (선택)"
                placeholderTextColor="#9CA3AF"
                value={applyMessage}
                onChangeText={setApplyMessage}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.applyButtonRow}>
                <TouchableOpacity
                  style={styles.cancelApplyButton}
                  onPress={() => { setShowApplyInput(false); setApplyMessage(''); }}
                >
                  <Text style={styles.cancelApplyText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitApplyButton}
                  onPress={handleApply}
                  disabled={applying}
                >
                  {applying ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitApplyText}>신청하기</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowApplyInput(true)}
            >
              <Text style={styles.applyButtonText}>동행 신청</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 신청자 목록 (작성자에게만 표시) */}
      {isAuthor && companion.applications.length > 0 && (
        <View style={styles.applicationsSection}>
          <Text style={styles.applicationsTitle}>신청자 목록 ({companion.applications.length}명)</Text>
          {companion.applications.map(app => (
            <View key={app.id} style={styles.applicationCard}>
              <View style={styles.applicationTop}>
                <Text style={styles.applicantName}>{app.applicant?.nickname ?? '알 수 없음'}</Text>
                <View style={[
                  styles.appStatusBadge,
                  app.status === 'accepted' ? styles.appBadgeAccepted :
                  app.status === 'rejected' ? styles.appBadgeRejected : styles.appBadgePending,
                ]}>
                  <Text style={styles.appStatusText}>
                    {app.status === 'accepted' ? '수락됨' : app.status === 'rejected' ? '거절됨' : '대기중'}
                  </Text>
                </View>
              </View>
              {app.message ? <Text style={styles.applicationMessage}>{app.message}</Text> : null}
              {app.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleUpdateStatus(app, 'accepted')}
                  >
                    <Text style={styles.acceptButtonText}>수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleUpdateStatus(app, 'rejected')}
                  >
                    <Text style={styles.rejectButtonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: { fontSize: 15, color: '#3B82F6' },
  closeText: { fontSize: 15, color: '#EF4444' },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  destination: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOpen: { backgroundColor: '#D1FAE5' },
  badgeClosed: { backgroundColor: '#F3F4F6' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  badgeOpenText: { color: '#065F46' },
  badgeClosedText: { color: '#6B7280' },
  dateRange: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  participants: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  description: { fontSize: 15, color: '#374151', lineHeight: 24 },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  authorName: { fontSize: 14, color: '#374151' },
  date: { fontSize: 13, color: '#9CA3AF' },
  applySection: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  applyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  applyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    marginBottom: 10,
  },
  applyButtonRow: { flexDirection: 'row', gap: 10 },
  cancelApplyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelApplyText: { fontSize: 15, color: '#6B7280' },
  submitApplyButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitApplyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  applicationsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applicationsTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  applicationCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 10,
  },
  applicationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  applicantName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  appStatusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  appBadgePending: { backgroundColor: '#FEF3C7' },
  appBadgeAccepted: { backgroundColor: '#D1FAE5' },
  appBadgeRejected: { backgroundColor: '#FEE2E2' },
  appStatusText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  applicationMessage: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectButtonText: { color: '#374151', fontSize: 13, fontWeight: '600' },
});
