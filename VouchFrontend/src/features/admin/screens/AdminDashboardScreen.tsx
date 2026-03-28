import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SafeScreen from '@components/common/SafeScreen';
import AppLoader from '@components/common/AppLoader';
import ErrorMessage from '@components/common/ErrorMessage';
import { adminApi } from '@api/admin.api';
import { COLORS, SPACING } from '@utils/constants';
import { VerificationRequest } from '@types/index';

export default function AdminDashboardScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['verifications', 'PENDING'],
    queryFn: () => adminApi.listVerifications('PENDING'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['verifications'] }),
    onError: () => Alert.alert('Error', 'Failed to approve verification'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['verifications'] }),
    onError: () => Alert.alert('Error', 'Failed to reject verification'),
  });

  const confirmAction = (id: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approve Verification' : 'Reject Verification',
      `Are you sure you want to ${action} this verification request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action === 'approve' ? 'Approve' : 'Reject', style: action === 'reject' ? 'destructive' : 'default', onPress: () => action === 'approve' ? approveMutation.mutate(id) : rejectMutation.mutate(id) },
      ]
    );
  };

  if (isLoading) return <AppLoader message="Loading verifications..." />;

  const items: VerificationRequest[] = (data as any)?.data ?? [];

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Pending Verifications</Text>
        {error ? <ErrorMessage message="Failed to load verifications" /> : null}
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No pending verifications</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.professional?.name ?? 'Professional'}</Text>
              <Text style={styles.email}>{item.professional?.email}</Text>
              <Text style={styles.docs}>{item.documents?.length ?? 0} document(s) submitted</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => confirmAction(item._id, 'approve')}>
                  <Text style={styles.approveTxt}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => confirmAction(item._id, 'reject')}>
                  <Text style={styles.rejectTxt}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.xl },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  docs: { fontSize: 12, color: COLORS.placeholder, marginBottom: SPACING.sm },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  approveBtn: { flex: 1, backgroundColor: COLORS.success, borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center' },
  approveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: COLORS.error, borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center' },
  rejectTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
