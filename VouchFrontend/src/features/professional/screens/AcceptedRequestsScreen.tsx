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
import { useQuery } from '@tanstack/react-query';
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

export default function AcceptedRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const [openingChat, setOpeningChat] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myJobs'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
  });

  // Only ACCEPTED requests (OPEN ones belong to startup's MyRequestsScreen)
  const jobs = (data ?? []).filter(r => r.status === 'ACCEPTED');

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

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>My Accepted Jobs</Text>
        <Text style={styles.sub}>Jobs you have taken on</Text>
      </View>

      {isLoading ? (
        <AppLoader />
      ) : (
        <FlatList
          data={jobs}
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
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedBadgeText}>ACCEPTED</Text>
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.meta}>
                <Text style={styles.metaText}>📍 {item.city}</Text>
                <Text style={styles.metaText}>💰 {item.budgetRange}</Text>
              </View>

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
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No accepted jobs yet</Text>
              <Text style={styles.emptyText}>Browse open jobs and accept one to get started.</Text>
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
  acceptedBadge: {
    backgroundColor: '#2563EB20',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: SPACING.sm,
  },
  acceptedBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 20 },
  meta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  chatBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  chatBtnDisabled: { backgroundColor: COLORS.border },
  chatBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
