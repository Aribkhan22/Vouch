import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import { useAuth } from '@hooks/useAuth';
import AppButton from '@components/common/AppButton';
import { COLORS, SPACING } from '@utils/constants';
import { profileStyles } from '@utils/sharedStyles';
import { useQuery } from '@tanstack/react-query';
import { professionalApi } from '@api/professional.api';
import { ProfessionalScreenProps } from '@navigation/types';

export default function LawyerProfileScreen({ navigation }: ProfessionalScreenProps<'ProfessionalTabs'>) {
  const { user, logout } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['professionalProfile', user?.id],
    queryFn: () => professionalApi.getProfile(user!.id),
    enabled: !!user?.id,
    select: (res) => res.data.data,
  });

  const displayName = profile?.fullName ?? user?.name ?? '';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={profileStyles.container} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={profileStyles.banner}>
          <View style={profileStyles.avatarCircle}>
            <Text style={profileStyles.avatarLetter}>
              {(displayName || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={profileStyles.bannerName}>{displayName}</Text>
          <Text style={profileStyles.bannerEmail}>{user?.email}</Text>
          <View style={profileStyles.bannerRole}>
            <Text style={profileStyles.bannerRoleText}>LAWYER</Text>
          </View>
        </View>

        {/* Account info */}
        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Full Name</Text>
          <Text style={profileStyles.cardValue}>{user?.name ?? displayName ?? '—'}</Text>
        </View>
        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Email</Text>
          <Text style={profileStyles.cardValue}>{user?.email ?? '—'}</Text>
        </View>
        {memberSince ? (
          <View style={profileStyles.card}>
            <Text style={profileStyles.cardLabel}>Member Since</Text>
            <Text style={profileStyles.cardValue}>{memberSince}</Text>
          </View>
        ) : null}

        {/* Professional profile */}
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
        ) : profile ? (
          <>
            {profile.isVerified ? (
              <View style={[profileStyles.card, { borderColor: COLORS.verified }]}>
                <Text style={[profileStyles.cardLabel, { color: COLORS.verified }]}>Status</Text>
                <Text style={[profileStyles.cardValue, { color: COLORS.verified }]}>✓ Verified Professional</Text>
              </View>
            ) : (
              <View style={[profileStyles.card, { borderColor: COLORS.warning }]}>
                <Text style={[profileStyles.cardLabel, { color: COLORS.warning }]}>Status</Text>
                <Text style={[profileStyles.cardValue, { color: COLORS.warning }]}>⏳ Verification Pending</Text>
              </View>
            )}
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>Profession</Text>
              <Text style={profileStyles.cardValue}>{profile.professionType}</Text>
            </View>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>City</Text>
              <Text style={profileStyles.cardValue}>{profile.city}</Text>
            </View>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>Experience</Text>
              <Text style={profileStyles.cardValue}>{profile.experienceYears} years</Text>
            </View>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>License Number</Text>
              <Text style={profileStyles.cardValue}>{profile.licenseNumber}</Text>
            </View>
            {profile.feeRange ? (
              <View style={profileStyles.card}>
                <Text style={profileStyles.cardLabel}>Fee Range</Text>
                <Text style={profileStyles.cardValue}>{profile.feeRange}</Text>
              </View>
            ) : null}
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>Practice Areas</Text>
              <Text style={profileStyles.cardValueMuted}>Contract Review · Trademark · Litigation · IP Protection · Due Diligence</Text>
            </View>
            {(profile.specializations ?? []).length > 0 ? (
              <View style={profileStyles.card}>
                <Text style={profileStyles.cardLabel}>Specializations</Text>
                <Text style={profileStyles.cardValueMuted}>
                  {(profile.specializations ?? []).map(s => s.replace(/_/g, ' ')).join(' · ')}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={[profileStyles.card, { borderColor: COLORS.warning }]}>
            <Text style={[profileStyles.cardValueMuted, { color: COLORS.warning }]}>
              Professional profile not set up yet.
            </Text>
          </View>
        )}

        <View style={profileStyles.actions}>
          <AppButton
            title="Upload Verification Docs"
            onPress={() => navigation.navigate('VerificationUpload')}
            variant="outline"
          />
          <AppButton
            title="Sign Out"
            onPress={logout}
            variant="outline"
            style={profileStyles.signOutBtn}
            textStyle={profileStyles.signOutBtnText}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
