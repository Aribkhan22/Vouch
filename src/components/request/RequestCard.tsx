import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ServiceRequest } from '@types/index';
import { COLORS, SPACING, BORDER_RADIUS, CATEGORY_LABELS } from '@utils/constants';

interface RequestCardProps {
  request: ServiceRequest;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#059669',
  ACCEPTED: '#2563EB',
  CLOSED: '#6B7280',
};

export default function RequestCard({ request, onPress, actionLabel, onAction }: RequestCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.category}>{CATEGORY_LABELS[request.category] ?? request.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[request.status]}20` }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[request.status] }]}>
            {request.status}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {request.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.meta}>{request.city}</Text>
        <Text style={styles.meta}>{request.budgetRange}</Text>
      </View>

      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
