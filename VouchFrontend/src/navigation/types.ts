// Navigation type definitions for type-safe routing
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User } from '../types';

// --- Auth Stack ---
export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: {
    role: 'STARTUP' | 'LAWYER' | 'CA';
    user: User;
    accessToken: string;
    refreshToken: string;
  };
};

// --- Startup Bottom Tabs ---
export type StartupTabParamList = {
  Directory: undefined;
  MyRequests: undefined;
  Profile: undefined;
};

// --- Startup Stack (inside each tab) ---
export type StartupStackParamList = {
  StartupTabs: undefined;
  ProfessionalDetail: { userId: string };
  CreateRequest: { professionalUserId?: string };
  Chat: { requestId: string; chatId: string };
};

// --- Professional Bottom Tabs ---
export type ProfessionalTabParamList = {
  OpenRequests: undefined;
  MyAccepted: undefined;
  Profile: undefined;
};

// --- Professional Stack ---
export type ProfessionalStackParamList = {
  ProfessionalTabs: undefined;
  VerificationUpload: undefined;
  Chat: { requestId: string; chatId: string };
};

// --- Admin Bottom Tabs ---
export type AdminTabParamList = {
  Verifications: undefined;
  Professionals: undefined;
  AdminProfile: undefined;
};

// --- Admin Stack ---
export type AdminStackParamList = {
  AdminTabs: undefined;
};

// --- Root Navigator ---
export type RootStackParamList = {
  Auth: undefined;
  StartupApp: undefined;
  ProfessionalApp: undefined;
  AdminApp: undefined;
};

// Screen prop helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;
export type StartupScreenProps<T extends keyof StartupStackParamList> = NativeStackScreenProps<
  StartupStackParamList,
  T
>;
export type ProfessionalScreenProps<
  T extends keyof ProfessionalStackParamList,
> = NativeStackScreenProps<ProfessionalStackParamList, T>;
export type AdminScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<
  AdminStackParamList,
  T
>;
