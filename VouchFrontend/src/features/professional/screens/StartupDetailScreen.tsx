import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { ProfessionalStackParamList } from '@navigation/types';
import { ServiceRequest } from '@types/index';

type Nav = NativeStackNavigationProp<ProfessionalStackParamList>;

export default function StartupDetailScreen({ route }: any) {
  const { requestId } = route.params as { requestId: string };
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [accepting, setAccepting] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ reason: string } | null>(null);
  const [rejecting, setRejecting] = useState(false);

  // Fetch enriched open requests and find this one (avoid a separate endpoint)
  const { data: openData, isLoading: loadingRequests } = useQuery({
    queryKey: ['openRequests'],
    queryFn: () => requestApi.open().then(r => r.data.data),
  });

  const request: (ServiceRequest & { startupCompanyName?: string; startupPersonName?: string }) | undefined =
    (openData as any)?.results?.find((r: ServiceRequest) => r._id === requestId);

  // Fetch startup profile using the startup's userId
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['startupProfile', request?.createdByStartupUserId],
    queryFn: () => requestApi.getStartupProfile(request!.createdByStartupUserId).then(r => r.data.data),
    enabled: !!request?.createdByStartupUserId,
  });

  const handleAccept = async () => {
    if (!request) return;
    setAccepting(true);
    try {
      await requestApi.accept(request._id);
      qc.invalidateQueries({ queryKey: ['openRequests'] });
      qc.invalidateQueries({ queryKey: ['myJobs'] });
      const chatRes = await chatApi.getByRequest(request._id);
      const chat = chatRes.data.data;
      navigation.replace('Chat', { chatId: chat._id, requestId: request._id });
    } catch (err: any) {
      Alert.alert('Cannot Accept', err?.response?.data?.message ?? 'Failed to accept.');
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!request || !rejectModal?.reason.trim()) return;
    setRejecting(true);
    try {
      await requestApi.reject(request._id, rejectModal.reason.trim());
      qc.invalidateQueries({ queryKey: ['openRequests'] });
      setRejectModal(null);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to reject.');
    } finally {
      setRejecting(false);
    }
  };

  if (loadingRequests || loadingProfile) return <AppLoader message="Loading..." />;
  if (!request) {
    return (
      <SafeScreen>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Request not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  const profile = profileData;

  return (
    <SafeScreen style={{ paddingBottom: 0 }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Startup identity card */}
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(request.startupCompanyName ?? profile?.companyName ?? 'S').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.companyName}>
            {request.startupCompanyName ?? profile?.companyName ?? 'Startup'}
          </Text>
          {(request.startupPersonName ?? profile?.personName) ? (
            <Text style={styles.personName}>
              👤 {request.startupPersonName ?? profile?.personName}
            </Text>
          ) : null}
          {profile?.email ? (
            <Text style={styles.email}>{profile.email}</Text>
          ) : null}
        </View>

        {/* Startup profile details */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            {profile.industry ? <Text style={styles.detail}>🏭 Industry: {profile.industry}</Text> : null}
            {profile.city ? <Text style={styles.detail}>📍 City: {profile.city}</Text> : null}
            {profile.description ? <Text style={styles.desc}>{profile.description}</Text> : null}
          </View>
        )}

        {/* Request details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Request</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[request.category] ?? request.category}</Text>
          </View>
          <Text style={styles.detail}>📍 {request.city}</Text>
          <Text style={styles.detail}>💰 {request.budgetRange}</Text>
          <Text style={styles.reqDesc}>{request.description}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.acceptBtn, accepting && styles.btnDisabled]}
            onPress={handleAccept}
            disabled={accepting}>
            {accepting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>✓  Accept Job</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setRejectModal({ reason: '' })}
            disabled={accepting}>
            <Text style={styles.rejectBtnText}>✕  Reject Job</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                onChangeText={r => setRejectModal({ reason: r })}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setRejectModal(null)}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmRejectBtn, (!rejectModal.reason.trim() || rejecting) && styles.btnDisabled]}
                  disabled={!rejectModal.reason.trim() || rejecting}
                  onPress={handleRejectConfirm}>
                  {rejecting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.confirmRejectTxt}>Confirm Reject</Text>
                  )}
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
  topBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  identityCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  companyName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  personName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  email: { fontSize: 13, color: COLORS.textMuted },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  detail: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 4 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  categoryText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  reqDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: SPACING.sm },
  actions: { gap: SPACING.sm, marginTop: SPACING.md },
  acceptBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  notFoundText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.md },
  backLink: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
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
