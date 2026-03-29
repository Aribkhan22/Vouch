import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { requestApi } from '@api/request.api';
import { chatApi } from '@api/chat.api';
import AppLoader from '@components/common/AppLoader';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING, BORDER_RADIUS, CATEGORY_LABELS } from '@utils/constants';
import { ServiceRequest } from '@types/index';
import { ProfessionalStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfessionalStackParamList>;

export default function OpenRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const [accepting, setAccepting] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['openRequests'],
    queryFn: () => requestApi.open().then(r => r.data.data),
  });

  const handleAccept = async (item: ServiceRequest) => {
    setAccepting(item._id);
    try {
      await requestApi.accept(item._id);
      // Invalidate both lists so UI stays fresh
      qc.invalidateQueries({ queryKey: ['openRequests'] });
      qc.invalidateQueries({ queryKey: ['myJobs'] });
      // Chat was created by the backend during accept — fetch it immediately
      const chatRes = await chatApi.getByRequest(item._id);
      const chat = chatRes.data.data;
      navigation.navigate('Chat', { chatId: chat._id, requestId: item._id });
    } catch (err: any) {
      Alert.alert(
        'Cannot Accept',
        err?.response?.data?.message ?? 'Failed to accept. Please try again.',
      );
    } finally {
      setAccepting(null);
    }
  };

  const requests: ServiceRequest[] = (data as any)?.results ?? [];

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Open Jobs</Text>
        <Text style={styles.sub}>Requests from startups needing help</Text>
      </View>

      {isLoading ? (
        <AppLoader />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.category} numberOfLines={1}>
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </Text>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>OPEN</Text>
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.meta}>
                <Text style={styles.metaText}>📍 {item.city}</Text>
                <Text style={styles.metaText}>💰 {item.budgetRange}</Text>
              </View>

              <TouchableOpacity
                style={[styles.acceptBtn, accepting === item._id && styles.acceptBtnDisabled]}
                onPress={() => handleAccept(item)}
                disabled={accepting !== null}>
                {accepting === item._id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.acceptBtnText}>✓  Accept Job</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No open jobs right now</Text>
              <Text style={styles.emptyText}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  openBadge: {
    backgroundColor: '#05996920',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: SPACING.sm,
  },
  openBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 20 },
  meta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  acceptBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  acceptBtnDisabled: { backgroundColor: COLORS.border },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
