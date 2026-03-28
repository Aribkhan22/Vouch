import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { requestApi } from '@api/request.api';
import RequestCard from '@components/request/RequestCard';
import AppLoader from '@components/common/AppLoader';
import SafeScreen from '@components/common/SafeScreen';
import { COLORS, SPACING } from '@utils/constants';

export default function OpenRequestsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['openRequests'],
    queryFn: () => requestApi.open().then(r => r.data.data),
  });

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Open Jobs</Text>
        <Text style={styles.sub}>Requests from startups needing help</Text>
      </View>
      {isLoading ? <AppLoader /> : (
        <FlatList
          data={data?.results ?? []}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RequestCard request={item} actionLabel="Accept Job" onAction={() => requestApi.accept(item._id)} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No open requests right now.</Text>}
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  list: { padding: SPACING.md },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
});
