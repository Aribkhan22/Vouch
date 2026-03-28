export const ROLES = {
  STARTUP: 'STARTUP',
  LAWYER: 'LAWYER',
  CA: 'CA',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const VERIFY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type VerifyStatus = (typeof VERIFY_STATUS)[keyof typeof VERIFY_STATUS];

export const REQUEST_STATUS = {
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  CLOSED: 'CLOSED',
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

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

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
