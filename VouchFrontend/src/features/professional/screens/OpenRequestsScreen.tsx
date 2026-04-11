import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
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
  const [rejectModal, setRejectModal] = useState<{ requestId: string; reason: string } | null>(null);
  const [rejecting, setRejecting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['openRequests'],
    queryFn: () => requestApi.open().then(r => r.data.data),
  });

  const handleAccept = async (item: ServiceRequest) => {
    setAccepting(item._id);
    try {
      await requestApi.accept(item._id);
      qc.invalidateQueries({ queryKey: ['openRequests'] });
      qc.invalidateQueries({ queryKey: ['myJobs'] });
      const chatRes = await chatApi.getByRequest(item._id);
      const chat = chatRes.data.data;
      navigation.navigate('Chat', { chatId: chat._id, requestId: item._id });
    } catch (err: any) {
      Alert.alert('Cannot Accept', err?.response?.data?.message ?? 'Failed to accept. Please try again.');
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal || !rejectModal.reason.trim()) return;
    setRejecting(true);
    try {
      await requestApi.reject(rejectModal.requestId, rejectModal.reason.trim());
      qc.invalidateQueries({ queryKey: ['openRequests'] });
      setRejectModal(null);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to reject. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  const requests: ServiceRequest[] = (data as any)?.results ?? [];

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Open Jobs</Text>
        <Text style={styles.sub}>Tap a card to view startup profile</Text>
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
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('StartupDetail', { requestId: item._id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.category} numberOfLines={1}>
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </Text>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>OPEN</Text>
                </View>
              </View>

              {/* Startup info */}
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

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.acceptBtn, accepting === item._id && styles.btnDisabled]}
                  onPress={() => handleAccept(item)}
                  disabled={accepting !== null}>
                  {accepting === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.acceptBtnText}>✓ Accept</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => setRejectModal({ requestId: item._id, reason: '' })}
                  disabled={accepting !== null}>
                  <Text style={styles.rejectBtnText}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No open jobs right now</Text>
              <Text style={styles.emptyText}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <Modal transparent animationType="fade" onRequestClose={() => setRejectModal(null)}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Reason for Rejection</Text>
              <Text style={styles.modalSubtitle}>This will be shown to the startup:</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. Outside my area of expertise..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                value={rejectModal.reason}
                onChangeText={r => setRejectModal(prev => prev ? { ...prev, reason: r } : null)}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setRejectModal(null)}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmRejectBtn, (!rejectModal.reason.trim() || rejecting) && styles.btnDisabled]}
                  disabled={!rejectModal.reason.trim() || rejecting}
                  onPress={handleRejectConfirm}>
                  {rejecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.confirmRejectTxt}>Confirm Reject</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center' },
  cancelTxt: { fontWeight: '600', color: COLORS.textSecondary },
  confirmRejectBtn: { flex: 1, backgroundColor: COLORS.error, borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center' },
  confirmRejectTxt: { color: '#fff', fontWeight: '700' },
});
