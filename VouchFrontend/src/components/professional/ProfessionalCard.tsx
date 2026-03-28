import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalProfile } from '@types/index';
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';
import VerifiedBadge from './VerifiedBadge';

interface ProfessionalCardProps {
  profile: ProfessionalProfile;
  onPress: () => void;
}

export default function ProfessionalCard({ profile, onPress }: ProfessionalCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.meta}>
            {profile.professionType} · {profile.city}
          </Text>
        </View>
        {profile.isVerified && <VerifiedBadge size="sm" />}
      </View>

      <View style={styles.specs}>
        <Text style={styles.spec}>{profile.experienceYears} yrs exp</Text>
        {profile.feeRange ? <Text style={styles.spec}>{profile.feeRange}</Text> : null}
      </View>

      <View style={styles.tags}>
        {profile.specializations.slice(0, 3).map(s => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  specs: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  spec: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
