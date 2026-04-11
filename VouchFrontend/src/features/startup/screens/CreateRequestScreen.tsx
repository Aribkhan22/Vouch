import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { requestApi } from '@api/request.api';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import ErrorMessage from '@components/common/ErrorMessage';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING, SERVICE_CATEGORIES, CATEGORY_LABELS } from '@utils/constants';
import { ServiceCategory, ServiceRequest } from '@types/index';
import { StartupScreenProps } from '@navigation/types';

const schema = z.object({
  category: z.enum(SERVICE_CATEGORIES),
  description: z.string().min(20, 'Min 20 characters'),
  city: z.string().min(2, 'Required'),
  budgetRange: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

export default function CreateRequestScreen({ navigation }: StartupScreenProps<'CreateRequest'>) {
  const [apiError, setApiError] = useState<string | null>(null);

  // Check for existing active requests
  const { data: myReqs } = useQuery({
    queryKey: ['myRequests'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
  });
  const activeRequest = (myReqs ?? []).find(r => r.status === 'OPEN' || r.status === 'ACCEPTED');

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'TRADEMARK' },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await requestApi.create(data);
      navigation.goBack();
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to create request.');
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.back} onPress={() => navigation.goBack()}>← Back</Text>
          <Text style={styles.title}>New Service Request</Text>

          {/* Block if already has active request */}
          {activeRequest ? (
            <View style={styles.blockedCard}>
              <Text style={styles.blockedTitle}>⚠️ Active Request Exists</Text>
              <Text style={styles.blockedText}>
                You already have an active {activeRequest.status === 'OPEN' ? 'open' : 'accepted'} request.
                You can create a new one once it is rejected or closed.
              </Text>
              <TouchableOpacity style={styles.blockedBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.blockedBtnText}>← Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ErrorMessage message={apiError} />

          {!activeRequest ? (
            <>
          <Text style={styles.label}>⚖️  LAWYER SERVICES</Text>
          <View style={styles.catWrap}>
            {(['CONTRACT_REVIEW', 'TRADEMARK', 'LITIGATION', 'IP_PROTECTION', 'DUE_DILIGENCE'] as ServiceCategory[]).map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}
                onPress={() => setValue('category', c)}>
                <Text style={[styles.catText, selectedCategory === c && styles.catTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: SPACING.sm }]}>📊  CA SERVICES</Text>
          <View style={styles.catWrap}>
            {(['COMPANY_INCORPORATION', 'TAX_FILING', 'COMPLIANCE', 'OTHER'] as ServiceCategory[]).map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}
                onPress={() => setValue('category', c)}>
                <Text style={[styles.catText, selectedCategory === c && styles.catTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller control={control} name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="Describe what you need" placeholder="Min 20 characters..." value={value} onBlur={onBlur} onChangeText={onChange} error={errors.description?.message} multiline numberOfLines={4} style={styles.multiline} autoCapitalize="sentences" />
            )} />

          <Controller control={control} name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="City" placeholder="e.g. Mumbai" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.city?.message} autoCapitalize="words" />
            )} />

          <Controller control={control} name="budgetRange"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="Budget Range" placeholder="e.g. ₹10k–₹30k" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.budgetRange?.message} />
            )} />

          <AppButton title="Submit Request" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.btn} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.md, paddingTop: SPACING.lg },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  blockedCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  blockedTitle: { fontSize: 15, fontWeight: '800', color: '#92400E', marginBottom: 6 },
  blockedText: { fontSize: 14, color: '#78350F', lineHeight: 20, marginBottom: SPACING.md },
  blockedBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#92400E',
    borderRadius: 8,
  },
  blockedBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.surface },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  catTextActive: { color: '#fff' },
  multiline: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
  btn: { width: '100%', marginTop: SPACING.sm },
});
