import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import SafeScreen from '@components/common/SafeScreen';
import AppButton from '@components/common/AppButton';
import AppLoader from '@components/common/AppLoader';
import ErrorMessage from '@components/common/ErrorMessage';
import { COLORS, SPACING } from '@utils/constants';
import { professionalApi } from '@api/professional.api';

export default function VerificationUploadScreen({ navigation }: any) {
  const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickDocuments = async () => {
    try {
      const results = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf, DocumentPicker.types.images], allowMultiSelection: true });
      setFiles(prev => {
        const combined = [...prev, ...results];
        return combined.slice(0, 3);
      });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setError('Failed to pick document');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one document');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', { uri: file.uri, type: file.type ?? 'application/octet-stream', name: file.name ?? 'document' } as any);
      });
      await professionalApi.submitVerification(formData);
      Alert.alert('Submitted', 'Your verification documents have been submitted for review.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AppLoader message="Uploading documents..." />;

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Verification Upload</Text>
        <Text style={styles.subtitle}>Upload up to 3 documents (PDF or images) for professional verification.</Text>

        <ErrorMessage message={error} />

        <AppButton title={`Pick Documents (${files.length}/3)`} onPress={pickDocuments} variant="outline" style={styles.pickBtn} disabled={files.length >= 3} />

        <FlatList
          data={files}
          keyExtractor={(_, i) => String(i)}
          style={styles.list}
          renderItem={({ item, index }) => (
            <View style={styles.fileRow}>
              <Text style={styles.fileName} numberOfLines={1}>{item.name ?? 'Document'}</Text>
              <TouchableOpacity onPress={() => removeFile(index)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <AppButton title="Submit for Verification" onPress={handleSubmit} style={styles.submitBtn} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  pickBtn: { marginBottom: SPACING.md },
  list: { flex: 1 },
  fileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fileName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, marginRight: SPACING.sm },
  remove: { fontSize: 13, color: COLORS.error, fontWeight: '600' },
  submitBtn: { marginTop: SPACING.md },
});
