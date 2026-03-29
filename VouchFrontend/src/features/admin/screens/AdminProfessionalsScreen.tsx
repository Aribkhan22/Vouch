import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import ErrorMessage from '@components/common/ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@api/admin.api';
import { ProfessionalProfile } from '@types/index';
import { COLORS, SPACING } from '@utils/constants';

type Filter = 'ALL' | 'LAWYER' | 'CA';

export default function AdminProfessionalsScreen() {
  const [filter, setFilter] = useState<Filter>('ALL');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminProfessionals', filter],
    queryFn: () =>
      adminApi
        .listProfessionals(filter === 'ALL' ? undefined : filter)
        .then(r => r.data.data),
  });

  const items: ProfessionalProfile[] = (data as any)?.results ?? [];

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>All Lawyers & CAs</Text>

        {/* Filter pills */}
        <View style={styles.filters}>
          {(['ALL', 'LAWYER', 'CA'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>
                {f === 'ALL' ? 'All' : f === 'LAWYER' ? '⚖️ Lawyers' : '📊 CAs'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <ErrorMessage message="Failed to load professionals" /> : null}

        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item._id}
            onRefresh={refetch}
            refreshing={isLoading}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.empty}>No professionals found</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>
                      {item.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          item.professionType === 'LAWYER'
                            ? styles.lawyerBadge
                            : styles.caBadge,
                        ]}>
                        <Text style={styles.typeTxt}>{item.professionType}</Text>
                      </View>
                      {item.isVerified ? (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedTxt}>✓ Verified</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingTxt}>⏳ Unverified</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Detail rows */}
                <View style={styles.details}>
                  <Text style={styles.detail}>📍 {item.city}</Text>
                  <Text style={styles.detail}>🎓 {item.experienceYears} yrs experience</Text>
                  {item.feeRange ? (
                    <Text style={styles.detail}>💰 {item.feeRange}</Text>
                  ) : null}
                  {item.licenseNumber ? (
                    <Text style={styles.detail}>🪪 {item.licenseNumber}</Text>
                  ) : null}
                  {(item.specializations ?? []).length > 0 ? (
                    <Text style={styles.specs}>
                      {item.specializations.map(s => s.replace(/_/g, ' ')).join(' · ')}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  filters: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTxt: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTxtActive: { color: '#fff' },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  lawyerBadge: { backgroundColor: '#EEF2FF' },
  caBadge: { backgroundColor: '#F0FDF4' },
  typeTxt: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
  },
  verifiedTxt: { fontSize: 11, fontWeight: '600', color: COLORS.verified },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  pendingTxt: { fontSize: 11, fontWeight: '600', color: COLORS.warning },
  details: { gap: 4 },
  detail: { fontSize: 13, color: COLORS.textSecondary },
  specs: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
