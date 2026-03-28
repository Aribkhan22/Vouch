import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthScreenProps } from '@navigation/types';
import SafeScreen from '@components/common/SafeScreen';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import ErrorMessage from '@components/common/ErrorMessage';
import { startupApi } from '@api/startup.api';
import { professionalApi } from '@api/professional.api';
import { COLORS, SPACING } from '@utils/constants';

// ---- STARTUP schema ----
const startupSchema = z.object({
  companyName: z.string().min(2, 'Required'),
  industry: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  description: z.string().min(10, 'Min 10 characters'),
});

// ---- PROFESSIONAL schema ----
const professionalSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  experienceYears: z
    .string()
    .min(1, 'Required')
    .transform(Number)
    .refine(n => n >= 0 && n <= 60, 'Enter 0–60'),
  specializations: z.string().min(1, 'Add at least one specialization'),
  licenseNumber: z.string().min(3, 'Required'),
  feeRange: z.string().optional(),
});

type StartupForm = z.infer<typeof startupSchema>;
type ProfessionalForm = z.infer<typeof professionalSchema>;

export default function OnboardingScreen({ route, navigation }: AuthScreenProps<'Onboarding'>) {
  const { role } = route.params;
  const [apiError, setApiError] = useState<string | null>(null);
  const isStartup = role === 'STARTUP';

  // Startup form
  const startupForm = useForm<StartupForm>({
    resolver: zodResolver(startupSchema),
  });

  // Professional form
  const proForm = useForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
  });

  const handleStartupSubmit = async (data: StartupForm) => {
    setApiError(null);
    try {
      await startupApi.upsertProfile(data);
      Alert.alert('Profile saved!', 'Welcome to Vouch.', [
        { text: 'Continue', onPress: () => navigation.replace('Landing') },
      ]);
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to save profile.');
    }
  };

  const handleProSubmit = async (data: ProfessionalForm) => {
    setApiError(null);
    try {
      await professionalApi.upsertProfile({
        fullName: data.fullName,
        professionType: role as 'LAWYER' | 'CA',
        city: data.city,
        experienceYears: Number(data.experienceYears),
        specializations: data.specializations.split(',').map(s => s.trim()).filter(Boolean),
        licenseNumber: data.licenseNumber,
        feeRange: data.feeRange,
      });
      Alert.alert('Profile saved!', 'Next: upload verification documents.', [
        { text: 'Continue', onPress: () => navigation.replace('Landing') },
      ]);
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to save profile.');
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            {isStartup
              ? 'Tell us about your company'
              : `Tell clients about your ${role.toLowerCase()} practice`}
          </Text>

          <ErrorMessage message={apiError} />

          {isStartup ? (
            <>
              <Controller
                control={startupForm.control}
                name="companyName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Company Name"
                    placeholder="e.g. TechCo Inc"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={startupForm.formState.errors.companyName?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={startupForm.control}
                name="industry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Industry"
                    placeholder="e.g. SaaS, FinTech, EdTech"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={startupForm.formState.errors.industry?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={startupForm.control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="City"
                    placeholder="e.g. Mumbai"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={startupForm.formState.errors.city?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={startupForm.control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="About your company"
                    placeholder="What does your company do? What legal help do you need?"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={startupForm.formState.errors.description?.message}
                    multiline
                    numberOfLines={4}
                    style={styles.multiline}
                    autoCapitalize="sentences"
                  />
                )}
              />
              <AppButton
                title="Save Profile"
                onPress={startupForm.handleSubmit(handleStartupSubmit)}
                loading={startupForm.formState.isSubmitting}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <Controller
                control={proForm.control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Full Name"
                    placeholder="e.g. Riya Sharma"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.fullName?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={proForm.control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="City"
                    placeholder="e.g. Delhi"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.city?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={proForm.control}
                name="experienceYears"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Years of Experience"
                    placeholder="e.g. 6"
                    keyboardType="number-pad"
                    value={value?.toString()}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.experienceYears?.message}
                  />
                )}
              />
              <Controller
                control={proForm.control}
                name="specializations"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Specializations (comma separated)"
                    placeholder="TRADEMARK, CONTRACT_REVIEW, IP_PROTECTION"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.specializations?.message}
                    autoCapitalize="characters"
                  />
                )}
              />
              <Controller
                control={proForm.control}
                name="licenseNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="License Number"
                    placeholder="e.g. DL/LAW/2018/001"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.licenseNumber?.message}
                    autoCapitalize="characters"
                  />
                )}
              />
              <Controller
                control={proForm.control}
                name="feeRange"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Fee Range (optional)"
                    placeholder="e.g. ₹5k–₹20k"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={proForm.formState.errors.feeRange?.message}
                  />
                )}
              />
              <AppButton
                title="Save Profile"
                onPress={proForm.handleSubmit(handleProSubmit)}
                loading={proForm.formState.isSubmitting}
                style={styles.submitBtn}
              />
            </>
          )}

          <AppButton
            title="Skip for now"
            onPress={() => navigation.replace('Landing')}
            variant="ghost"
            style={styles.skipBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  multiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitBtn: { width: '100%', marginTop: SPACING.sm },
  skipBtn: { marginTop: SPACING.sm, width: '100%' },
});
