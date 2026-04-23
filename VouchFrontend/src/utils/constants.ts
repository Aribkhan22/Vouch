// const DEV_HOST = '192.168.0.109'; // Physical device – use your machine's LAN IP
const DEV_HOST = '10.0.2.2'; // Android emulator loopback
export const API_BASE_URL = `http://${DEV_HOST}:5000/api/v1`;
export const SOCKET_URL = `http://${DEV_HOST}:5000`;

export const SERVICE_CATEGORIES = [
  'CONTRACT_REVIEW',
  'COMPANY_INCORPORATION',
  'TRADEMARK',
  'TAX_FILING',
  'COMPLIANCE',
  'LITIGATION',
  'IP_PROTECTION',
  'DUE_DILIGENCE',
  'OTHER',
] as const;

export const LAWYER_CATEGORIES = [
  'CONTRACT_REVIEW', 'TRADEMARK', 'LITIGATION', 'IP_PROTECTION', 'DUE_DILIGENCE', 'OTHER',
] as const;

export const CA_CATEGORIES = [
  'COMPANY_INCORPORATION', 'TAX_FILING', 'COMPLIANCE', 'OTHER',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  CONTRACT_REVIEW: 'Contract Review',
  COMPANY_INCORPORATION: 'Company Incorporation',
  TRADEMARK: 'Trademark',
  TAX_FILING: 'Tax Filing',
  COMPLIANCE: 'Compliance',
  LITIGATION: 'Litigation',
  IP_PROTECTION: 'IP Protection',
  DUE_DILIGENCE: 'Due Diligence',
  OTHER: 'Other',
};

export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#10B981',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  verified: '#059669',
  divider: '#F3F4F6',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};
