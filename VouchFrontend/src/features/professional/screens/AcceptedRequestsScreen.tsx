import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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

const STATUS_COLOR: Record<string, string> = {
  ACCEPTED: '#2563EB',
  CLOSED: '#6B7280',
  REJECTED: '#DC2626',
};

export default function AcceptedRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const [openingChat, setOpeningChat] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myJobs'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
  });

  const allJobs = data ?? [];
  const activeJobs = allJobs.filter(r => r.status === 'ACCEPTED');
  const historyJobs = allJobs.filter(r => r.status === 'CLOSED' || r.status === 'REJECTED');

  const sections = [
    { title: 'Active Jobs', data: activeJobs },
    { title: 'History', data: historyJobs },
  ].filter(s => s.data.length > 0);

  const handleOpenChat = async (item: ServiceRequest) => {
    setOpeningChat(item._id);
    try {
      const chatRes = await chatApi.getByRequest(item._id);
      const chat = chatRes.data.data;
      navigation.navigate('Chat', { chatId: chat._id, requestId: item._id });
    } catch {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    } finally {
      setOpeningChat(null);
    }
  };

  const handleRequestEnd = async (requestId: string) => {
    Alert.alert(
      'End Service',
      'Request to end this service? The startup must also confirm before it is closed.',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Request End',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await requestApi.requestEnd(requestId);
              await qc.invalidateQueries({ queryKey: ['myJobs'] });
              const updated = res.data.data;
              if (updated.status === 'CLOSED') {
                Alert.alert(
                  '✅ Service Completed',
                  'Both parties have confirmed. The service has been marked as complete.',
                );
              } else {
                Alert.alert(
                  '⏳ Request Sent',
                  'Your end-service request has been sent. Waiting for the startup to confirm.',
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to request end.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.sub}>Active and completed jobs</Text>
      </View>

      {isLoading ? (
        <AppLoader />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }: { item: ServiceRequest }) => (
            <View style={[styles.card, item.status === 'CLOSED' && styles.cardMuted]}>
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

              {item.startupCompanyName ? (
                <View style={styles.startupRow}>
                  <Text style={styles.startupCompany}>🏢 {item.startupCompanyName}</Text>
                  {item.startupPersonName ? (
                    <Text style={styles.startupPerson}>👤 {item.startupPersonName}</Text>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.meta}>
                <Text style={styles.metaText}>📍 {item.city}</Text>
                <Text style={styles.metaText}>💰 {item.budgetRange}</Text>
              </View>

              {item.status === 'CLOSED' && (
                <View style={styles.closedBox}>
                  <Text style={styles.closedText}>✅ Service completed</Text>
                </View>
              )}

              {item.status === 'REJECTED' && item.rejectionReason ? (
                <View style={styles.rejectedBox}>
                  <Text style={styles.rejectedLabel}>❌ Rejected</Text>
                  <Text style={styles.rejectedReason}>"{item.rejectionReason}"</Text>
                </View>
              ) : null}

              {item.status === 'ACCEPTED' && (
                <TouchableOpacity
                  style={[styles.chatBtn, openingChat === item._id && styles.chatBtnDisabled]}
                  onPress={() => handleOpenChat(item)}
                  disabled={openingChat !== null}>
                  {openingChat === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.chatBtnText}>💬  Open Chat</Text>
                  )}
                </TouchableOpacity>
              )}

              {item.status === 'ACCEPTED' && (
                item.endRequestedByProfessional && !item.endRequestedByStartup ? (
                  <View style={styles.pendingEndBox}>
                    <Text style={styles.pendingEndText}>⏳ Waiting for startup to confirm end of service…</Text>
                  </View>
                ) : item.endRequestedByStartup && !item.endRequestedByProfessional ? (
                  <View style={styles.confirmEndBox}>
                    <Text style={styles.confirmEndText}>The startup has requested to end this service.</Text>
                    <TouchableOpacity
                      style={styles.confirmEndBtn}
                      onPress={() => handleRequestEnd(item._id)}>
                      <Text style={styles.confirmEndBtnText}>Confirm &amp; End Service</Text>
                    </TouchableOpacity>
                  </View>
                ) : !item.endRequestedByProfessional ? (
                  <TouchableOpacity
                    style={styles.endServiceBtn}
                    onPress={() => handleRequestEnd(item._id)}>
                    <Text style={styles.endServiceBtnText}>End Service</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No jobs yet</Text>
              <Text style={styles.emptyText}>Browse open requests and accept one to get started.</Text>
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
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: SPACING.sm,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardMuted: {
    opacity: 0.75,
    elevation: 0,
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
  startupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
  },
  startupCompany: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  startupPerson: { fontSize: 13, color: COLORS.textSecondary },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 20 },
  meta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  closedBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: SPACING.xs,
  },
  closedText: { fontSize: 13, color: '#166534', fontWeight: '600', textAlign: 'center' },
  rejectedBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectedLabel: { fontSize: 12, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  rejectedReason: { fontSize: 13, color: '#7F1D1D', fontStyle: 'italic' },
  chatBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  chatBtnDisabled: { backgroundColor: COLORS.border },
  chatBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  endServiceBtn: {
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  endServiceBtnText: { fontSize: 13, color: '#DC2626', fontWeight: '700' },
  pendingEndBox: {
    backgroundColor: '#FEF9C3',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingEndText: { fontSize: 12, color: '#92400E', fontWeight: '600', textAlign: 'center' },
  confirmEndBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
  },
  confirmEndText: { fontSize: 13, color: '#9F1239', fontWeight: '600', marginBottom: SPACING.xs, textAlign: 'center' },
  confirmEndBtn: {
    backgroundColor: '#DC2626',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  confirmEndBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
