import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestApi } from '@api/request.api';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import ErrorMessage from '@components/common/ErrorMessage';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING, SERVICE_CATEGORIES, CATEGORY_LABELS } from '@utils/constants';
import { ServiceCategory } from '@types/index';
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.back} onPress={() => navigation.goBack()}>← Back</Text>
          <Text style={styles.title}>New Service Request</Text>

          <ErrorMessage message={apiError} />

          <Text style={styles.label}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {SERVICE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}
                onPress={() => setValue('category', c as ServiceCategory)}>
                <Text style={[styles.catText, selectedCategory === c && styles.catTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.md, paddingTop: SPACING.lg },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  catScroll: { marginBottom: SPACING.md },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.surface },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  catTextActive: { color: '#fff' },
  multiline: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
  btn: { width: '100%', marginTop: SPACING.sm },
});
