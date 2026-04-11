import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SafeScreen from '@components/common/SafeScreen';
import AppLoader from '@components/common/AppLoader';
import ErrorMessage from '@components/common/ErrorMessage';
import { adminApi } from '@api/admin.api';
import { COLORS, SPACING } from '@utils/constants';
import { VerificationRequest } from '@types/index';

export default function AdminDashboardScreen() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ id: string; note: string } | null>(null);
  const [docsModal, setDocsModal] = useState<{ name: string; urls: string[] } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['verifications', 'PENDING'],
    queryFn: () => adminApi.listVerifications('PENDING').then(r => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['verifications'] }),
    onError: () => Alert.alert('Error', 'Failed to approve verification'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminApi.reject(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      setRejectModal(null);
    },
    onError: () => Alert.alert('Error', 'Failed to reject verification'),
  });

  const confirmApprove = (id: string, name: string) => {
    Alert.alert(
      'Approve Verification',
      `Approve ${name}'s profile? This will mark them as verified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveMutation.mutate(id) },
      ],
    );
  };

  if (isLoading) return <AppLoader message="Loading verifications..." />;

  const items: VerificationRequest[] = (data as any) ?? [];

  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) ||
    url.startsWith('https://res.cloudinary.com');

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Pending Verifications</Text>
        {error ? <ErrorMessage message="Failed to load verifications" /> : null}
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No pending verifications</Text>}
          renderItem={({ item }) => {
            const profName = (item.professionalUserId as any)?.name ?? 'Professional';
            return (
              <View style={styles.card}>
                <Text style={styles.name}>{profName}</Text>
                <Text style={styles.email}>{(item.professionalUserId as any)?.email}</Text>

                {/* Documents section */}
                <Text style={styles.docsLabel}>
                  📎 {item.docUrls?.length ?? 0} document(s) submitted
                </Text>
                {(item.docUrls ?? []).length > 0 && (
                  <View style={styles.docList}>
                    {item.docUrls.map((url, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.docChip}
                        onPress={() => Linking.openURL(url)}>
                        <Text style={styles.docChipText}>
                          {isImage(url) ? '🖼️' : '📄'} Document {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.viewAllBtn}
                      onPress={() => setDocsModal({ name: profName, urls: item.docUrls })}>
                      <Text style={styles.viewAllTxt}>👁 Preview All</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.approveBtn, approveMutation.isPending && styles.btnDisabled]}
                    disabled={approveMutation.isPending}
                    onPress={() => confirmApprove(item._id, profName)}>
                    <Text style={styles.approveTxt}>✔ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectBtn, rejectMutation.isPending && styles.btnDisabled]}
                    disabled={rejectMutation.isPending}
                    onPress={() => setRejectModal({ id: item._id, note: '' })}>
                    <Text style={styles.rejectTxt}>✘ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* Reject with note modal */}
      {rejectModal && (
        <Modal transparent animationType="fade" onRequestClose={() => setRejectModal(null)}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Reject Verification</Text>
              <Text style={styles.modalSubtitle}>Provide a reason (required):</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. Documents are unclear or expired..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                value={rejectModal.note}
                onChangeText={note => setRejectModal(prev => prev ? { ...prev, note } : null)}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setRejectModal(null)}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmRejectBtn,
                    (!rejectModal.note.trim() || rejectMutation.isPending) && styles.btnDisabled,
                  ]}
                  disabled={!rejectModal.note.trim() || rejectMutation.isPending}
                  onPress={() =>
                    rejectMutation.mutate({ id: rejectModal.id, note: rejectModal.note.trim() })
                  }>
                  <Text style={styles.confirmRejectTxt}>Confirm Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Document preview modal */}
      {docsModal && (
        <Modal transparent animationType="slide" onRequestClose={() => setDocsModal(null)}>
          <View style={styles.overlay}>
            <View style={styles.docsModalContainer}>
              <View style={styles.docsModalHeader}>
                <Text style={styles.docsModalTitle}>
                  Documents — {docsModal.name}
                </Text>
                <TouchableOpacity onPress={() => setDocsModal(null)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.docsScroll}>
                {docsModal.urls.map((url, idx) => (
                  <View key={idx} style={styles.docPreviewCard}>
                    <Text style={styles.docPreviewLabel}>Document {idx + 1}</Text>
                    {isImage(url) ? (
                      <Image
                        source={{ uri: url }}
                        style={styles.docImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.openDocBtn}
                        onPress={() => Linking.openURL(url)}>
                        <Text style={styles.openDocTxt}>📄 Open Document</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.openOriginalBtn}
                      onPress={() => Linking.openURL(url)}>
                      <Text style={styles.openOriginalTxt}>↗ Open in Browser</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.xl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  docsLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  docList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.sm },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  docChipText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  viewAllBtn: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  viewAllTxt: { fontSize: 13, color: '#15803D', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  approveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  rejectTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  // Reject modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
  },
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
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  cancelTxt: { fontWeight: '600', color: COLORS.textSecondary },
  confirmRejectBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  confirmRejectTxt: { color: '#fff', fontWeight: '700' },
  // Docs preview modal
  docsModalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
  },
  docsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  docsModalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  closeBtn: { fontSize: 18, color: COLORS.textSecondary, paddingLeft: SPACING.sm },
  docsScroll: { padding: SPACING.md, gap: SPACING.md },
  docPreviewCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  docPreviewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  docImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: SPACING.sm },
  openDocBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  openDocTxt: { color: '#1D4ED8', fontWeight: '600', fontSize: 14 },
  openOriginalBtn: { alignItems: 'center', paddingVertical: 6 },
  openOriginalTxt: { color: COLORS.textMuted, fontSize: 12, textDecorationLine: 'underline' },
});
