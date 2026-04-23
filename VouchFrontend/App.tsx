import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { store } from '@store/index';
import RootNavigator from '@navigation/RootNavigator';
import { COLORS } from '@utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function App() {
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.textPrimary,
      border: COLORS.border,
      primary: COLORS.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
