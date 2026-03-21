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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import {
  getCompanion,
  closeCompanion,
  deleteCompanion,
  applyCompanion,
  updateApplicationStatus,
  CompanionDetail,
  ApplicationInfo,
} from '../../services/companionService';
import { Colors, Radius, Shadow, Spacing } from '../../utils/theme';

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

  const handleDelete = () => {
    Alert.alert('삭제', '동행 구인을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompanion(companionId);
            navigation.navigate('Main', { screen: 'Companion' });
          } catch (e) {
            console.error('동행 구인 삭제 오류:', e);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!companion) return null;

  const isAuthor = currentUserId === companion.user_id;
  const isOpen = companion.status === 'open';

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        {isAuthor && (
          <View style={styles.authorActions}>
            {isOpen && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CompanionEdit', { companion })}
                style={styles.actionBtn}
              >
                <Text style={styles.editText}>수정</Text>
              </TouchableOpacity>
            )}
            {isOpen && (
              <TouchableOpacity onPress={handleClose} style={styles.actionBtn}>
                <Text style={styles.closeText}>마감</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.destinationWrap}>
            <Ionicons name="airplane" size={16} color={Colors.amber} />
            <Text style={styles.destination}>{companion.destination}</Text>
          </View>
          <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            <Text style={[styles.statusBadgeText, isOpen ? styles.badgeOpenText : styles.badgeClosedText]}>
              {isOpen ? '모집중' : '마감'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMedium} />
          <Text style={styles.dateRange}>{companion.travel_start_date} ~ {companion.travel_end_date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={13} color={Colors.textMedium} />
          <Text style={styles.participants}>최대 {companion.max_participants}명 모집</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.description}>{companion.description}</Text>

        <View style={styles.divider} />

        <View style={styles.authorRow}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.textMedium} />
            <Text style={styles.authorName}>{companion.author?.nickname ?? '알 수 없음'}</Text>
          </View>
          <Text style={styles.date}>{new Date(companion.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>
      </View>

      {!isAuthor && isOpen && (
        <View style={styles.applySection}>
          {showApplyInput ? (
            <>
              <TextInput
                style={styles.applyInput}
                placeholder="신청 메시지를 입력하세요 (선택)"
                placeholderTextColor={Colors.textLight}
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
              activeOpacity={0.85}
            >
              <Ionicons name="people-outline" size={18} color="#fff" />
              <Text style={styles.applyButtonText}>동행 신청</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
  root: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  authorActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  editText: { fontSize: 14, color: Colors.textMedium, fontWeight: '600' as const },
  closeText: { fontSize: 14, color: Colors.amber, fontWeight: '600' as const },
  deleteText: { fontSize: 14, color: Colors.red, fontWeight: '600' as const },

  content: {
    backgroundColor: Colors.card,
    margin: Spacing.screenPad,
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadow.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  destinationWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  destination: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  badgeOpen: { backgroundColor: Colors.greenLight },
  badgeClosed: { backgroundColor: Colors.surface },
  statusBadgeText: { fontSize: 12, fontWeight: '700' as const },
  badgeOpenText: { color: Colors.green },
  badgeClosedText: { color: Colors.textMedium },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  dateRange: { fontSize: 14, color: Colors.textMedium },
  participants: { fontSize: 13, color: Colors.textMedium },

  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 16 },
  description: { fontSize: 15, color: Colors.text, lineHeight: 26 },

  authorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' as const },
  date: { fontSize: 12, color: Colors.textLight },

  applySection: {
    marginHorizontal: Spacing.screenPad,
    marginBottom: Spacing.screenPad,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    ...Shadow.primary,
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  applyInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
    minHeight: 80,
    marginBottom: 10,
  },
  applyButtonRow: { flexDirection: 'row', gap: 10 },
  cancelApplyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  cancelApplyText: { fontSize: 15, color: Colors.textMedium },
  submitApplyButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitApplyText: { color: '#fff', fontSize: 15, fontWeight: '600' as const },

  applicationsSection: {
    marginHorizontal: Spacing.screenPad,
    marginBottom: Spacing.screenPad,
  },
  applicationsTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  applicationCard: {
    padding: 14,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    marginBottom: 10,
    ...Shadow.card,
  },
  applicationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  applicantName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  appStatusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 2 },
  appBadgePending: { backgroundColor: Colors.amberLight },
  appBadgeAccepted: { backgroundColor: Colors.greenLight },
  appBadgeRejected: { backgroundColor: Colors.redLight },
  appStatusText: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMedium },
  applicationMessage: { fontSize: 13, color: Colors.textMedium, marginBottom: 10, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rejectButtonText: { color: Colors.textMedium, fontSize: 13, fontWeight: '600' as const },
});
