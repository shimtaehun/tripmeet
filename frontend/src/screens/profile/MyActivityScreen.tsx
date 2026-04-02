import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { getPosts, PostSummary } from '../../services/postService';
import { getRestaurants, RestaurantSummary } from '../../services/restaurantService';
import { getCompanions, CompanionSummary } from '../../services/companionService';
import { apiFetch } from '../../services/apiClient';
import { checkBookmark } from '../../services/bookmarkService';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

const TABS = ['게시글', '맛집', '동행 구인', '신청 내역', '북마크'] as const;
type Tab = typeof TABS[number];

interface MyApplication {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  companion_id: string;
  companions: {
    destination: string;
    travel_start_date: string;
    travel_end_date: string;
    status: string;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '대기중',
  accepted: '수락됨',
  rejected: '거절됨',
};
const STATUS_COLOR: Record<string, string> = {
  pending: Colors.amber,
  accepted: Colors.green,
  rejected: Colors.red,
};

export default function MyActivityScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('게시글');
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [companions, setCompanions] = useState<CompanionSummary[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [bookmarks, setBookmarks] = useState<{ id: string; target_type: string; target_id: string; created_at: string }[]>([]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  const loadTab = async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === '게시글') {
        const res = await getPosts(undefined, undefined, true);
        setPosts(res.items);
      } else if (tab === '맛집') {
        const res = await getRestaurants(undefined, undefined, undefined, true);
        setRestaurants(res.items);
      } else if (tab === '동행 구인') {
        const res = await getCompanions(undefined, undefined, true);
        setCompanions(res.items);
      } else if (tab === '신청 내역') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/companions/my-applications`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        setApplications(data);
      } else if (tab === '북마크') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/bookmarks/`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (e) {
      console.error('내 활동 조회 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 48 }} />;
    }

    if (activeTab === '게시글') {
      if (posts.length === 0) return <Text style={styles.empty}>작성한 게시글이 없습니다.</Text>;
      return (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardMeta}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === '맛집') {
      if (restaurants.length === 0) return <Text style={styles.empty}>등록한 맛집이 없습니다.</Text>;
      return (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <View style={styles.starRow}>
                  <Ionicons name="star" size={12} color={Colors.amber} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>{item.location_name}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === '동행 구인') {
      if (companions.length === 0) return <Text style={styles.empty}>작성한 동행 구인글이 없습니다.</Text>;
      return (
        <FlatList
          data={companions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{item.destination}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'open' ? Colors.greenLight : Colors.surface },
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: item.status === 'open' ? Colors.green : Colors.textMedium },
                  ]}>
                    {item.status === 'open' ? '모집중' : '마감'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>{item.travel_start_date} ~ {item.travel_end_date}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === '신청 내역') {
      if (applications.length === 0) return <Text style={styles.empty}>신청한 동행이 없습니다.</Text>;
      return (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CompanionDetail', { companionId: item.companion_id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{item.companions?.destination ?? '여행지'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}22` }]}>
                  <Text style={[styles.statusBadgeText, { color: STATUS_COLOR[item.status] }]}>
                    {STATUS_LABEL[item.status]}
                  </Text>
                </View>
              </View>
              {item.companions && (
                <Text style={styles.cardMeta}>
                  {item.companions.travel_start_date} ~ {item.companions.travel_end_date}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === '북마크') {
      if (bookmarks.length === 0) return <Text style={styles.empty}>저장한 항목이 없습니다.</Text>;
      return (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (item.target_type === 'restaurant') {
                  navigation.navigate('RestaurantDetail', { restaurantId: item.target_id });
                } else {
                  navigation.navigate('CompanionDetail', { companionId: item.target_id });
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Ionicons
                  name={item.target_type === 'restaurant' ? 'restaurant-outline' : 'airplane-outline'}
                  size={15}
                  color={Colors.textMedium}
                />
                <Text style={styles.cardTitle}>
                  {item.target_type === 'restaurant' ? '맛집' : '동행 구인'}
                </Text>
              </View>
              <Text style={styles.cardMeta}>{new Date(item.created_at).toLocaleDateString('ko-KR')} 저장</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.profile as [string, string, ...string[]]}
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
        <Text style={styles.headerTitle}>내 활동</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.screenPad,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: {},
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
  headerTitle: { fontSize: 18, fontWeight: '800' as const, color: '#fff' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' as const },
  tabTextActive: { color: Colors.primary, fontWeight: '700' as const },

  listPad: { padding: Spacing.screenPad, gap: 10 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 14,
    ...Shadow.card,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 12, color: Colors.textLight },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, color: Colors.amber, fontWeight: '600' as const },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' as const },

  empty: { textAlign: 'center', marginTop: 60, fontSize: 14, color: Colors.textLight },
});
