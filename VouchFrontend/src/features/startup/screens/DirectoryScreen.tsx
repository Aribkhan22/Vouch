import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { professionalApi } from '@api/professional.api';
import ProfessionalCard from '@components/professional/ProfessionalCard';
import AppLoader from '@components/common/AppLoader';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING } from '@utils/constants';
import { StartupScreenProps } from '@navigation/types';

export default function DirectoryScreen({ navigation }: StartupScreenProps<'StartupTabs'>) {
  const [cityInput, setCityInput] = React.useState('');
  const [city, setCity] = React.useState('');
  const [type, setType] = React.useState<'LAWYER' | 'CA' | undefined>(undefined);

  // Debounce city input — search 500ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => setCity(cityInput.trim()), 500);
    return () => clearTimeout(timer);
  }, [cityInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['directory', city, type],
    queryFn: () =>
      professionalApi
        .listDirectory({ city: city || undefined, type, verified: false })
        .then(r => r.data.data),
  });

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Professional</Text>
        <TextInput
          style={styles.search}
          placeholder="🔍  Filter by city..."
          placeholderTextColor={COLORS.textMuted}
          value={cityInput}
          onChangeText={setCityInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        <View style={styles.typeRow}>
          {([undefined, 'LAWYER', 'CA'] as const).map(t => (
            <TouchableOpacity
              key={String(t)}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}>
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === undefined ? 'All' : t === 'LAWYER' ? '⚖️  Lawyer' : '🧾  CA'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <AppLoader />
      ) : (
        <FlatList
          data={data?.results ?? []}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProfessionalCard
              profile={item}
              onPress={() => navigation.navigate('ProfessionalDetail', { userId: item.userId })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No professionals found.</Text>
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  search: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 14, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
});
