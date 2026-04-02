import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabaseClient';
import { apiFetch } from '../../services/apiClient';
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../utils/theme';

interface ItineraryItem {
  id: string;
  destination: string;
  duration_days: number;
  travelers_count: number;
  budget_range: string;
  created_at: string;
}

export default function MyItinerariesScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/itineraries/`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      Alert.alert('오류', '일정 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]));

  const handlePress = async (item: ItineraryItem) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await apiFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/itineraries/${item.id}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error();
      const full = await res.json();
      navigation.navigate('ItineraryResult', { itinerary: { ...full, is_cached: false } });
    } catch {
      Alert.alert('오류', '일정을 불러올 수 없습니다.');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.ai as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>저장된 일정</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress(item)}
              activeOpacity={0.85}
            >
              <View style={styles.cardAccentBar} />
              <View style={styles.cardLeft}>
                <LinearGradient
                  colors={Gradients.ai as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconWrap}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                </LinearGradient>
                <View style={styles.cardInfo}>
                  <Text style={styles.destination}>{item.destination}</Text>
                  <Text style={styles.meta}>
                    {item.duration_days}일 · {item.travelers_count}명 · {item.budget_range}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.border} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>저장된 일정이 없습니다</Text>
              <Text style={styles.emptyHint}>AI 일정을 생성하면 자동으로 저장됩니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: Spacing.screenPad,
    gap: 8,
  },
  backBtn: { alignSelf: 'flex-start' },
  headerTitle: { fontSize: 22, fontWeight: '800' as const, color: '#fff' },

  loader: { marginTop: 60 },
  listContent: { padding: 14, paddingBottom: 48 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.card,
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.purple,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, marginLeft: 8 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  destination: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  meta: { fontSize: 13, color: Colors.textMedium },
  date: { fontSize: 11, color: Colors.textLight },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textMedium },
  emptyHint: { fontSize: 13, color: Colors.textLight },
});
