import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import { useAuth } from '@hooks/useAuth';
import AppButton from '@components/common/AppButton';
import { profileStyles } from '@utils/sharedStyles';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();

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
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={profileStyles.bannerName}>{user?.name ?? 'Admin'}</Text>
          <Text style={profileStyles.bannerEmail}>{user?.email}</Text>
          <View style={profileStyles.bannerRole}>
            <Text style={profileStyles.bannerRoleText}>ADMIN</Text>
          </View>
        </View>

        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Full Name</Text>
          <Text style={profileStyles.cardValue}>{user?.name ?? '—'}</Text>
        </View>
        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Email</Text>
          <Text style={profileStyles.cardValue}>{user?.email ?? '—'}</Text>
        </View>
        <View style={profileStyles.card}>
          <Text style={profileStyles.cardLabel}>Role</Text>
          <Text style={profileStyles.cardValue}>Administrator</Text>
        </View>
        {memberSince ? (
          <View style={profileStyles.card}>
            <Text style={profileStyles.cardLabel}>Member Since</Text>
            <Text style={profileStyles.cardValue}>{memberSince}</Text>
          </View>
        ) : null}

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
