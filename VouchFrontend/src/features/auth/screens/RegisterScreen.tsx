import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthScreenProps } from '@navigation/types';
import SafeScreen from '@components/common/SafeScreen';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import ErrorMessage from '@components/common/ErrorMessage';
import { useAuth } from '@hooks/useAuth';
import { COLORS, SPACING } from '@utils/constants';
import EyeIcon from '@components/common/EyeIcon';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Must contain letters and numbers'),
  role: z.enum(['STARTUP', 'LAWYER', 'CA']),
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  { value: 'STARTUP', label: 'Startup', desc: 'I need legal / CA services' },
  { value: 'LAWYER', label: 'Lawyer', desc: 'I provide legal services' },
  { value: 'CA', label: 'CA', desc: 'I provide accounting services' },
] as const;

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { register } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STARTUP' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const { user, accessToken, refreshToken } = await register(data);
      navigation.replace('Onboarding', {
        role: user.role as 'STARTUP' | 'LAWYER' | 'CA',
        user,
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Vouch to get started</Text>

          <ErrorMessage message={apiError} />

          {/* Role selector */}
          <Text style={styles.roleLabel}>I AM A</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, selectedRole === r.value && styles.roleCardActive]}
                onPress={() => setValue('role', r.value)}>
                <Text style={[styles.roleTitle, selectedRole === r.value && styles.roleTitleActive]}>
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.role ? <Text style={styles.fieldError}>{errors.role.message}</Text> : null}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Full Name / Company Name"
                placeholder="e.g. TechCo Inc or Riya Sharma"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.name?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Password"
                placeholder="Min 8 chars, letters + numbers"
                secureTextEntry={!showPassword}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={8}>
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                }
              />
            )}
          />

          <AppButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: SPACING.md,
  },
  backBtn: { marginBottom: SPACING.xl },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: {
    fontSize: 28,
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
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.surface,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    marginTop: -SPACING.sm,
  },
  submitBtn: { marginTop: SPACING.sm, width: '100%' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  eyeIcon: { fontSize: 18, color: COLORS.textMuted },
});
