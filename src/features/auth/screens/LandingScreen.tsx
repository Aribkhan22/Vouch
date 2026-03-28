import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AuthScreenProps } from '@navigation/types';
import SafeScreen from '@components/common/SafeScreen';
import AppButton from '@components/common/AppButton';
import { COLORS, SPACING } from '@utils/constants';

export default function LandingScreen({ navigation }: AuthScreenProps<'Landing'>) {
  return (
    <SafeScreen style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <Text style={styles.appName}>Vouch</Text>
        <Text style={styles.tagline}>
          Connect with verified Lawyers & CAs{'\n'}you can trust
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '✓', text: 'Verified professionals only' },
          { icon: '⚡', text: 'Direct service requests' },
          { icon: '💬', text: 'Real-time secure chat' },
        ].map(f => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          style={styles.primaryBtn}
        />
        <AppButton
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          style={styles.ghostBtn}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actions: {
    gap: SPACING.sm,
  },
  primaryBtn: {
    width: '100%',
  },
  ghostBtn: {
    width: '100%',
  },
});
