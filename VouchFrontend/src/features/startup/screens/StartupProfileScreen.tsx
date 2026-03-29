import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import { useAuth } from '@hooks/useAuth';
import AppButton from '@components/common/AppButton';
import { COLORS, SPACING } from '@utils/constants';
import { profileStyles } from '@utils/sharedStyles';
import { useQuery } from '@tanstack/react-query';
import { startupApi } from '@api/startup.api';

export default function StartupProfileScreen() {
  const { user, logout } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['startupProfile', user?.id],
    queryFn: () => startupApi.getProfile(user!.id),
    enabled: !!user?.id,
    select: (res) => res.data.data,
  });

  const displayName = profile?.companyName ?? user?.name ?? '';

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
            <Text style={profileStyles.bannerRoleText}>STARTUP</Text>
          </View>
        </View>

        {/* Account info (always available) */}
        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Full Name</Text>
          <Text style={profileStyles.cardValue}>{user?.name ?? '—'}</Text>
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

        {/* Company profile */}
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
        ) : profile ? (
          <>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>Company Name</Text>
              <Text style={profileStyles.cardValue}>{profile.companyName}</Text>
            </View>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>Industry</Text>
              <Text style={profileStyles.cardValue}>{profile.industry}</Text>
            </View>
            <View style={profileStyles.card}>
              <Text style={profileStyles.cardLabel}>City</Text>
              <Text style={profileStyles.cardValue}>{profile.city}</Text>
            </View>
            {profile.description ? (
              <View style={profileStyles.card}>
                <Text style={profileStyles.cardLabel}>About</Text>
                <Text style={profileStyles.cardValueMuted}>{profile.description}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={[profileStyles.card, { borderColor: COLORS.warning }]}>
            <Text style={[profileStyles.cardValueMuted, { color: COLORS.warning }]}>
              Company profile not set up yet.
            </Text>
          </View>
        )}

        <View style={profileStyles.actions}>
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
