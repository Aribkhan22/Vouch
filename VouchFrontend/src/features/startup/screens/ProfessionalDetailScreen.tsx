import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { professionalApi } from '@api/professional.api';
import AppLoader from '@components/common/AppLoader';
import VerifiedBadge from '@components/professional/VerifiedBadge';
import AppButton from '@components/common/AppButton';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';
import { StartupScreenProps } from '@navigation/types';

export default function ProfessionalDetailScreen({
  route,
  navigation,
}: StartupScreenProps<'ProfessionalDetail'>) {
  const { userId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['professional', userId],
    queryFn: () => professionalApi.getProfile(userId).then(r => r.data.data),
  });

  if (isLoading) return <AppLoader fullScreen />;
  if (!data) return null;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>← Back</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{data.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{data.fullName}</Text>
          <Text style={styles.meta}>{data.professionType} · {data.city}</Text>
          {data.isVerified && <VerifiedBadge />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detail}>{data.experienceYears} years experience</Text>
          {data.feeRange ? <Text style={styles.detail}>Fee: {data.feeRange}</Text> : null}
          <Text style={styles.detail}>License: {data.licenseNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.tags}>
            {data.specializations.map(s => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        </View>

        <AppButton
          title="Create Service Request"
          onPress={() => navigation.navigate('CreateRequest', { professionalUserId: userId })}
          style={styles.cta}
        />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.md },
  topBar: { marginBottom: SPACING.md },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  card: { alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  meta: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  section: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  detail: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cta: { marginTop: SPACING.md, width: '100%' },
});
