import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StartupTabParamList, StartupStackParamList } from './types';
import { COLORS } from '@utils/constants';
import { requestApi } from '@api/request.api';
import { ServiceRequest } from '@types/index';

// Screens
import DirectoryScreen from '@features/startup/screens/DirectoryScreen';
import MyRequestsScreen from '@features/startup/screens/MyRequestsScreen';
import StartupProfileScreen from '@features/startup/screens/StartupProfileScreen';
import ProfessionalDetailScreen from '@features/startup/screens/ProfessionalDetailScreen';
import CreateRequestScreen from '@features/startup/screens/CreateRequestScreen';
import ChatScreen from '@features/chat/screens/ChatScreen';

const Tab = createBottomTabNavigator<StartupTabParamList>();
const Stack = createNativeStackNavigator<StartupStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Directory: '🔍',
  MyRequests: '📋',
  Profile: '👤',
};

function StartupTabs() {
  // Badge: show count of ACCEPTED requests (startup needs to open the chat)
  const { data: requests } = useQuery({
    queryKey: ['myRequests'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
    refetchInterval: 30_000,
  });
  const acceptedCount = (requests ?? []).filter(r => r.status === 'ACCEPTED').length || undefined;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarBadgeStyle: { backgroundColor: COLORS.error, fontSize: 10, minWidth: 16, height: 16 },
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>
              {TAB_ICONS[route.name]}
            </Text>
          </View>
        ),
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            Directory: 'Find Pro',
            MyRequests: 'Requests',
            Profile: 'Profile',
          };
          return <Text style={{ color, fontSize: 11, marginBottom: 2 }}>{labels[route.name]}</Text>;
        },
      })}>
      <Tab.Screen name="Directory" component={DirectoryScreen} />
      <Tab.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{ tabBarBadge: acceptedCount }}
      />
      <Tab.Screen name="Profile" component={StartupProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StartupNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StartupTabs" component={StartupTabs} />
      <Stack.Screen name="ProfessionalDetail" component={ProfessionalDetailScreen} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
