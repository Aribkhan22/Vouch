import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING } from '@utils/constants';

export default function AcceptedRequestsScreen() {
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>My Accepted Jobs</Text>
        <Text style={styles.sub}>Jobs you have accepted will appear here.</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textSecondary },
});
