import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';
import EyeIcon from '@components/common/EyeIcon';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LandingScreen({ navigation }: AuthScreenProps<'Landing'>) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await login(data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) {
        setApiError('Incorrect email or password. Please try again.');
      } else if (status === 404) {
        setApiError('No account found with this email.');
      } else if (status === 429) {
        setApiError('Too many attempts. Please wait a moment and try again.');
      } else {
        setApiError(msg ?? 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <SafeScreen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>V</Text>
            </View>
            <Text style={styles.appName}>Vouch</Text>
            <Text style={styles.tagline}>Connect with verified Lawyers & CAs</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <ErrorMessage message={apiError} />

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
                  placeholder="Your password"
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
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.signInBtn}
            />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to our </Text>
            <Text style={styles.link}>Terms of Service</Text>
            <Text style={styles.footerText}> and </Text>
            <Text style={styles.link}>Privacy Policy</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  signInBtn: {
    marginTop: SPACING.md,
    width: '100%',
  },
  createAccountBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: '#F0F9FF',
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  eyeIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  link: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
