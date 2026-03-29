import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import StartupNavigator from './StartupNavigator';
import ProfessionalNavigator from './ProfessionalNavigator';
import AdminNavigator from './AdminNavigator';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setAuth, setLoading } from '@store/authSlice';
import { tokenStorage } from '@utils/tokenStorage';
import { authApi } from '@api/auth.api';
import { COLORS } from '@utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector(s => s.auth);

  // Bootstrap: check if tokens exist in keychain, validate with /me
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!accessToken || !refreshToken) {
          dispatch(setLoading(false));
          return;
        }
        const { data } = await authApi.me();
        dispatch(setAuth({ user: data.data, accessToken, refreshToken }));
      } catch {
        await tokenStorage.clearTokens();
        dispatch(setLoading(false));
      }
    };
    bootstrap();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'STARTUP' ? (
        <Stack.Screen name="StartupApp" component={StartupNavigator} />
      ) : user?.role === 'ADMIN' ? (
        <Stack.Screen name="AdminApp" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="ProfessionalApp" component={ProfessionalNavigator} />
      )}
    </Stack.Navigator>
  );
}
