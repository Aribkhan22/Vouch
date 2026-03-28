import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import { useAuth } from '@hooks/useAuth';
import AppButton from '@components/common/AppButton';
import { COLORS, SPACING } from '@utils/constants';
import { ProfessionalScreenProps } from '@navigation/types';

export default function ProfessionalProfileScreen({ navigation }: ProfessionalScreenProps<'ProfessionalTabs'>) {
  const { user, logout } = useAuth();
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
        <AppButton title="Upload Verification Docs" onPress={() => navigation.navigate('VerificationUpload')} variant="outline" style={styles.verifyBtn} />
        <AppButton title="Sign Out" onPress={logout} variant="ghost" style={styles.btn} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  role: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.xl },
  verifyBtn: { marginBottom: SPACING.sm },
  btn: { marginTop: 'auto' as any },
});
