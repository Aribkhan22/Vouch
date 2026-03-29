/**
 * sharedStyles.ts
 *
 * Central place for visual styles shared across screens.
 * Change a value here and it instantly applies everywhere that imports it.
 */
import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from './constants';

// ---------------------------------------------------------------------------
// Profile screen layout (both StartupProfileScreen & ProfessionalProfileScreen)
// ---------------------------------------------------------------------------
export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  // Coloured banner at top
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  bannerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  bannerEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  bannerRole: {
    marginTop: SPACING.xs,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bannerRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Cards / info rows
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  cardValueMuted: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Action buttons area
  actions: {
    marginTop: 'auto' as any,
    gap: SPACING.sm,
  },
  // Sign out button — danger tint
  signOutBtn: {
    borderColor: COLORS.error,
  },
  signOutBtnText: {
    color: COLORS.error,
  },
});

// ---------------------------------------------------------------------------
// Shared screen header (title + subtitle pattern)
// ---------------------------------------------------------------------------
export const screenHeaderStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});
