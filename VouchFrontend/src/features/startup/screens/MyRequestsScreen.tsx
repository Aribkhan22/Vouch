import React, { useCallback, useState } from 'react';
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
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING, BORDER_RADIUS, CATEGORY_LABELS } from '@utils/constants';
import { ServiceRequest, AssignedProfessional } from '@types/index';
import { StartupStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<StartupStackParamList>;

const STATUS_COLOR: Record<string, string> = {
  OPEN: '#059669',
  ACCEPTED: '#2563EB',
  CLOSED: '#6B7280',
};

export default function MyRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const [chatLoading, setChatLoading] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myRequests'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
  });

  const handleOpenChat = useCallback(async (requestId: string) => {
    setChatLoading(requestId);
    try {
      const res = await chatApi.getByRequest(requestId);
      const chat = res.data.data;
      navigation.navigate('Chat', { chatId: chat._id, requestId });
    } catch {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    } finally {
      setChatLoading(null);
    }
  }, [navigation]);

  const handleClose = useCallback(async (requestId: string) => {
    Alert.alert('Close Request', 'Mark this request as closed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestApi.close(requestId);
            qc.invalidateQueries({ queryKey: ['myRequests'] });
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to close request.');
          }
        },
      },
    ]);
  }, [qc]);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('CreateRequest', {})}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item: ServiceRequest) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }: { item: ServiceRequest }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.category} numberOfLines={1}>
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${STATUS_COLOR[item.status]}22` }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              {/* Assigned professional info — only visible on ACCEPTED cards */}
              {item.status === 'ACCEPTED' && item.assignedProfessional ? (
                <View style={styles.proRow}>
                  <View style={styles.proAvatar}>
                    <Text style={styles.proAvatarText}>
                      {item.assignedProfessional.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.proInfo}>
                    <Text style={styles.proName}>{item.assignedProfessional.fullName}</Text>
                    <Text style={styles.proMeta}>
                      {item.assignedProfessional.professionType}
                      {'  ·  '}
                      📍 {item.assignedProfessional.city}
                      {item.assignedProfessional.feeRange ? `  ·  💰 ${item.assignedProfessional.feeRange}` : ''}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.meta}>
                  <Text style={styles.metaText}>📍 {item.city}</Text>
                  <Text style={styles.metaText}>💰 {item.budgetRange}</Text>
                </View>
              )}

              {item.status === 'ACCEPTED' && (
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => handleOpenChat(item._id)}
                  disabled={chatLoading === item._id}>
                  {chatLoading === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.chatBtnText}>💬  Open Chat</Text>
                  )}
                </TouchableOpacity>
              )}

              {item.status === 'OPEN' && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => handleClose(item._id)}>
                  <Text style={styles.closeBtnText}>Close Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.emptyText}>
                Tap + New to post your first service request.
              </Text>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  newBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  loader: { marginTop: 40 },
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
  badge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: SPACING.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 20 },
  meta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  // Professional info row on ACCEPTED cards
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  proAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  proAvatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  proInfo: { flex: 1 },
  proName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  proMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  chatBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  chatBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  closeBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  closeBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
